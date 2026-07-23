import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Interview } from '../models/Interview';
import { Scorecard } from '../models/Scorecard';
import { uploadToCloudinary, performCloudinaryUpload, getCloudinaryAssetInfo } from '../config/cloudinary';
import { ApplySchema, RecruiterAddCandidateSchema, RejectApplicationSchema, PipelineStage } from '@hiretrack/shared';
import mongoose from 'mongoose';

export const applyToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF file is required', code: 'BAD_REQUEST' });
    }

    // Convert text values inside req.body if necessary
    const rawExperience = req.body.experience;
    const bodyData = {
      ...req.body,
      experience: rawExperience !== undefined ? Number(rawExperience) : undefined,
      termsAccepted: req.body.termsAccepted === 'true' || req.body.termsAccepted === true
    };

    // Validate request body using expanded ApplySchema
    const validatedData = ApplySchema.parse(bodyData);
    const { jobId, source, experience } = validatedData;

    // Check if Job exists and is open
    const job = await Job.findOne({ _id: jobId, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found', code: 'NOT_FOUND' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job posting is closed', code: 'BAD_REQUEST' });
    }

    // Gating check for experience requirements
    if (job.minExperience > 0 && experience < job.minExperience) {
      const eligibilityMsg = experience === 0 
        ? `You are not eligible for this position. This role requires a minimum of ${job.minExperience} years of experience (Freshers are not eligible).`
        : `You are not eligible for this position. This role requires a minimum of ${job.minExperience} years of experience.`;

      return res.status(400).json({
        message: eligibilityMsg,
        code: 'EXPERIENCE_MISMATCH'
      });
    }

    // Check for existing active application (non-terminal stage)
    const existingActiveApp = await Application.findOne({
      candidate: new mongoose.Types.ObjectId(req.user.id),
      job: new mongoose.Types.ObjectId(jobId),
      stage: { $nin: ['hired', 'rejected'] }
    });

    if (existingActiveApp) {
      return res.status(400).json({
        message: 'You already have an active application for this position.',
        code: 'ACTIVE_APPLICATION_EXISTS'
      });
    }

    // Upload resume to Cloudinary
    const uploadResult = await performCloudinaryUpload(req.file.buffer, req.file.originalname);
    const resumeUrl = uploadResult.secure_url;

    // Create the application document
    const application = await Application.create({
      candidate: new mongoose.Types.ObjectId(req.user.id),
      job: new mongoose.Types.ObjectId(jobId),
      source: source || 'careers_page',
      stage: 'applied',
      resumeUrl,
      cloudinaryPublicId: uploadResult.public_id || '',
      cloudinaryAssetId: uploadResult.asset_id || '',
      cloudinaryResourceType: uploadResult.resource_type || 'raw',
      cloudinaryType: uploadResult.type || 'upload',
      resumeSnapshotAt: new Date(),
      phone: validatedData.phone,
      country: validatedData.country,
      address: validatedData.address,
      experience: validatedData.experience,
      linkedinUrl: validatedData.linkedinUrl,
      githubUrl: validatedData.githubUrl || '',
      portfolioUrl: validatedData.portfolioUrl || '',
      coverLetter: validatedData.coverLetter || '',
      currentCompany: validatedData.currentCompany || '',
      currentTitle: validatedData.currentTitle || '',
      termsAccepted: validatedData.termsAccepted,
      notes: []
    });

    // Write to ActivityLog (polymorphic logs)
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { from: null, to: 'applied' }
    });

    // Populate job details to return the updated record
    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title location status')
      .populate('candidate', 'name email');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Created application document:', {
        id: application._id,
        resumeUrl: application.resumeUrl,
        createdAt: application.createdAt,
      });
    }

    return res.status(201).json(populatedApp);
  } catch (error) {
    return next(error);
  }
};

export const getCandidateApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const applications = await Application.find({
      candidate: new mongoose.Types.ObjectId(req.user.id)
    })
      .sort({ createdAt: -1 })
      .populate('job', 'title location status minExperience maxExperience');

    return res.status(200).json(applications);
  } catch (error) {
    return next(error);
  }
};

// -------------------------------------------------------------
// Recruiter/Admin Application Management Controller Actions
// -------------------------------------------------------------

