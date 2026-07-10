import { Request, Response, NextFunction } from 'express';
import { Scorecard } from '../models/Scorecard';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { ActivityLog } from '../models/ActivityLog';
import { SubmitScorecardSchema } from '@hiretrack/shared';
import mongoose from 'mongoose';

export const submitScorecard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params; // Interview ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Interview ID', code: 'BAD_REQUEST' });
    }

    const validatedData = SubmitScorecardSchema.parse(req.body);
    const { 
      recommendation, 
      comments, 
      ratings,
      communication,
      cultureFit,
      salaryExpectation,
      salaryOffered 
    } = validatedData;

    // Check if Interview exists
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview panel not found', code: 'NOT_FOUND' });
    }

    // Verify current user is an Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admins are authorized to submit a scorecard for this interview.',
        code: 'FORBIDDEN'
      });
    }

    // Verify status is scheduled
    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        message: 'This interview scorecard has already been submitted or completed.',
        code: 'BAD_REQUEST'
      });
    }

    // Retrieve related Application and Candidate
    const application = await Application.findById(interview.application).populate('candidate');
    if (!application) {
      return res.status(404).json({ message: 'Application profile not found', code: 'NOT_FOUND' });
    }

    // Validate recommendation matches interview type
    if (interview.type === 'technical') {
      if (recommendation !== 'pass' && recommendation !== 'reject') {
        return res.status(400).json({
          message: 'Technical scorecard recommendation must be either "pass" or "reject".',
          code: 'BAD_REQUEST'
        });
      }
    } else if (interview.type === 'hr') {
      if (recommendation !== 'hire' && recommendation !== 'reject') {
        return res.status(400).json({
          message: 'HR scorecard recommendation must be either "hire" or "reject".',
          code: 'BAD_REQUEST'
        });
      }
    }

    const candidateUser = application.candidate as any;
    const currentStage = application.stage;

    // Create the Scorecard document
    const scorecard = await Scorecard.create({
      interview: interview._id,
      recommendation,
      comments,
      ratings: ratings || {},
      communication,
      cultureFit,
      salaryExpectation,
      salaryOffered,
      submittedBy: new mongoose.Types.ObjectId(req.user.id)
    });

    // Mark Interview as completed
    interview.status = 'completed';
    await interview.save();

    let nextStage: string;

    // Process pipeline stage transitions based on interview type and scorecard result
    if (interview.type === 'technical') {
      if (recommendation === 'reject') {
        nextStage = 'rejected';
        application.stage = 'rejected';
        application.rejectionReason = 'skills_mismatch';
        application.rejectionNote = comments;

        // Log mock rejection email
        console.log(`\n======================================================`);
        console.log(`✉️ MOCK EMAIL DISPATCH FOR: ${candidateUser?.email || 'unknown@candidate.com'}`);
        console.log(`Subject: Application Update - HireTrack`);
        console.log(`Dear ${candidateUser?.name || 'Candidate'},`);
        console.log(`Thank you for your interest in the position. We have decided to pursue other candidatures at this time.`);
        console.log(`======================================================\n`);
      } else {
        // 'pass'
        nextStage = 'technical_interview_completed';
        application.stage = 'technical_interview_completed';
      }
    } else {
      // 'hr'
      if (recommendation === 'reject') {
        nextStage = 'rejected';
        application.stage = 'rejected';
        application.rejectionReason = 'skills_mismatch';
        application.rejectionNote = comments;

        // Log mock rejection email
        console.log(`\n======================================================`);
        console.log(`✉️ MOCK EMAIL DISPATCH FOR: ${candidateUser?.email || 'unknown@candidate.com'}`);
        console.log(`Subject: Application Update - HireTrack`);
        console.log(`Dear ${candidateUser?.name || 'Candidate'},`);
        console.log(`Thank you for interviewing. We regret to inform you that we will not be moving forward with your application.`);
        console.log(`======================================================\n`);
      } else {
        // 'hire'
        nextStage = 'offer';
        application.stage = 'offer';

        // Log mock offer email
        console.log(`\n======================================================`);
        console.log(`✉️ MOCK EMAIL DISPATCH FOR: ${candidateUser?.email || 'unknown@candidate.com'}`);
        console.log(`Subject: Offer of Employment - HireTrack`);
        console.log(`Dear ${candidateUser?.name || 'Candidate'},`);
        console.log(`We are excited to extend an offer of employment. Details have been updated in your candidate portal.`);
        console.log(`======================================================\n`);
      }
    }

    await application.save();

    // Log the stage change activity log
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'stage_changed',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { from: currentStage, to: nextStage }
    });

    // Log the scorecard submission activity log
    await ActivityLog.create({
      entityType: 'application',
      entityId: application._id,
      action: 'scorecard_submitted',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { interviewId: interview._id, recommendation, interviewType: interview.type }
    });

    const populatedScorecard = await Scorecard.findById(scorecard._id)
      .populate('submittedBy', 'name email role')
      .populate({
        path: 'interview',
        populate: { path: 'application', select: 'stage' }
      });

    return res.status(201).json(populatedScorecard);
  } catch (error) {
    return next(error);
  }
};
