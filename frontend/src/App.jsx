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

          {/* Protected Admin Dashboard */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><HospitalDashboard /></ProtectedRoute>} />

          {/* Department Routes */}
          <Route path="/lab" element={<ProtectedRoute><Laboratory /></ProtectedRoute>} />
          <Route path="/maternity" element={<ProtectedRoute><Maternity /></ProtectedRoute>} />
          <Route path="/nursing" element={<ProtectedRoute><Nursing /></ProtectedRoute>} />
          <Route path="/opd" element={<ProtectedRoute><OPD /></ProtectedRoute>} />
          <Route path="/radiology" element={<ProtectedRoute><Radiology /></ProtectedRoute>} />
          <Route path="/surgery" element={<ProtectedRoute><Surgery /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />

          {/* Optional: Patient Chat */}
          <Route path="/patient/chat" element={<PatientChat />} />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}