import React, { useEffect, useRef } from 'react';
import { CandidateDetailPanel } from '../../pages/recruiter/workspace/CandidateDetailPanel';
import './modal.css';

/**
 * Re‑usable modal wrapper for the candidate detail view.
 * It mirrors the existing inline overlay implementation but lives in its own
 * file so it can be styled, tested and reused independently.
 */
interface CandidateDetailModalProps {
  /** The `applicationId` of the candidate to display */
  applicationId: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional callback to refresh the candidate list after a mutation */
  onRefreshList?: () => void;
  /** Callback to navigate to the next candidate */
  onNext?: () => void;
  /** Callback to navigate to the previous candidate */
  onPrevious?: () => void;
  /** Enables navigation controls when true */
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  applicationId,
  isOpen,
  onClose,
  onRefreshList,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  if (!isOpen) return null;

  // Focus management and keyboard shortcuts
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [hasPrevious, hasNext, onClose, onPrevious, onNext]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <CandidateDetailPanel
          key={applicationId}
          applicationId={applicationId}
          onDeselect={onClose}
          onRefreshList={onRefreshList}
          onNext={onNext}
          onPrevious={onPrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </div>
    </div>
  );
};
