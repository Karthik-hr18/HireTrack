import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';
import { ApplicationsDashboard } from './pages/recruiter/ApplicationsDashboard';
import { ApplicationDetailPage } from './pages/recruiter/ApplicationDetailPage';
import { AssignedInterviews } from './pages/admin/AssignedInterviews';
import { ManageRecruiters } from './pages/admin/ManageRecruiters';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ApplicationsTracker } from './pages/candidate/ApplicationsTracker';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CareersPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/recruiter/jobs" element={<JobsDashboard />} />
        <Route path="/recruiter/applications" element={<ApplicationsDashboard />} />
        <Route path="/recruiter/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/admin/interviews" element={<AssignedInterviews />} />
        <Route path="/admin/recruiters" element={<ManageRecruiters />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/candidate/applications" element={<ApplicationsTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
