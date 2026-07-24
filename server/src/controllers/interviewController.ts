import { Request, Response, NextFunction } from 'express';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { ScheduleInterviewSchema } from '@hiretrack/shared';
import mongoose from 'mongoose';

export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const validatedData = ScheduleInterviewSchema.parse(req.body);
    const { applicationId, interviewerId, scheduledAt, type } = validatedData;

    // Check if Application exists and populate Candidate details
    const application = await Application.findById(applicationId).populate('candidate');
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    // Role-based restrictions on scheduling
    if (type === 'technical') {
      // Recruiter or Admin can schedule Technical. Candidate must be in resume_screening.
      if (application.stage !== 'resume_screening') {
        return res.status(400).json({
          message: 'Technical interviews can only be scheduled for candidates in the resume screening stage.',
          code: 'BAD_REQUEST'
        });
      }
    } else if (type === 'hr') {
      // Recruiter or Admin can schedule HR interview when technical interview is completed.
      if (application.stage !== 'technical_interview_completed') {
        return res.status(400).json({
          message: 'HR interviews can only be scheduled once the technical interview is completed.',
          code: 'BAD_REQUEST'
        });
      }
    }

    const candidateUser = application.candidate as any;

    // Check if Interviewer exists and is an Admin
    const interviewer = await User.findById(interviewerId);
    if (!interviewer) {
      return res.status(404).json({ message: 'Interviewer not found', code: 'NOT_FOUND' });
    }

    if (interviewer.role !== 'admin') {
      return res.status(400).json({
        message: 'Interviews can only be assigned to Admin interviewers',
        code: 'BAD_REQUEST'
      });
    }

    // Create the Interview document
    const interview = await Interview.create({
      application: new mongoose.Types.ObjectId(applicationId),
      interviewer: new mongoose.Types.ObjectId(interviewerId),
      scheduledAt: new Date(scheduledAt),
      type,
      status: 'scheduled'
    });

    const currentStage = application.stage;
    const nextStage = type === 'technical' ? 'technical_interview_scheduled' : 'hr_interview_scheduled';

    // Update Application stage
    application.stage = nextStage;
    await application.save();

    // Log the stage change
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { 
        from: currentStage, 
        to: nextStage,
        interviewer: interviewer.name,
        scheduledAt: new Date(scheduledAt),
        interviewType: type
      }
    });

    // Mock candidate email dispatch
    console.log(`\n======================================================`);
    console.log(`✉️ MOCK EMAIL DISPATCH FOR: ${candidateUser?.email || 'unknown@candidate.com'}`);
    console.log(`Subject: ${type === 'technical' ? 'Technical' : 'HR'} Interview Scheduled - HireTrack`);
    console.log(`Interviewer: ${interviewer.name} (${interviewer.email})`);
    console.log(`Date/Time: ${new Date(scheduledAt).toLocaleString()}`);
    console.log(`======================================================\n`);

    const populatedInterview = await Interview.findById(interview._id)
      .populate('interviewer', 'name email role')
      .populate({
        path: 'application',
        populate: [
          { path: 'candidate', select: 'name email' },
          { path: 'job', select: 'title location' }
        ]
      });

    return res.status(201).json(populatedInterview);
  } catch (error) {
    return next(error);
  }
};

export const getAdminInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const query: Record<string, unknown> = {};

    // Gating check: Admins only see their own interviews, Recruiters see all
    if (req.user.role === 'admin') {
      query.interviewer = new mongoose.Types.ObjectId(req.user.id);
    }

    // Status filter
    if (req.query.status === 'scheduled' || req.query.status === 'completed') {
      query.status = req.query.status;
    }

    const interviews = await Interview.find(query)
      .sort({ scheduledAt: 1 })
      .populate('interviewer', 'name email role')
      .populate({
        path: 'application',
        populate: [
          { path: 'candidate', select: 'name email' },
          { path: 'job', select: 'title location' }
        ]
      });

    return res.status(200).json(interviews);
  } catch (error) {
    return next(error);
  }
};
