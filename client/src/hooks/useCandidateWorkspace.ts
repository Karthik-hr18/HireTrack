import { useState, useEffect, useCallback, useMemo } from 'react';
import { Application } from '../pages/recruiter/workspace/CandidateRow';

export interface Job {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  candidateCount?: number;
  jobGroup?: string;
}

/** Predefined business order for job groups */
const BUSINESS_ORDER = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'IT',
  'Legal',
  'General',
];

/** Shape of a job group used by the sidebar */
export interface JobGroup {
  name: string;
  totalCount: number;
  jobs: Array<{ id: string; title: string; candidateCount: number }>;
}

interface UseCandidateWorkspaceOptions {
  activeStage: string;
  selectedJobId?: string;
}

/** Hook that loads jobs, applications and provides UI state */
export const useCandidateWorkspace = ({ activeStage, selectedJobId }: UseCandidateWorkspaceOptions) => {
  // ── Job groups ────────────────────────────────────────
  const [groups, setGroups] = useState<JobGroup[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // ── Applications (candidates) ────────────────────────
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');

  // ---- Fetch jobs with counts ------------------------------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/jobs?includeCounts=true&limit=200`, { headers });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const json = await res.json();
        const data: Job[] = Array.isArray(json) ? json : (json.jobs ?? []);

        const groupMap: Record<string, JobGroup> = {};
        data.forEach((job) => {
          const groupName = (job as any).jobGroup || (job as any).department || 'General';
          if (!groupMap[groupName]) {
            groupMap[groupName] = { name: groupName, totalCount: 0, jobs: [] };
          }
          const g = groupMap[groupName];
          const count = (job as any).candidateCount ?? 0;
          g.jobs.push({ id: job._id, title: job.title, candidateCount: count });
          g.totalCount += count;
        });
        const ordered: JobGroup[] = BUSINESS_ORDER.map((name) => groupMap[name]).filter(Boolean);
        const remaining = Object.keys(groupMap)
          .filter((n) => !BUSINESS_ORDER.includes(n))
          .sort()
          .map((n) => groupMap[n]);
        setGroups([...ordered, ...remaining]);
      } catch (e: any) {
        setJobsError(e.message);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // ---- Persist expanded groups ------------------------------------------------
  useEffect(() => {
    const stored = sessionStorage.getItem('candidateSidebarExpanded');
    if (stored) {
      try {
        setExpandedGroups(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('candidateSidebarExpanded', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  }, []);

  // ---- Fetch all applications -------------------------------------------------
  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (!token) {
      setLoadingApps(false);
      return;
    }
    try {
      setLoadingApps(true);
      setAppsError(null);
      const params = new URLSearchParams({ page: '1', limit: '200' });
      if (selectedJobId) params.append('jobId', selectedJobId);
      const res = await fetch(`${apiUrl}/api/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load candidates');
      const data = await res.json();
      const apps: Application[] = Array.isArray(data) ? data : (data.applications ?? []);
      setAllApplications(apps);
    } catch (e: any) {
      setAppsError(e.message);
    } finally {
      setLoadingApps(false);
    }
  }, [selectedJobId]);

  // Automatically load applications when selectedJobId or dependencies change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Expose refresh function
  const refreshApplications = fetchApplications;

  // ---- Apply client‑side filtering (job, stage, search) -----------------------
  const filteredApplications = useMemo(() => {
    let list = allApplications;
    if (activeStage) {
      list = list.filter((a) => {
        const s = a.stage;
        if (activeStage === 'resume_screening') return ['applied', 'resume_screening'].includes(s);
        if (activeStage === 'technical_interview') return ['technical_interview', 'technical_interview_scheduled', 'technical_interview_completed'].includes(s);
        if (activeStage === 'hr_interview') return ['hr_interview', 'hr_interview_scheduled', 'hr_interview_completed'].includes(s);
        return s === activeStage;
      });
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          (a.candidate?.name || '').toLowerCase().includes(q) ||
          (a.candidate?.email || '').toLowerCase().includes(q) ||
          (a.job?.title || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allApplications, activeStage, searchTerm]);

  // ---- Stage counts for the current scope ---------------------------
  const stageCounts = useMemo(() => {
    const map: Record<string, number> = { '': allApplications.length };
    allApplications.forEach((app) => {
      const s = app.stage;
      if (['applied', 'resume_screening'].includes(s)) {
        map['resume_screening'] = (map['resume_screening'] || 0) + 1;
      } else if (['technical_interview', 'technical_interview_scheduled', 'technical_interview_completed'].includes(s)) {
        map['technical_interview'] = (map['technical_interview'] || 0) + 1;
      } else if (['hr_interview', 'hr_interview_scheduled', 'hr_interview_completed'].includes(s)) {
        map['hr_interview'] = (map['hr_interview'] || 0) + 1;
      } else {
        map[s] = (map[s] || 0) + 1;
      }
    });
    return map;
  }, [allApplications]);

  const allJobsCount = groups.reduce((sum, g) => sum + g.totalCount, 0);

  return {
    groups,
    loadingJobs,
    jobsError,
    selectedJobId,
    expandedGroups,
    toggleGroup,
    allJobsCount,
    applications: filteredApplications,
    loadingApps,
    appsError,
    searchTerm,
    setSearchTerm,
    stageCounts,
    refreshApplications,
  };
};
