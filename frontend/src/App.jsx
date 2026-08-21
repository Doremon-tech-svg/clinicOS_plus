import { Routes, Route } from 'react-router-dom';

// Main Landing Page
import HospitalDashboard from './pages/HospitalDashboard';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import HospitalSelection from './pages/Auth/HospitalSelection';
import Signup from './pages/Auth/Signup';
import HospitalRegistration from './pages/Auth/HospitalRegistration';
import Landing from './pages/Landing';
import Pharmacy from './pages/Pharmacy';

// Department Pages
import Laboratory from './pages/Laboratory';
import Maternity from './pages/Maternity';
import Nursing from './pages/Nursing';
import OPD from './pages/OPD';
import Radiology from './pages/Radiology';
import Surgery from './pages/Surgery';
import Emergency from './pages/Emergency';

import AdminPortal from './pages/Admin';
import DoctorDashboard from './pages/DoctorDashboard';

// Optional: If you want to keep PatientChat standalone
import PatientChat from './PatientChat';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<HospitalSelection />} />
          <Route path="/login/:hospitalId" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register-hospital" element={<HospitalRegistration />} />

          {/* Protected Admin Portal */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />

          {/* Doctor Dashboard — er_doctor and dept_head only (ER tab is inside) */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['dept_head', 'er_doctor']}><DoctorDashboard /></ProtectedRoute>} />

          {/* Department Routes — role-locked */}
          <Route path="/lab"       element={<ProtectedRoute allowedRoles={['lab_tech', 'admin']}><Laboratory /></ProtectedRoute>} />
          <Route path="/maternity" element={<ProtectedRoute allowedRoles={['dept_head', 'nurse', 'admin']}><Maternity /></ProtectedRoute>} />
          <Route path="/nursing"   element={<ProtectedRoute allowedRoles={['nurse', 'er_doctor', 'dept_head', 'admin']}><Nursing /></ProtectedRoute>} />
          <Route path="/opd"       element={<ProtectedRoute allowedRoles={['dept_head', 'er_doctor', 'nurse', 'admin']}><OPD /></ProtectedRoute>} />
          <Route path="/radiology" element={<ProtectedRoute allowedRoles={['radiologist', 'admin']}><Radiology /></ProtectedRoute>} />
          <Route path="/surgery"   element={<ProtectedRoute allowedRoles={['dept_head', 'er_doctor', 'nurse', 'admin']}><Surgery /></ProtectedRoute>} />
          {/* Emergency: paramedic/acc/dispatcher/admin ONLY — ER doctor goes to /doctor */}
          <Route path="/emergency" element={<ProtectedRoute allowedRoles={['paramedic', 'acc', 'dispatcher', 'admin']}><Emergency /></ProtectedRoute>} />
          <Route path="/pharmacy"  element={<ProtectedRoute allowedRoles={['pharmacist', 'admin']}><Pharmacy /></ProtectedRoute>} />

          {/* Optional: Patient Chat */}
          <Route path="/patient/chat" element={<PatientChat />} />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}