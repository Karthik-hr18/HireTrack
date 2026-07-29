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
  RotateCcw,
  Mail,
  Calendar,
  Building2
} from 'lucide-react';
import { JobGroupSidebar } from '../../../components/layout/JobGroupSidebar';
import { useEmployees } from '../../../hooks/useEmployees';
import { EmployeeProfileModal } from '../../../components/modal/EmployeeProfileModal';

export const EmployeesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserName = currentUser?.name || '';

  // Read URL params
  const initialJobId = searchParams.get('jobId') || searchParams.get('job') || 'all';
  const initialDepartment = searchParams.get('department') || 'all';
  const initialManager = searchParams.get('manager') || searchParams.get('managerName') || 'all';
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
    setPage,
    refetch
  } = useEmployees({
    jobId: initialJobId,
    department: initialDepartment,
    managerName: initialManager,
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

  // Handle sidebar job selection
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
      managerName: 'all',
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
  const managerList = summary.managers || [];

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
      <div className="workspace-main-area" style={{ padding: '20px 28px 60px' }}>
        {/* ── 1. HEADER TITLE & SUBTEXT ─────────────────────────────────────── */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                 Employees & Talent Roster
              </h1>
              {selectedJobObj && (
                <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                  Job: {selectedJobObj.title} ({selectedJobObj.currentEmployees}/{selectedJobObj.requiredHeadcount} Hired)
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
              Internal staff, reporting manager assignments, and department headcount progress.
            </p>
          </div>
        </div>

        {/* ── 2. SLEEK COMPACT 1-LINE TOOLBAR (SEARCH + FILTERS + MANAGER FILTER + RESET) ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            height: 38
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search employee name, ID, email, title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0f172a',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} />

          {/* Department Filter */}
          <select
            value={options.department || 'all'}
            onChange={(e) => updateFilters({ department: e.target.value })}
            style={{
              height: 28,
              padding: '0 8px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
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
            <option value="Operations">Operations</option>
          </select>

          {/* Reporting Manager Filter */}
          <select
            value={options.managerName || 'all'}
            onChange={(e) => updateFilters({ managerName: e.target.value })}
            style={{
              height: 28,
              padding: '0 8px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Reporting Managers</option>
            {currentUserName && (
              <option value={currentUserName}>Assigned to Me ({currentUserName})</option>
            )}
            {managerList.map((mgr) => (
              <option key={mgr} value={mgr}>{mgr}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={options.employmentStatus || 'all'}
            onChange={(e) => updateFilters({ employmentStatus: e.target.value })}
            style={{
              height: 28,
              padding: '0 8px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="probation">Probation</option>
            <option value="resigned">Resigned</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={options.sortBy || 'joiningDate'}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            style={{
              height: 28,
              padding: '0 8px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="joiningDate">Sort by Joining Date</option>
            <option value="name">Sort by Name</option>
            <option value="experience">Sort by Experience</option>
            <option value="department">Sort by Department</option>
            <option value="job">Sort by Job Title</option>
          </select>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            style={{
              height: 28,
              padding: '0 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* ── 3. TOP SUMMARY CARDS (INTERACTIVE FILTERS) ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div
            onClick={() => handleSummaryCardClick('all', 'all')}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.jobId === 'all' && options.employmentStatus === 'all' && !options.needResourcing ? '2px solid #0284c7' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Employees</span>
              <Users size={15} style={{ color: '#0284c7' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{summary.totalEmployees}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'active')}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.employmentStatus === 'active' ? '2px solid #10b981' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active</span>
              <UserCheck size={15} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{summary.activeEmployees}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'onboarding')}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.employmentStatus === 'onboarding' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Onboarding</span>
              <UserPlus size={15} style={{ color: '#0284c7' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{summary.onboarding}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'probation')}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.employmentStatus === 'probation' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Probation</span>
              <Clock size={15} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{summary.probation}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('employmentStatus', 'resigned')}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.employmentStatus === 'resigned' ? '2px solid #64748b' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resigned</span>
              <UserX size={15} style={{ color: '#64748b' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{summary.resigned}</div>
          </div>

          <div
            onClick={() => handleSummaryCardClick('needResourcing', true)}
            style={{
              padding: 12,
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: options.needResourcing ? '2px solid #ea580c' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Need Resourcing</span>
              <AlertTriangle size={15} style={{ color: '#ea580c' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ea580c' }}>{summary.needResourcingCount} Jobs</div>
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
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 16px 0' }}>No hired staff match your current search, job selection, or manager filter.</p>
            <button type="button" onClick={handleResetFilters} className="btn-primary-sm">Reset All Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16, marginBottom: 28 }}>
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
                    padding: 18,
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  {/* CARD TOP ROW */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 15
                        }}
                      >
                        {candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {candidateName}
                        </h3>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                          {empId}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 10,
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
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: 6, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{job?.title || 'Employee'}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {job?.department || 'Engineering'} • {emp?.workLocation || job?.location || 'Main Office'}
                    </div>
                  </div>

                  {/* CONTACT & DETAILS ROW */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{candidateEmail}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={12} style={{ color: '#94a3b8' }} />
                      <span>Joined: {formatDate(emp?.joiningDate || app.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={12} style={{ color: '#94a3b8' }} />
                      <span>Manager: <strong>{emp?.managerName || 'Sarah Jenkins'}</strong></span>
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
          onRefresh={refetch}
        />
      )}
    </div>
  );
};
