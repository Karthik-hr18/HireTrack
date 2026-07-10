import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { ActivityLog } from '../models/ActivityLog';
import { uploadToCloudinary } from '../config/cloudinary';
import { ApplySchema } from '@hiretrack/shared';
import mongoose from 'mongoose';

export const applyToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF file is required', code: 'BAD_REQUEST' });
    }

    // Convert text values inside req.body if necessary (experience is sent as string in multipart form-data)
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
