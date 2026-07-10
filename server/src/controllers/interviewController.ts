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
    const { applicationId, interviewerId, scheduledAt } = validatedData;

    // Check if Application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

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
      status: 'scheduled'
    });

    const currentStage = application.stage;

    // Update Application stage to interview_scheduled
    application.stage = 'interview_scheduled';
    await application.save();

    // Log the stage change
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { 
        from: currentStage, 
        to: 'interview_scheduled',
        interviewer: interviewer.name,
        scheduledAt: new Date(scheduledAt)
      }
    });

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

    const query: any = {};

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
