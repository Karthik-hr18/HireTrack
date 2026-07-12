import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ManageRecruiters: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Recruiter directory state
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchRecruitersList();
  }, [token, navigate]);

  const fetchRecruitersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/users/recruiters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve recruiters list');
      }

      const data = await response.json();
      setRecruiters(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRecruiter(null);
    setName('');
    setEmail('');
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (recruiter: any) => {
    setModalMode('edit');
    setSelectedRecruiter(recruiter);
    setName(recruiter.name);
    setEmail(recruiter.email);
    setPassword(''); // Omit password updates in edit modal for security simplicity
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
      let body: any = { name, email };

      if (modalMode === 'create') {
        body.password = password;
      } else {
        url = `${apiUrl}/api/users/recruiters/${selectedRecruiter._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to complete profile operation.');
      }

      setIsModalOpen(false);
      await fetchRecruitersList();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (recruiter: any) => {
    if (!token) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/users/recruiters/${recruiter._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle recruiter account status.');
      }

      await fetchRecruitersList();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Manage Recruiters</h1>
          <p style={subtitleStyle}>Provision and manage recruiter accounts and internal credentials</p>
        </div>
        <button onClick={openCreateModal} className="api-btn" style={addBtnStyle}>
          ➕ Add Recruiter
        </button>
      </header>

      {error && (
        <div style={errorContainerStyle}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing recruiter directory...</h2>
          <div style={spinnerStyle}></div>
        </div>
      ) : recruiters.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)', marginBottom: '1rem' }}>No Recruiters Seeded</h2>
          <p style={{ color: 'var(--gray-text-muted)', maxWidth: '480px', margin: '0 auto 2rem' }}>
            There are no internal recruiter profiles configured in the system. Click the button above to create one.
          </p>
          <button onClick={openCreateModal} className="api-btn">
            Provision First Recruiter
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Recruiter Name</th>
                <th style={thStyle}>Email Address</th>
                <th style={thStyle}>Account Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((rec) => (
                <tr key={rec._id} style={trStyle} className="table-row-hover">
                  <td style={tdStyle}>
                    <strong style={recNameStyle}>{rec.name}</strong>
                  </td>
                  <td style={tdStyle}>
                    <span style={recEmailStyle}>{rec.email}</span>
                  </td>
                  <td style={tdStyle}>
                    <span className={`badge ${rec.isActive ? 'badge-hired' : 'badge-rejected'}`}>
                      {rec.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => openEditModal(rec)} style={editBtnStyle}>
                        ✏️ Edit Details
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(rec)} 
                        style={rec.isActive ? deactivateBtnStyle : activateBtnStyle}
                      >
                        {rec.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div style={modalBackdropStyle}>
          <div className="card" style={modalContentStyle}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--gray-text-primary)' }}>
              {modalMode === 'create' ? 'Provision New Recruiter' : 'Edit Recruiter details'}
            </h3>
            
            <form onSubmit={handleFormSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Full Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. John Doe"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. john@company.com"
                  style={inputStyle}
                  required
                />
              </div>

              {modalMode === 'create' && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Password *</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter secure password"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" style={cancelBtnStyle} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="api-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Account' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  letterSpacing: '-0.02em',
  marginBottom: '0.25rem'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const addBtnStyle: React.CSSProperties = {
  height: '42px',
  fontSize: '14px',
  fontWeight: 600,
  padding: '0 20px',
  display: 'inline-flex',
  alignItems: 'center'
};

const errorContainerStyle: React.CSSProperties = {
  color: 'var(--error)',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  padding: '12px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  marginBottom: '1.5rem',
  border: '1px solid rgba(239, 68, 68, 0.2)'
};

const spinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid var(--gray-border)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)'
};

const thStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--gray-text-muted)'
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  transition: 'background-color var(--transition-speed)'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle'
};

const recNameStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const recEmailStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-primary)'
};

const editBtnStyle: React.CSSProperties = {
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  color: 'var(--accent-hover)',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.2s'
};

const deactivateBtnStyle: React.CSSProperties = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.2s'
};

const activateBtnStyle: React.CSSProperties = {
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  color: '#10b981',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.2s'
};

// Modal Elements
const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalContentStyle: React.CSSProperties = {
  width: '450px',
  padding: '24px',
  boxSizing: 'border-box'
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--gray-text-muted)',
  letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '14px',
  height: '38px',
  borderRadius: '6px',
  padding: '0 12px',
  boxSizing: 'border-box'
};

const cancelBtnStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-muted)',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '14px'
};
