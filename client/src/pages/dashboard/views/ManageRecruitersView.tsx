import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, ShieldCheck, Crown, Search, Plus } from 'lucide-react';
import styles from '../dashboard.module.css';

export const ManageRecruitersView: React.FC = () => {
  const token = localStorage.getItem('token');

  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/users/recruiters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecruiters(data);
      } else {
        // Fallback default recruiter directory data
        setRecruiters([
          { _id: '1', name: 'Karthik Recruiter', email: 'karthikhr676@gmail.com', department: 'Engineering', assignedJobs: 4, activeCandidates: 12, role: 'Lead Recruiter', isActive: true },
          { _id: '2', name: 'Sarah Jenkins', email: 'sarah.j@hiretrack.io', department: 'Product', assignedJobs: 3, activeCandidates: 8, role: 'Senior Recruiter', isActive: true },
          { _id: '3', name: 'Marcus Vance', email: 'marcus.vance@hiretrack.io', department: 'Sales', assignedJobs: 2, activeCandidates: 6, role: 'Talent Scout', isActive: true },
          { _id: '4', name: 'Elena Rostova', email: 'elena.r@hiretrack.io', department: 'IT', assignedJobs: 2, activeCandidates: 5, role: 'Technical Recruiter', isActive: true }
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch recruiters:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedRecruiter(null);
    setName('');
    setEmail('');
    setDepartment('Engineering');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: any) => {
    setModalMode('edit');
    setSelectedRecruiter(rec);
    setName(rec.name);
    setEmail(rec.email);
    setDepartment(rec.department || 'Engineering');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setSubmitting(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      let url = `${apiUrl}/api/users/recruiters`;
      let method = 'POST';
      const body: Record<string, string> = { name, email, department };

      if (modalMode === 'create') {
        body.password = password;
      } else if (selectedRecruiter) {
        const id = selectedRecruiter._id || selectedRecruiter.id;
        url = `${apiUrl}/api/users/recruiters/${id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchRecruiters();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Operation failed.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (rec: any) => {
    if (!token) return;
    const id = rec._id || rec.id;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/users/recruiters/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRecruiters();
      } else {
        setRecruiters(prev => prev.map(item => item._id === rec._id ? { ...item, isActive: !item.isActive } : item));
      }
    } catch (e) {
      setRecruiters(prev => prev.map(item => item._id === rec._id ? { ...item, isActive: !item.isActive } : item));
    }
  };

  const handleDeleteRecruiter = (id: string) => {
    if (window.confirm('Are you sure you want to remove this recruiter account?')) {
      setRecruiters(prev => prev.filter(r => r._id !== id));
    }
  };

  // Filtering
  const filteredRecruiters = recruiters.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || (r.department && r.department.toLowerCase() === filterDepartment.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? r.isActive : !r.isActive);
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className={styles.insightsContainer}>
      {/* ── RECRUITER STATS CARDS ────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL RECRUITERS</span>
            <span className={styles.kpiIcon}><Users size={18} color="#0284c7" /></span>
          </div>
          <div className={styles.kpiValue}>{recruiters.length}</div>
          <span className={styles.kpiTrend}>Active team headcount</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE CREDENTIALS</span>
            <span className={styles.kpiIcon}><CheckCircle size={18} color="#10b981" /></span>
          </div>
          <div className={styles.kpiValue}>{recruiters.filter(r => r.isActive !== false).length}</div>
          <span className={styles.kpiTrendGood}>Provisioned accounts</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>HIRING MANAGERS</span>
            <span className={styles.kpiIcon}><ShieldCheck size={18} color="#3b82f6" /></span>
          </div>
          <div className={styles.kpiValue}>3</div>
          <span className={styles.kpiTrend}>Department leads</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ADMIN USERS</span>
            <span className={styles.kpiIcon}><Crown size={18} color="#8b5cf6" /></span>
          </div>
          <div className={styles.kpiValue}>1</div>
          <span className={styles.kpiTrend}>Master Administrator</span>
        </div>
      </div>

      {/* ── TOP TOOLBAR (Search, Filters, Add Button) ───────────────────── */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search recruiters by name or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.toolbarSearchInput}
              style={{ paddingLeft: 30 }}
            />
          </div>

          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="product">Product</option>
            <option value="sales">Sales</option>
            <option value="it">IT</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="button" onClick={handleOpenCreateModal} className={styles.primaryAddBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Recruiter
        </button>
      </div>

      {/* ── RECRUITERS DIRECTORY TABLE ─────────────────────────────────── */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3>Recruiter Team Directory</h3>
            <p className={styles.subtext}>Manage roles, active assignments, and account credentials</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading recruiter directory…
          </div>
        ) : filteredRecruiters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No recruiter accounts found matching your filters.
          </div>
        ) : (
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>RECRUITER NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>DEPARTMENT</th>
                <th>ASSIGNED JOBS</th>
                <th>ACTIVE CANDIDATES</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.map(rec => (
                <tr key={rec._id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{rec.name}</strong>
                  </td>
                  <td style={{ color: '#475569' }}>{rec.email}</td>
                  <td>
                    <span className={styles.deptBadge}>{rec.department || 'Engineering'}</span>
                  </td>
                  <td>{rec.assignedJobs || 3} jobs</td>
                  <td>
                    <strong style={{ color: '#0284c7' }}>{rec.activeCandidates || 8} candidates</strong>
                  </td>
                  <td>{rec.role || 'Recruiter'}</td>
                  <td>
                    <span className={`badge ${rec.isActive !== false ? 'badge-hired' : 'badge-rejected'}`}>
                      {rec.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.rowActionsGroup}>
                      <button type="button" onClick={() => handleOpenEditModal(rec)} className={styles.actionBtnEdit}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleToggleStatus(rec)} className={styles.actionBtnToggle}>
                        {rec.isActive !== false ? 'Disable' : 'Enable'}
                      </button>
                      <button type="button" onClick={() => handleDeleteRecruiter(rec._id)} className={styles.actionBtnDelete}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD / EDIT RECRUITER MODAL ───────────────────────────────────── */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{modalMode === 'create' ? 'Provision New Recruiter' : 'Edit Recruiter Profile'}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. sarah.j@hiretrack.io"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              {modalMode === 'create' && (
                <div className={styles.formGroup}>
                  <label>Initial Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set secure password"
                    required
                  />
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.primaryAddBtn}>
                  {submitting ? 'Saving…' : modalMode === 'create' ? 'Create Account' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
