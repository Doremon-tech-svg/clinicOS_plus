import { Routes, Route } from 'react-router-dom';

// Main Landing Page
import HospitalDashboard from './pages/HospitalDashboard';

// Department Pages
import Laboratory from './pages/Laboratory';
import Maternity from './pages/Maternity';
import Nursing from './pages/Nursing';
import OPD from './pages/OPD';
import Radiology from './pages/Radiology';
import Surgery from './pages/Surgery';
import Emergency from './pages/Emergency';

// Optional: If you want to keep PatientChat standalone
import PatientChat from './PatientChat';

export default function App() {
  return (
    <Routes>
      {/* Main Dashboard - Landing Page */}
      <Route path="/" element={<HospitalDashboard />} />
      
      {/* Department Routes */}
      <Route path="/lab" element={<Laboratory />} />
      <Route path="/maternity" element={<Maternity />} />
      <Route path="/nursing" element={<Nursing />} />
      <Route path="/opd" element={<OPD />} />
      <Route path="/radiology" element={<Radiology />} />
      <Route path="/surgery" element={<Surgery />} />
      <Route path="/emergency" element={<Emergency />} />
      
      {/* Optional: Patient Chat */}
      <Route path="/patient/chat" element={<PatientChat />} />
      
      {/* Fallback */}
      <Route path="*" element={<HospitalDashboard />} />
    </Routes>
  );
}