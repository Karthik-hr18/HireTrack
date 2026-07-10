import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Interview } from '../models/Interview';
import { uploadToCloudinary } from '../config/cloudinary';
import { ApplySchema, RejectApplicationSchema, PipelineStage } from '@hiretrack/shared';
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

    // Upload resume to Cloudinary (uploaded as 'image' type for inline browser previews)
    const resumeUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Create the application document
    const application = await Application.create({
      candidate: new mongoose.Types.ObjectId(req.user.id),
      job: new mongoose.Types.ObjectId(jobId),
      source: source || 'careers_page',
      stage: 'applied',
      resumeUrl,
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

    const query: any = {};

    // Filter by specific job
    if (req.query.jobId) {
      query.job = new mongoose.Types.ObjectId(req.query.jobId as string);
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
        .sort({ createdAt: -1 })
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

    // Fetch active interview details if scheduled
    const interview = await Interview.findOne({ 
      application: new mongoose.Types.ObjectId(id),
      status: 'scheduled'
    }).populate('interviewer', 'name email role');

    return res.status(200).json({
      application,
      timeline,
      interview
    });
  } catch (error) {
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
    let nextStage: string;

    // Fixed pipeline stage progression
    switch (currentStage) {
      case 'applied':
        nextStage = 'resume_screening';
        break;
      case 'resume_screening':
        nextStage = 'interview_scheduled';
        break;
      case 'interview_scheduled':
        nextStage = 'interview_completed';
        break;
      case 'interview_completed':
        nextStage = 'final_review';
        break;
      case 'final_review':
        nextStage = 'offer';
        break;
      case 'offer':
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
