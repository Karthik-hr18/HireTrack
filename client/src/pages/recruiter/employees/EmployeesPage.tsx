import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  UserX,
  AlertTriangle,
  Search,
  Building2,
  Mail,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { JobGroupSidebar } from '../../../components/layout/JobGroupSidebar';
import { useEmployees } from '../../../hooks/useEmployees';
import { EmployeeProfileModal } from '../../../components/modal/EmployeeProfileModal';

export const EmployeesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Read URL params
  const initialJobId = searchParams.get('jobId') || searchParams.get('job') || 'all';
  const initialDepartment = searchParams.get('department') || 'all';
  const initialStatus = searchParams.get('status') || searchParams.get('employmentStatus') || 'all';
  const initialNeedResourcing = searchParams.get('needResourcing') === 'true';

  const {
    employees,
    page,
    total,
    totalPages,
    summary,
    jobTeams,
    groups,
    expandedGroups,
    toggleGroup,
    options,
    loading,
    statsLoading,
    error,
    updateFilters,
    setPage
  } = useEmployees({
    jobId: initialJobId,
    department: initialDepartment,
    employmentStatus: initialStatus,
    needResourcing: initialNeedResourcing,
    limit: 12
  });

  const [searchInput, setSearchInput] = useState(options.search || '');

  // Sync search input debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (options.search || '')) {
        updateFilters({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, options.search, updateFilters]);

  // Handle sidebar job selection (matching Candidate Workspace behavior)
  const handleSelectJob = (jobId?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (jobId) {
      newParams.set('job', jobId);
      newParams.set('jobId', jobId);
      updateFilters({ jobId, needResourcing: false });
    } else {
      newParams.delete('job');
      newParams.delete('jobId');
      updateFilters({ jobId: 'all', needResourcing: false });
    }
    setSearchParams(newParams);
  };

  const handleSummaryCardClick = (filterKey: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (filterKey === 'needResourcing') {
      newParams.set('needResourcing', 'true');
      updateFilters({ needResourcing: true, employmentStatus: 'all', jobId: 'all' });
    } else if (filterKey === 'employmentStatus') {
      newParams.set('status', value);
      updateFilters({ employmentStatus: value, needResourcing: false, jobId: 'all' });
    } else {
      newParams.delete('needResourcing');
      newParams.delete('status');
      updateFilters({ employmentStatus: 'all', needResourcing: false, jobId: 'all', department: 'all' });
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
    updateFilters({
      search: '',
      department: 'all',
      jobId: 'all',
      employmentType: 'all',
      employmentStatus: 'all',
      needResourcing: false,
      probation: false,
      sortBy: 'joiningDate',
      sortOrder: 'desc'
    });
  };

  const formatDate = (dateVal?: Date | string) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
      case 'onboarding':
        return { backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' };
      case 'probation':
        return { backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' };
      case 'resigned':
        return { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' };
      default:
        return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
    }
  };

  const selectedJobObj = jobTeams.find(j => j.jobId === options.jobId);

  return (
    <div className="workspace-container">
      {/* ── LEFT SIDEBAR (Lever Jobs Column by Department) ────────────────── */}
      <JobGroupSidebar
        groups={groups}
        selectedJobId={options.jobId === 'all' ? undefined : options.jobId}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        onSelectJob={handleSelectJob}
        loading={statsLoading}
        empty={groups.length === 0 && !statsLoading}
      />

      {/* ── MAIN WORKSPACE CONTENT AREA ───────────────────────────────────── */}
      <div className="workspace-main-area" style={{ padding: '24px 32px 60px' }}>
        {/* ── 1. HEADER TITLE & SUBTEXT ─────────────────────────────────────── */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                👥 Employees & Talent Roster
              </h1>
              {selectedJobObj && (
                <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                  Job: {selectedJobObj.title} ({selectedJobObj.currentEmployees}/{selectedJobObj.requiredHeadcount} Hired)
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
              Internal staff, team headcount progress, and department resourcing metrics.
            </p>
          </div>
        </div>

        {/* ── 2. TOP SUMMARY CARDS (INTERACTIVE FILTERS) ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
          <div
            onClick={() => handleSummaryCardClick('all', 'all')}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.jobId === 'all' && options.employmentStatus === 'all' && !options.needResourcing ? '2px solid #0284c7' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Employees</span>
              <Users size={16} style={{ color: '#0284c7' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{summary.totalEmployees}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'active')}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.employmentStatus === 'active' ? '2px solid #10b981' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active</span>
              <UserCheck size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{summary.activeEmployees}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'onboarding')}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.employmentStatus === 'onboarding' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Onboarding</span>
              <UserPlus size={16} style={{ color: '#0284c7' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{summary.onboarding}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'probation')}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.employmentStatus === 'probation' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Probation</span>
              <Clock size={16} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{summary.probation}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'resigned')}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.employmentStatus === 'resigned' ? '2px solid #64748b' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resigned</span>
              <UserX size={16} style={{ color: '#64748b' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{summary.resigned}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('needResourcing', true)}
            style={{
              padding: 14,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: options.needResourcing ? '2px solid #ea580c' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Need Resourcing</span>
              <AlertTriangle size={16} style={{ color: '#ea580c' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ea580c' }}>{summary.needResourcingCount} Jobs</div>
          </div>
        </div>

        {/* ── 3. SEARCH, FILTER & SORT CONTROL BAR ───────────────────────────── */}
        <div style={{ backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by employee name, ID, email, title, skills..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: 13,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                outline: 'none'
              }}
            />
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={options.department || 'all'}
              onChange={(e) => updateFilters({ department: e.target.value })}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="IT">IT</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={options.employmentStatus || 'all'}
              onChange={(e) => updateFilters({ employmentStatus: e.target.value })}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="probation">Probation</option>
              <option value="resigned">Resigned</option>
            </select>

            <select
              value={options.sortBy || 'joiningDate'}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a' }}
            >
              <option value="joiningDate">Sort by Joining Date</option>
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="department">Sort by Department</option>
              <option value="job">Sort by Job Title</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* ── 4. EMPLOYEE CARDS GRID ────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            Loading hired employee roster...
          </div>
        ) : error ? (
          <div style={{ padding: 24, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 12 }}>
            {error}
          </div>
        ) : employees.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Users size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>No Employees Found</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 16px 0' }}>No hired staff match your current search or job selection.</p>
            <button type="button" onClick={handleResetFilters} className="btn-primary-sm">Reset All Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 28 }}>
            {employees.map((app: any) => {
              const candidate = typeof app.candidate === 'object' ? app.candidate : null;
              const job = typeof app.job === 'object' ? app.job : null;
              const emp = app.employment;

              const candidateName = candidate?.name || app.candidateName || 'Employee';
              const candidateEmail = candidate?.email || app.candidateEmail || 'No Email';
              const empId = emp?.employeeId || `EMP-${app._id?.substring(0, 6)?.toUpperCase() || '1001'}`;
              const badgeStyle = getStatusBadgeStyle(emp?.employmentStatus);

              return (
                <div
                  key={app._id}
                  onClick={() => setSelectedEmployeeId(app._id)}
                  style={{
                    padding: 20,
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  {/* CARD TOP ROW */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 16
                        }}
                      >
                        {candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {candidateName}
                        </h3>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                          {empId}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: badgeStyle.backgroundColor,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.borderColor}`,
                        textTransform: 'capitalize'
                      }}
                    >
                      {emp?.employmentStatus || 'Active'}
                    </span>
                  </div>

                  {/* JOB & DEPT INFO */}
                  <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{job?.title || 'Employee'}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {job?.department || 'Engineering'} • {emp?.workLocation || job?.location || 'Main Office'}
                    </div>
                  </div>

                  {/* CONTACT & DETAILS ROW */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={13} style={{ color: '#94a3b8' }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{candidateEmail}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={13} style={{ color: '#94a3b8' }} />
                      <span>Joined: {formatDate(emp?.joiningDate || app.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={13} style={{ color: '#94a3b8' }} />
                      <span>Manager: {emp?.managerName || 'Sarah Jenkins'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 5. PAGINATION CONTROLS ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total employees)
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 6. EMPLOYEE PROFILE SLIDE-OUT MODAL ──────────────────────────── */}
      {selectedEmployeeId && (
        <EmployeeProfileModal
          applicationId={selectedEmployeeId}
          isOpen={!!selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
        />
      )}
    </div>
  );
};
