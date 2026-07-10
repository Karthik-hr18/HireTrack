import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CareersPage } from './pages/careers/CareersPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { JobsDashboard } from './pages/recruiter/JobsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CareersPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/recruiter/jobs" element={<JobsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
