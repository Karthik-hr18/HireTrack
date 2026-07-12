import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';
import { CandidateWorkspacePage } from './pages/recruiter/workspace/CandidateWorkspacePage';
import { AssignedInterviews } from './pages/admin/AssignedInterviews';
import { ManageRecruiters } from './pages/admin/ManageRecruiters';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ApplicationsTracker } from './pages/candidate/ApplicationsTracker';
import { Dashboard } from './pages/dashboard/Dashboard';
import { NotFoundPage } from './pages/error/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CareersPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/recruiter/jobs" element={<JobsDashboard />} />
        <Route path="/recruiter/candidates" element={<CandidateWorkspacePage />} />
        <Route path="/admin/interviews" element={<AssignedInterviews />} />
        <Route path="/admin/recruiters" element={<ManageRecruiters />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/candidate/applications" element={<ApplicationsTracker />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
