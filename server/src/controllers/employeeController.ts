import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Interview } from '../models/Interview';
import { Scorecard } from '../models/Scorecard';

/**
 * Controller handling Employee module presentation layer over Applications with stage = "hired".
 */

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const skip = (page - 1) * limit;

    // Base query: Hired applications
    const query: Record<string, unknown> = {
      stage: 'hired'
    };

    // Filter by specific job
    const rawJobId = (req.query.jobId || req.query.job) as string;
    if (rawJobId && mongoose.Types.ObjectId.isValid(rawJobId)) {
      query.job = new mongoose.Types.ObjectId(rawJobId);
    }

    // Filter by employment type
    if (req.query.employmentType) {
      query['employment.employmentType'] = req.query.employmentType;
    }

    // Filter by employment status
    if (req.query.employmentStatus) {
      query['employment.employmentStatus'] = req.query.employmentStatus;
    }

    // Filter by probation
    if (req.query.probation === 'true') {
      query['employment.employmentStatus'] = 'probation';
    }

    // Search by candidate name, email, employeeId, title, or skills
    if (req.query.search) {
      const searchStr = req.query.search as string;
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: searchStr, $options: 'i' } },
          { email: { $regex: searchStr, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchedUsers.map(u => u._id);

      query.$or = [
        { candidate: { $in: userIds } },
        { 'employment.employeeId': { $regex: searchStr, $options: 'i' } },
        { currentTitle: { $regex: searchStr, $options: 'i' } },
        { currentCompany: { $regex: searchStr, $options: 'i' } }
      ];
    }

    // Fetch matching hired applications
    let hiredApps = await Application.find(query)
      .populate('candidate', 'name email role')
      .populate('job', 'title department location requiredHeadcount status minExperience maxExperience')
      .exec();

    // Department filter (post-populate or via job IDs)
    if (req.query.department) {
      const dept = (req.query.department as string).toLowerCase();
      hiredApps = hiredApps.filter((app: any) => {
        const jobDept = (app.job?.department || 'General').toLowerCase();
        return jobDept === dept;
      });
    }

    // Need resourcing filter
    if (req.query.needResourcing === 'true') {
      // Calculate headcount for each job to determine if job needs resourcing
      const allHired = await Application.find({ stage: 'hired' }).select('job');
      const hiredCountMap = new Map<string, number>();
      allHired.forEach((app: any) => {
        const jId = app.job?.toString();
        if (jId) hiredCountMap.set(jId, (hiredCountMap.get(jId) || 0) + 1);
      });

      hiredApps = hiredApps.filter((app: any) => {
        const job = app.job;
        if (!job || typeof job === 'string') return false;
        const currentCount = hiredCountMap.get(job._id.toString()) || 0;
        return currentCount < (job.requiredHeadcount || 5);
      });
    }

    // In-memory Sorting for dynamic populated fields
    const sortBy = (req.query.sortBy as string) || 'joiningDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    hiredApps.sort((a: any, b: any) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortBy) {
        case 'name':
          valA = a.candidate?.name || '';
          valB = b.candidate?.name || '';
          break;
        case 'hireDate':
        case 'joiningDate':
          valA = new Date(a.employment?.joiningDate || a.updatedAt || a.createdAt).getTime();
          valB = new Date(b.employment?.joiningDate || b.updatedAt || b.createdAt).getTime();
          break;
        case 'experience':
          valA = a.experience || 0;
          valB = b.experience || 0;
          break;
        case 'department':
          valA = a.job?.department || '';
          valB = b.job?.department || '';
          break;
        case 'job':
          valA = a.job?.title || '';
          valB = b.job?.title || '';
          break;
        case 'status':
          valA = a.employment?.employmentStatus || '';
          valB = b.employment?.employmentStatus || '';
          break;
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const total = hiredApps.length;
    const paginatedApps = hiredApps.slice(skip, skip + limit);

    return res.status(200).json({
      employees: paginatedApps,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeStatsAndTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [jobs, hiredApps] = await Promise.all([
      Job.find({ deletedAt: null }).sort({ createdAt: -1 }),
      Application.find({ stage: 'hired' }).populate('job candidate').exec()
    ]);

    // Map hired count by job ID
    const hiredByJobMap = new Map<string, number>();
    let activeEmployees = 0;
    let onboardingCount = 0;
    let probationCount = 0;
    let resignedCount = 0;

    hiredApps.forEach((app: any) => {
      const jobId = app.job?._id?.toString() || app.job?.toString();
      if (jobId) {
        hiredByJobMap.set(jobId, (hiredByJobMap.get(jobId) || 0) + 1);
      }

      const status = app.employment?.employmentStatus || 'active';
      if (status === 'active') activeEmployees++;
      else if (status === 'onboarding') onboardingCount++;
      else if (status === 'probation') probationCount++;
      else if (status === 'resigned') resignedCount++;
    });

    let openPositions = 0;
    let needResourcingCount = 0;

    const jobTeams = jobs.map((job: any) => {
      const jobIdStr = job._id.toString();
      const currentEmployees = hiredByJobMap.get(jobIdStr) || 0;
      const requiredHeadcount = job.requiredHeadcount || 5;
      const vacancies = Math.max(0, requiredHeadcount - currentEmployees);
      const hiringProgress = Math.min(100, Math.round((currentEmployees / requiredHeadcount) * 100));

      let staffingStatus: 'fully_staffed' | 'overstaffed' | 'need_resourcing' = 'need_resourcing';
      if (currentEmployees === requiredHeadcount) {
        staffingStatus = 'fully_staffed';
      } else if (currentEmployees > requiredHeadcount) {
        staffingStatus = 'overstaffed';
      } else {
        staffingStatus = 'need_resourcing';
        needResourcingCount++;
      }

      openPositions += vacancies;

      return {
        jobId: job._id,
        title: job.title,
        department: job.department || 'General',
        location: job.location || 'Remote',
        requiredHeadcount,
        currentEmployees,
        vacancies,
        hiringProgress,
        staffingStatus,
        status: job.status
      };
    });

    return res.status(200).json({
      summary: {
        totalEmployees: hiredApps.length,
        activeEmployees: activeEmployees + onboardingCount + probationCount,
        onboarding: onboardingCount,
        probation: probationCount,
        resigned: resignedCount,
        openPositions,
        needResourcingCount
      },
      jobTeams
    });
  } catch (error) {
    return next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Employee Application ID', code: 'BAD_REQUEST' });
    }

    const application = await Application.findOne({ _id: id, stage: 'hired' })
      .populate('candidate', 'name email role')
      .populate('job', 'title department location status minExperience maxExperience requiredHeadcount')
      .populate('notes.author', 'name email role');

    if (!application) {
      return res.status(404).json({ message: 'Employee record not found', code: 'NOT_FOUND' });
    }

    // Timeline audit history
    const timeline = await ActivityLog.find({
      entityId: new mongoose.Types.ObjectId(id),
      entityType: 'application'
    })
      .sort({ createdAt: -1 })
      .populate('actor', 'name email role');

    // Interviews & Scorecards
    const interviews = await Interview.find({
      application: new mongoose.Types.ObjectId(id)
    }).populate('interviewer', 'name email role');

    const interviewIds = interviews.map(i => i._id);
    const scorecards = await Scorecard.find({
      interview: { $in: interviewIds }
    }).populate('submittedBy', 'name email role');

    return res.status(200).json({
      employee: application,
      timeline,
      interviews,
      scorecards
    });
  } catch (error) {
    return next(error);
  }
};
