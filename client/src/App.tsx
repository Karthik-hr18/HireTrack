import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RecruiterLayout } from './components/layout/RecruiterLayout';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';
import { CandidateWorkspacePage } from './pages/recruiter/workspace/CandidateWorkspacePage';
import { AssignedInterviews } from './pages/admin/AssignedInterviews';
import { ConductInterviewPage } from './pages/admin/ConductInterviewPage';
import { ManageRecruiters } from './pages/admin/ManageRecruiters';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ApplicationsTracker } from './pages/candidate/ApplicationsTracker';
import { Dashboard } from './pages/dashboard/Dashboard';
import { NotFoundPage } from './pages/error/NotFoundPage';

import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Careers & Candidate Portal Routes */}
          <Route path="/" element={<CareersPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/candidate/applications" element={<ApplicationsTracker />} />

          {/* Legacy Aliases & Redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/recruiter" element={<Navigate to="/dashboard" replace />} />

          {/* Unified Recruiter / Admin Application Shell */}
          <Route element={<RecruiterLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recruiter/candidates" element={<CandidateWorkspacePage />} />
            <Route path="/recruiter/jobs" element={<JobsDashboard />} />
            <Route path="/admin/interviews" element={<AssignedInterviews />} />
            <Route path="/admin/recruiters" element={<ManageRecruiters />} />
          </Route>

          <Route path="/admin/interviews/:id/conduct" element={<ConductInterviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
