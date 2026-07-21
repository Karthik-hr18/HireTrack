import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { ActivityLog } from '../models/ActivityLog';
import { CreateJobSchema, UpdateJobSchema } from '@hiretrack/shared';
import mongoose from 'mongoose';

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const validatedData = CreateJobSchema.parse(req.body);

    const job = await Job.create({
      ...validatedData,
      status: 'open',
      createdBy: new mongoose.Types.ObjectId(req.user.id),
      deletedAt: null
    });

    // Write to ActivityLog
    await ActivityLog.create({
      entityType: 'job',
      entityId: job._id,
      action: 'job_created',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { title: job.title }
    });

    return res.status(201).json(job);
  } catch (error) {
    return next(error);
  }
};

export const getPublicJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 200);
    const skip = (page - 1) * limit;

    const query = {
      status: 'open',
      deletedAt: null
    };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Job.countDocuments(query)
    ]);

    let resultJobs: any[] = jobs;
    if (req.query.includeCounts === 'true') {
      const counts = await Application.aggregate([
        { $group: { _id: '$job', count: { $sum: 1 } } }
      ]);
      const countMap = new Map(counts.map((c) => [c._id?.toString(), c.count]));
      resultJobs = jobs.map((j) => {
        const obj = j.toObject();
        return { ...obj, candidateCount: countMap.get(j._id.toString()) || 0 };
      });
    }

    return res.status(200).json({
      jobs: resultJobs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
};

export const getManageJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const skip = (page - 1) * limit;

    const query: any = {
      deletedAt: null
    };

    if (req.query.status === 'open' || req.query.status === 'closed') {
      query.status = req.query.status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Job.countDocuments(query)
    ]);

    return res.status(200).json({
      jobs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Job ID', code: 'BAD_REQUEST' });
    }

    const job = await Job.findOne({ _id: id, deletedAt: null }).populate('createdBy', 'name email role');
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found', code: 'NOT_FOUND' });
    }

    // Gating for closed jobs
    if (job.status === 'closed') {
      const isStaff = req.user && (req.user.role === 'recruiter' || req.user.role === 'admin');
      if (!isStaff) {
        return res.status(404).json({ message: 'Job posting is currently closed', code: 'NOT_FOUND' });
      }
    }

    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Job ID', code: 'BAD_REQUEST' });
    }

    const validatedData = UpdateJobSchema.parse(req.body);

    const job = await Job.findOne({ _id: id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found', code: 'NOT_FOUND' });
    }

    const previousStatus = job.status;

    // Apply updates
    Object.assign(job, validatedData);
    await job.save();

    // Log update action
    const metadata: any = { title: job.title };
    if (validatedData.status && validatedData.status !== previousStatus) {
      metadata.statusChange = { from: previousStatus, to: validatedData.status };
    }

    await ActivityLog.create({
      entityType: 'job',
      entityId: job._id,
      action: 'job_updated',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata
    });

    const updatedJob = await Job.findById(job._id).populate('createdBy', 'name email role');
    return res.status(200).json(updatedJob);
  } catch (error) {
    return next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Job ID', code: 'BAD_REQUEST' });
    }

    const job = await Job.findOne({ _id: id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found', code: 'NOT_FOUND' });
    }

    job.deletedAt = new Date();
    await job.save();

    // Log soft delete action
    await ActivityLog.create({
      entityType: 'job',
      entityId: job._id,
      action: 'job_deleted',
      actor: new mongoose.Types.ObjectId(req.user.id),
      metadata: { title: job.title }
    });

    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};