export const getManageApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Filter by specific job (supports jobId or job parameter)
    const rawJobId = (req.query.jobId || req.query.job) as string;
    if (rawJobId && mongoose.Types.ObjectId.isValid(rawJobId)) {
      query.job = new mongoose.Types.ObjectId(rawJobId);
    }

    // Filter by stage
    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    // Filter by source
    if (req.query.source) {
      query.source = req.query.source;
    }

    // Search by candidate name
    if (req.query.search) {
      const searchStr = req.query.search as string;
      const matchedUsers = await User.find({
        name: { $regex: searchStr, $options: 'i' },
        role: 'candidate'
      }).select('_id');
      
      const userIds = matchedUsers.map(u => u._id);
      query.candidate = { $in: userIds };
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ createdAt: -1, _id: -1 }) // Stable secondary sort on _id
        .skip(skip)
        .limit(limit)
        .populate('candidate', 'name email')
        .populate('job', 'title location status minExperience maxExperience'),
      Application.countDocuments(query)
    ]);

    return res.status(200).json({
      applications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Application ID', code: 'BAD_REQUEST' });
    }

    const application = await Application.findById(id)
      .populate('candidate', 'name email')
      .populate('job', 'title location status minExperience maxExperience')
      .populate('notes.author', 'name email role');

    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    // Fetch related activity log history
    const timeline = await ActivityLog.find({
      entityId: new mongoose.Types.ObjectId(id),
      entityType: 'application'
    })
      .sort({ createdAt: -1 })
      .populate('actor', 'name email role');

    // Fetch all related interviews (Technical and/or HR)
    const interviews = await Interview.find({ 
      application: new mongoose.Types.ObjectId(id)
    }).populate('interviewer', 'name email role');

    const interviewIds = interviews.map(i => i._id);
    const scorecards = await Scorecard.find({
      interview: { $in: interviewIds }
    }).populate('submittedBy', 'name email role');

    return res.status(200).json({
      application,
      timeline,
      interviews,
      scorecards
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Streams raw candidate resume PDF bytes directly with explicit application/pdf headers.
 * Preserves accurate HTTP status codes (200, 404, 401, 502) and diagnostic server logging.
 */
export const streamApplicationResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Load application together with Cloudinary metadata
    const application = await Application.findById(id).select(
      'resumeUrl candidate cloudinaryPublicId cloudinaryResourceType cloudinaryType'
    );

    if (!application || !application.resumeUrl) {
      console.error('[Resume Stream] Application or resume URL not found', { id });
      return res.status(404).json({
        message: 'No resume file associated with this candidate profile',
        code: 'RESUME_NOT_FOUND',
      });
    }

    // Authorization for candidates
    if (
      req.user &&
      req.user.role === 'candidate' &&
      application.candidate?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden: you do not have access to this resume', code: 'FORBIDDEN' });
    }

    // Generate signed URL using stored Cloudinary metadata (5‑minute expiry)
    let fetchUrl = application.resumeUrl;
    if (application.cloudinaryPublicId) {
      const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5 minutes
      try {
        const { v2: cloudinary } = await import('cloudinary');
        const signed = (cloudinary.utils as any).private_download_url(
          application.cloudinaryPublicId,
          'pdf',
          {
            resource_type: application.cloudinaryResourceType || 'raw',
            type: application.cloudinaryType || 'upload',
            expires_at: expiresAt,
          }
        );
        fetchUrl = signed;
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Resume Stream] Using signed URL', { signedUrl: signed });
        }
      } catch (e) {
        console.error('[Resume Stream] Failed to generate signed URL', e);
        // fallback to public URL
      }
    }

    // Stream the PDF (or image) using axios with responseType "stream"
    const axios = (await import('axios')).default;
    const response = await axios.get(fetchUrl, { responseType: 'stream' });

    if (response.status !== 200) {
      console.error('[Resume Stream] Cloudinary returned non‑200', {
        status: response.status,
        url: fetchUrl,
      });
      return res.status(response.status).json({
        message: `Storage provider returned status ${response.status}`,
        code: response.status === 404 ? 'RESUME_NOT_FOUND' : 'RESUME_UNAUTHORIZED',
      });
    }

    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';

    // If client prefers HTML, serve an embed preview
    const acceptHeader = typeof req.headers.accept === 'string' ? req.headers.accept : '';
    if (acceptHeader.includes('text/html')) {
      const previewHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Resume Preview</title></head>
<body style="margin:0;height:100vh;">
  <embed src="${fetchUrl}" type="${contentType}" style="width:100%;height:100%;border:none;" />
</body></html>`;
      res.setHeader('Content-Type', 'text/html');
      return res.send(previewHtml);
    }
    // Otherwise stream the PDF normally
    res.setHeader('Content-Type', contentType.includes('pdf') ? 'application/pdf' : contentType);
    res.setHeader('Content-Disposition', 'inline; filename="candidate-resume.pdf"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    response.data.pipe(res);
  } catch (error) {
    console.error('[Resume Stream Exception]', error);
    return next(error);
  }
};

export const advanceApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Application ID', code: 'BAD_REQUEST' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    const currentStage = application.stage;

    // Recruiter-only Gating Checks:
    // Once a recruiter schedules the Technical Interview, the recruiter can no longer advance that application.
    const isRecruiter = req.user.role === 'recruiter';
    const recruiterRestrictedStages = [
      'technical_interview_scheduled',
      'technical_interview_completed',
      'hr_interview_scheduled',
      'hr_interview_completed',
      'offer',
      'hired',
      'rejected',
      // Include old stages for compatibility
      'interview_scheduled',
      'interview_completed',
      'final_review'
    ];

    if (isRecruiter && recruiterRestrictedStages.includes(currentStage)) {
      return res.status(403).json({
        message: 'Recruiters are not authorized to advance candidates past the Technical Interview scheduling phase.',
        code: 'FORBIDDEN'
      });
    }

    let nextStage: string;

    // Strict Pipeline Stage Progression Rules
    switch (currentStage) {
      case 'applied':
        nextStage = 'resume_screening';
        break;
      case 'resume_screening':
        return res.status(400).json({
          message: 'Please schedule a Technical Interview to advance from Resume Screening.',
          code: 'BAD_REQUEST'
        });
      case 'technical_interview_scheduled':
        return res.status(400).json({
          message: 'An Admin must submit a Technical Scorecard to advance this candidate.',
          code: 'BAD_REQUEST'
        });
      case 'technical_interview_completed':
        return res.status(400).json({
          message: 'An Admin must schedule an HR Interview to advance this candidate.',
          code: 'BAD_REQUEST'
        });
      case 'hr_interview_scheduled':
        return res.status(400).json({
          message: 'An Admin must submit an HR Scorecard to advance this candidate.',
          code: 'BAD_REQUEST'
        });
      case 'hr_interview_completed':
        nextStage = 'offer';
        break;
      case 'offer':
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            message: 'Only admins are authorized to finalize offers and mark applications as hired.',
            code: 'FORBIDDEN'
          });
        }
        nextStage = 'hired';
        break;
      case 'hired':
      case 'rejected':
      default:
        return res.status(400).json({
          message: `Cannot advance application from its current stage: ${currentStage}`,
          code: 'INVALID_STAGE_TRANSITION'
        });
    }

    // Apply advancement
    application.stage = nextStage as any;
    await application.save();

    // Log the action
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { from: currentStage, to: nextStage }
    });

    const updatedApp = await Application.findById(id)
      .populate('candidate', 'name email')
      .populate('job', 'title location status')
      .populate('notes.author', 'name email role');

    return res.status(200).json(updatedApp);
  } catch (error) {
    return next(error);
  }
};

export const rejectApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Application ID', code: 'BAD_REQUEST' });
    }

    const validatedData = RejectApplicationSchema.parse(req.body);

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    const currentStage = application.stage;

    // Recruiter Gating on Rejections
    const isRecruiter = req.user.role === 'recruiter';
    const recruiterRestrictedStages = [
      'technical_interview_scheduled',
      'technical_interview_completed',
      'hr_interview_scheduled',
      'hr_interview_completed',
      'offer',
      'hired',
      'rejected',
      'interview_scheduled',
      'interview_completed',
      'final_review'
    ];

    if (isRecruiter && recruiterRestrictedStages.includes(currentStage)) {
      return res.status(403).json({
        message: 'Recruiters are not authorized to change application status past the Technical Interview scheduling phase.',
        code: 'FORBIDDEN'
      });
    }

    if (currentStage === 'hired' || currentStage === 'rejected') {
      return res.status(400).json({
        message: 'Cannot reject an application that is already closed or hired.',
        code: 'INVALID_STAGE_TRANSITION'
      });
    }

    // Apply rejection
    application.stage = 'rejected';
    application.rejectionReason = validatedData.rejectionReason;
    application.rejectionNote = validatedData.rejectionNote || '';
    await application.save();

    // Log the stage change
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { 
        from: currentStage, 
        to: 'rejected',
        reason: validatedData.rejectionReason,
        note: validatedData.rejectionNote || ''
      }
    });

    const updatedApp = await Application.findById(id)
      .populate('candidate', 'name email')
      .populate('job', 'title location status')
      .populate('notes.author', 'name email role');

    return res.status(200).json(updatedApp);
  } catch (error) {
    return next(error);
  }
};

export const addApplicationNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Application ID', code: 'BAD_REQUEST' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required', code: 'BAD_REQUEST' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    // Append to notes array
    application.notes.push({
      author: new mongoose.Types.ObjectId(req.user.id),
      text: text.trim(),
      createdAt: new Date()
    });
    await application.save();

    // Log action
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'note_added',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { text: text.trim() }
    });

    const updatedApp = await Application.findById(id)
      .populate('candidate', 'name email')
      .populate('job', 'title location status')
      .populate('notes.author', 'name email role');

    return res.status(200).json(updatedApp);
  } catch (error) {
    return next(error);
  }
};

export const recruiterAddCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['recruiter', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only recruiters or admins can manually add candidates', code: 'FORBIDDEN' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF file is required', code: 'BAD_REQUEST' });
    }

    const rawExperience = req.body.experience;
    const bodyData = {
      ...req.body,
      experience: rawExperience !== undefined ? Number(rawExperience) : undefined
    };

    const validatedData = RecruiterAddCandidateSchema.parse(bodyData);
    const {
      jobId,
      name,
      email,
      source,
      phone,
      country,
      address,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      coverLetter,
      currentCompany,
      currentTitle,
      referrerName,
      referrerEmail,
      referralNotes
    } = validatedData;

    // Check if Job exists and is open
    const job = await Job.findOne({ _id: jobId, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found', code: 'NOT_FOUND' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job posting is closed', code: 'BAD_REQUEST' });
    }

    // Find candidate user or create new candidate user
    let candidateUser = await User.findOne({ email: email.toLowerCase() });
    if (!candidateUser) {
      candidateUser = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: '$2a$10$e7xN98Z/Jz86d8oK.y/6y.k7L06xM9o9o9o9o9o9o9o9o9o9o9o9o',
        role: 'candidate',
        isActive: true,
        isEmailVerified: true
      });
    }

    // Check for existing active application for this candidate + job
    const existingActiveApp = await Application.findOne({
      candidate: candidateUser._id,
      job: new mongoose.Types.ObjectId(jobId),
      stage: { $nin: ['hired', 'rejected'] }
    });

    if (existingActiveApp) {
      return res.status(400).json({
        message: 'This candidate already has an active application for this position.',
        code: 'ACTIVE_APPLICATION_EXISTS'
      });
    }

    // Upload resume to Cloudinary
    const uploadResult = await performCloudinaryUpload(req.file.buffer, req.file.originalname);
    const resumeUrl = uploadResult.secure_url;

    // Create Application
    const application = await Application.create({
      candidate: candidateUser._id,
      job: new mongoose.Types.ObjectId(jobId),
      source: source || 'referral',
      stage: 'applied',
      resumeUrl,
      cloudinaryPublicId: uploadResult.public_id || '',
      cloudinaryAssetId: uploadResult.asset_id || '',
      cloudinaryResourceType: uploadResult.resource_type || 'raw',
      cloudinaryType: uploadResult.type || 'upload',
      resumeSnapshotAt: new Date(),
      phone,
      country,
      address,
      experience,
      linkedinUrl,
      githubUrl: githubUrl || '',
      portfolioUrl: portfolioUrl || '',
      coverLetter: coverLetter || '',
      currentCompany: currentCompany || '',
      currentTitle: currentTitle || '',
      termsAccepted: true,
      referrerName: referrerName || '',
      referrerEmail: referrerEmail || '',
      referralNotes: referralNotes || '',
      notes: []
    });

    // Write to ActivityLog
    await ActivityLog.create({
      actor: new mongoose.Types.ObjectId(req.user.id),
      action: 'candidate_added_by_recruiter',
      entityType: 'application',
      entityId: application._id,
      metadata: {
        candidateName: name,
        jobTitle: job.title,
        source: source || 'referral',
        referrerName: referrerName || undefined
      }
    });

    const populatedApp = await Application.findById(application._id)
      .populate('candidate', 'name email')
      .populate('job', 'title location status department');

    return res.status(201).json(populatedApp);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    return next(error);
  }
};
