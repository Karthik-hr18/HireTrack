import React, { useState, useEffect } from 'react';

interface Admin {
  _id: string;
  name: string;
  email: string;
}

interface SchedulingCardProps {
  applicationId: string;
  interviewType: 'technical' | 'hr';
  onCancel: () => void;
  onSuccess: () => void;
}

export const SchedulingCard: React.FC<SchedulingCardProps> = ({
  applicationId,
  interviewType,
  onCancel,
  onSuccess,
}) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [interviewerId, setInterviewerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch interviewer admins list
  useEffect(() => {
    const fetchAdmins = async () => {
      if (!token) return;
      try {
        setLoadingAdmins(true);
        const res = await fetch(`${apiUrl}/api/users/admins`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load admin interviewer list');
        const data = await res.json();
        setAdmins(data);
        if (data.length > 0) {
          setInterviewerId(data[0]._id);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, [token, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !interviewerId || !scheduledAt) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${apiUrl}/api/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId,
          interviewerId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          type: interviewType
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to schedule interview');
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scheduling-card">
      <h5 className="scheduling-card__title">
        Schedule {interviewType === 'technical' ? 'Technical' : 'HR'} Interview
      </h5>
      <form onSubmit={handleSubmit} className="scheduling-card__form">
        <div className="scheduling-card__field">
          <label htmlFor="sc-interviewer">Assigned Interviewer *</label>
          {loadingAdmins ? (
            <p className="scheduling-card__loading-text">Loading interviewers...</p>
          ) : (
            <select
              id="sc-interviewer"
              value={interviewerId}
              onChange={(e) => setInterviewerId(e.target.value)}
              disabled={submitting}
              required
            >
              {admins.map((adm) => (
                <option key={adm._id} value={adm._id}>
                  {adm.name} ({adm.email})
                </option>
              ))}
              {admins.length === 0 && <option value="">No Active Admins Found</option>}
            </select>
          )}
        </div>

        <div className="scheduling-card__field">
          <label htmlFor="sc-date">Date & Time *</label>
          <input
            id="sc-date"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        {error && <div className="scheduling-card__error">⚠️ {error}</div>}

        <div className="scheduling-card__actions">
          <button
            type="button"
            className="scheduling-card__cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="api-btn scheduling-card__submit"
            disabled={submitting || !scheduledAt || !interviewerId || admins.length === 0}
          >
            {submitting ? 'Scheduling...' : 'Confirm Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};
