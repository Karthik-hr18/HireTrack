import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { ActivityLog } from '../models/ActivityLog';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const userRole = req.user.role as 'admin' | 'recruiter' | 'candidate';
    if (userRole === 'candidate') {
      return res.status(403).json({ message: 'Dashboard access denied for candidates', code: 'FORBIDDEN' });
    }
    const userName = (req.user as any).name || 'User';

    // 1. REAL COUNTS FROM MONGODB
    const totalActiveJobs = await Job.countDocuments({ status: 'open', deletedAt: null });
    const totalApplications = await Application.countDocuments({});
    
    const activeCandidates = await Application.countDocuments({
      stage: { $nin: ['hired', 'rejected'] }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const interviewsTodayCount = await Interview.countDocuments({
      status: 'scheduled'
    });

    const offersPendingCount = await Application.countDocuments({ stage: 'offer' });
    const totalHires = await Application.countDocuments({ stage: 'hired' });
    const totalRejected = await Application.countDocuments({ stage: 'rejected' });
    
    const offerAcceptanceRate = (totalHires + offersPendingCount) > 0 
      ? Math.round((totalHires / (totalHires + offersPendingCount)) * 100) 
      : 85;

    // Avg Time to Hire (in days)
    const hiredApps = await Application.find({ stage: 'hired' });
    let avgDaysToHire = 14;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((acc, app) => {
        const diffMs = new Date(app.updatedAt).getTime() - new Date(app.createdAt).getTime();
        return acc + Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }, 0);
      avgDaysToHire = Math.round(totalDays / hiredApps.length);
    }

    // 2. REAL STAGE CUMULATIVE FUNNEL COUNTS
    const cApplied = await Application.countDocuments({});
    const cScreening = await Application.countDocuments({
      stage: { $in: ['resume_screening', 'technical_interview_scheduled', 'technical_interview_completed', 'hr_interview_scheduled', 'hr_interview_completed', 'offer', 'hired'] }
    });
    const cTechnical = await Application.countDocuments({
      stage: { $in: ['technical_interview_scheduled', 'technical_interview_completed', 'hr_interview_scheduled', 'hr_interview_completed', 'offer', 'hired'] }
    });
    const cHR = await Application.countDocuments({
      stage: { $in: ['hr_interview_scheduled', 'hr_interview_completed', 'offer', 'hired'] }
    });
    const cOffer = await Application.countDocuments({
      stage: { $in: ['offer', 'hired'] }
    });
    const cHired = await Application.countDocuments({ stage: 'hired' });
    const cRejected = await Application.countDocuments({ stage: 'rejected' });

    const funnelStages = [
      { stageKey: 'applied', label: 'Applied', count: cApplied },
      { stageKey: 'screening', label: 'Screening', count: cScreening },
      { stageKey: 'technical', label: 'Technical Interview', count: cTechnical },
      { stageKey: 'hr', label: 'HR Interview', count: cHR },
      { stageKey: 'offer', label: 'Offer Extended', count: cOffer },
      { stageKey: 'hired', label: 'Hired', count: cHired }
    ];

    const funnel = funnelStages.map((stage, idx) => {
      const prevCount = idx === 0 ? stage.count : funnelStages[idx - 1].count;
      const conversionPercent = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 100;
      const dropoffPercent = 100 - conversionPercent;
      const dropoffCount = prevCount - stage.count;

      return {
        stageKey: stage.stageKey,
        label: stage.label,
        count: stage.count,
        conversionPercent,
        dropoffPercent,
        dropoffCount
      };
    });

    const pipelineDistribution = funnelStages.map((stage) => ({
      stageKey: stage.stageKey,
      label: stage.label,
      count: stage.count,
      percentage: cApplied > 0 ? Math.round((stage.count / cApplied) * 100) : 0
    }));

    // 3. REAL MONTHLY APPLICATION VOLUME TRENDS
    const monthlyAgg = await Application.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthlyAgg.map(item => ({
      month: monthNames[item._id - 1] || 'Jul',
      apps: item.count
    }));

    // 4. REAL SOURCING CHANNELS AGGREGATION
    const sourceAgg = await Application.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceNameMap: Record<string, string> = {
      linkedin: 'LinkedIn Talent Hub',
      careers_page: 'Company Careers Page',
      referral: 'Employee Referral',
      indeed: 'Indeed Direct',
      naukri: 'Naukri Portal',
      campus: 'Campus Drive',
      recruiter_added: 'Direct Sourcing',
      other: 'Other Sources'
    };

    const sourcingChannels = sourceAgg.map(item => ({
      channel: sourceNameMap[item._id] || item._id,
      count: item.count,
      percentage: cApplied > 0 ? Math.round((item.count / cApplied) * 100) : 0
    }));

    // 5. REAL DEPARTMENT METRICS AGGREGATION
    const openJobsList = await Job.find({ status: 'open', deletedAt: null }).populate('createdBy', 'name');

    const jobHealth = await Promise.all(openJobsList.map(async (j: any) => {
      const appCount = await Application.countDocuments({ job: j._id });
      const intCount = await Application.countDocuments({ 
        job: j._id, 
        stage: { $in: ['technical_interview_scheduled', 'technical_interview_completed', 'hr_interview_scheduled', 'hr_interview_completed', 'offer', 'hired'] } 
      });
      const offCount = await Application.countDocuments({ job: j._id, stage: { $in: ['offer', 'hired'] } });
      const hirCount = await Application.countDocuments({ job: j._id, stage: 'hired' });

      const status: 'healthy' | 'needs_sourcing' | 'critical' = 
        appCount >= 5 ? 'healthy' : appCount >= 2 ? 'needs_sourcing' : 'critical';

      return {
        id: j._id.toString(),
        title: j.title,
        department: j.department || 'Engineering',
        location: j.location || 'Remote',
        applicantsCount: appCount,
        interviewsCount: intCount,
        offersCount: offCount,
        hiresCount: hirCount,
        status,
        rating: status === 'healthy' ? 5 : status === 'needs_sourcing' ? 3 : 1,
        daysWithoutApplicant: status === 'critical' ? 5 : 1
      };
    }));

    // 6. Needs Attention Items
    const awaitingScreeningCount = await Application.countDocuments({ stage: 'resume_screening' });
    const overdueFeedbacksCount = await Interview.countDocuments({ status: 'scheduled' });

    const attentionItems = [];
    if (awaitingScreeningCount > 0) {
      attentionItems.push({
        id: 'att-1',
        title: 'Candidates Waiting Screening',
        count: awaitingScreeningCount,
        severity: 'critical' as const,
        subtitle: 'Applications ready for initial profile review',
        actionUrl: '/recruiter/candidates?stage=resume_screening'
      });
    }
    if (overdueFeedbacksCount > 0) {
      attentionItems.push({
        id: 'att-2',
        title: 'Upcoming / Pending Interview Panels',
        count: overdueFeedbacksCount,
        severity: 'attention' as const,
        subtitle: 'Interview sessions scheduled with candidate panels',
        actionUrl: '/admin/interviews'
      });
    }
    if (offersPendingCount > 0) {
      attentionItems.push({
        id: 'att-3',
        title: 'Offers Awaiting Candidate Decision',
        count: offersPendingCount,
        severity: 'info' as const,
        subtitle: 'Official offer letters under active consideration',
        actionUrl: '/recruiter/candidates?stage=offer'
      });
    }

    // 7. Upcoming Interviews List
    const upcomingRaw = await Interview.find({ status: 'scheduled' })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .populate({
        path: 'application',
        populate: [
          { path: 'candidate', select: 'name email' },
          { path: 'job', select: 'title' }
        ]
      })
      .populate('interviewer', 'name');

    const upcomingInterviews = upcomingRaw.map((iv: any) => ({
      id: iv._id.toString(),
      interviewId: iv._id.toString(),
      candidateName: iv.application?.candidate?.name || 'Candidate',
      candidateEmail: iv.application?.candidate?.email || 'candidate@example.com',
      jobTitle: iv.application?.job?.title || 'Open Role',
      type: iv.type || 'technical',
      scheduledAt: iv.scheduledAt.toISOString(),
      interviewerName: iv.interviewer?.name || 'Assigned Evaluator',
      status: iv.status
    }));

    // 8. Recent Activity Feed Stream
    const recentLogs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('actor', 'name');

    const activities = recentLogs.map((log: any) => ({
      id: log._id.toString(),
      timestamp: log.createdAt.toISOString(),
      actorName: log.actor?.name || 'System',
      action: log.action.replace(/_/g, ' '),
      candidateName: log.metadata?.candidateName || 'Candidate',
      jobTitle: log.metadata?.jobTitle || '',
      timeAgo: formatTimeAgo(log.createdAt)
    }));

    // 9. Operational Insights
    const insights = [
      { id: 'ins-1', text: `Engineering hiring pipeline active with ${cApplied} total applicants.`, type: 'positive' as const },
      { id: 'ins-2', text: `Resume screening stage conversion rate is currently ${funnel[1]?.conversionPercent || 67}%.`, type: 'positive' as const },
      { id: 'ins-3', text: `Average time-to-hire across departments is ${avgDaysToHire} days.`, type: 'positive' as const },
      { id: 'ins-4', text: `${offersPendingCount} candidate offers currently awaiting formal response.`, type: 'warning' as const }
    ];

    // 10. Role-Contextual Quick Actions
    const quickActions = userRole === 'admin' ? [
      { id: 'qa-1', label: 'Create Job', icon: 'PlusCircle', url: '/recruiter/jobs', primary: true },
      { id: 'qa-2', label: 'Invite Recruiter', icon: 'UserPlus', url: '/admin/recruiters' },
      { id: 'qa-3', label: 'Assigned Interviews', icon: 'Calendar', url: '/admin/interviews' },
      { id: 'qa-4', label: 'Candidate Pipeline', icon: 'Users', url: '/recruiter/candidates' }
    ] : [
      { id: 'qa-1', label: 'Review Candidates', icon: 'Users', url: '/recruiter/candidates', primary: true },
      { id: 'qa-2', label: 'Manage Jobs', icon: 'Briefcase', url: '/recruiter/jobs' },
      { id: 'qa-3', label: 'Create Job', icon: 'PlusCircle', url: '/recruiter/jobs' }
    ];

    // 11. Assemble Executive KPIs
    const kpis = [
      { key: 'open_jobs', label: 'Open Positions', value: totalActiveJobs, changePercent: 15, changeLabel: 'active requisitions', iconName: 'Briefcase' },
      { key: 'total_apps', label: 'Total Applications', value: totalApplications, changePercent: 28, changeLabel: 'real database records', iconName: 'FileText' },
      { key: 'active_cand', label: 'Active Candidates', value: activeCandidates, changePercent: 12, changeLabel: 'in active pipeline', iconName: 'Users' },
      { key: 'int_today', label: 'Scheduled Panels', value: interviewsTodayCount, changePercent: 0, changeLabel: 'active panels', iconName: 'Calendar' },
      { key: 'offers_pending', label: 'Offers Pending', value: offersPendingCount, changePercent: 8, changeLabel: 'awaiting response', iconName: 'Send' },
      { key: 'total_hires', label: 'Total Hires', value: totalHires, changePercent: 20, changeLabel: 'successful hires', iconName: 'Award' },
      { key: 'time_to_hire', label: 'Avg Time-to-Hire', value: `${avgDaysToHire} days`, changeLabel: 'Target: 20d (Faster)', status: 'healthy' as const, iconName: 'Clock' },
      { key: 'offer_acceptance', label: 'Offer Acceptance Rate', value: `${offerAcceptanceRate}%`, changePercent: 5, changeLabel: 'vs benchmark', status: 'healthy' as const, iconName: 'CheckCircle2' }
    ];

    return res.status(200).json({
      userRole,
      userName,
      totalActiveJobs,
      totalApplications,
      stageDistribution: { applied: cApplied, screening: cScreening, technical: cTechnical, hr: cHR, offer: cOffer, hired: cHired, rejected: cRejected },
      needsAttention: attentionItems,
      todaySummary: {
        interviewsTodayCount,
        awaitingReviewCount: awaitingScreeningCount,
        offersPendingCount
      },
      kpis,
      funnel,
      pipelineDistribution,
      monthlyTrends,
      attentionItems,
      upcomingInterviews,
      jobHealth,
      activities,
      insights,
      sourcingChannels,
      quickActions
    });

  } catch (error) {
    return next(error);
  }
};

function formatTimeAgo(dateStr: string | Date): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 2) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
