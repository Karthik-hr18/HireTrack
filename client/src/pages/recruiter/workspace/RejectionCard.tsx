import React, { useState } from 'react';

interface RejectionCardProps {
  applicationId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const REJECTION_REASONS = [
  { key: 'skills_mismatch', label: 'Skills Mismatch' },
  { key: 'experience_mismatch', label: 'Experience Mismatch' },
  { key: 'withdrew', label: 'Candidate Withdrew' },
  { key: 'salary_expectations', label: 'Salary Expectations Mismatch' },
  { key: 'other', label: 'Other Reason' }
];

export const RejectionCard: React.FC<RejectionCardProps> = ({
  applicationId,
  onCancel,
  onSuccess,
}) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [reason, setReason] = useState('skills_mismatch');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${apiUrl}/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rejectionReason: reason,
          rejectionNote: note.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reject candidate');
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rejection-card">
      <h5 className="rejection-card__title">Reject Application</h5>
      <form onSubmit={handleSubmit} className="rejection-card__form">
        <div className="rejection-card__field">
          <label htmlFor="rc-reason">Reason *</label>
          <select
            id="rc-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            required
          >
            {REJECTION_REASONS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rejection-card__field">
          <label htmlFor="rc-note">Comments / Rejection Note</label>
          <textarea
            id="rc-note"
            rows={3}
            placeholder="Provide internal notes about this rejection..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && <div className="rejection-card__error">⚠️ {error}</div>}

        <div className="rejection-card__actions">
          <button
            type="button"
            className="rejection-card__cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="api-btn rejection-card__submit"
            disabled={submitting}
          >
            {submitting ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </form>
    </div>
  );
};
