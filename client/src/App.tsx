import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/candidate/applications" element={<ApplicationsTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
