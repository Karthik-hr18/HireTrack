import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';
import { CandidateWorkspacePage } from './pages/recruiter/workspace/CandidateWorkspacePage';
import { AssignedInterviews } from './pages/admin/AssignedInterviews';
import { ConductInterviewPage } from './pages/admin/ConductInterviewPage';
import { ManageRecruiters } from './pages/admin/ManageRecruiters';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ApplicationsTracker } from './pages/candidate/ApplicationsTracker';
import { Dashboard } from './pages/dashboard/Dashboard';
import { NotFoundPage } from './pages/error/NotFoundPage';

import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<CareersPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/recruiter/jobs" element={<JobsDashboard />} />
          <Route path="/recruiter/candidates" element={<CandidateWorkspacePage />} />
          <Route path="/admin/interviews" element={<AssignedInterviews />} />
          <Route path="/admin/interviews/:id/conduct" element={<ConductInterviewPage />} />
          <Route path="/admin/recruiters" element={<ManageRecruiters />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/candidate/applications" element={<ApplicationsTracker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
