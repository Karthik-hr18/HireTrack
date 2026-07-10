import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import mongoose from 'mongoose';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'recruiter')) {
      return res.status(403).json({ message: 'Authorization required', code: 'FORBIDDEN' });
    }

    // 1. Get total open active jobs
    const totalActiveJobs = await Job.countDocuments({ status: 'open', deletedAt: null });

    // 2. Get total applications
    const totalApplications = await Application.countDocuments({});

    // 3. Stage Distribution calculations
    const stages = [
      'applied',
      'resume_screening',
      'technical_interview_scheduled',
      'technical_interview_completed',
      'hr_interview_scheduled',
      'hr_interview_completed',
      'offer',
      'hired',
      'rejected'
    ];

    const distributionArray = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const stageDistribution: Record<string, number> = {};
    stages.forEach(st => {
      stageDistribution[st] = 0;
    });
    distributionArray.forEach(item => {
      if (item._id) {
        stageDistribution[item._id] = item.count;
      }
    });

    // 4. "Needs Attention" screening lockout (Screening > 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const needsAttention = await Application.find({
      stage: 'resume_screening',
      updatedAt: { $lte: sevenDaysAgo }
    })
      .populate('candidate', 'name email')
      .populate('job', 'title location')
      .sort({ updatedAt: 1 })
      .limit(10);

    return res.status(200).json({
      totalActiveJobs,
      totalApplications,
      stageDistribution,
      needsAttention
    });
  } catch (error) {
    return next(error);
  }
};
