import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Role → their home route
const ROLE_ROUTES = {
  admin:       '/admin',
  acc:         '/emergency',
  er_doctor:   '/emergency',
  paramedic:   '/emergency',
  nurse:       '/nursing',
  dept_head:   '/doctor',
  radiologist: '/radiology',
  lab_tech:    '/lab',
  pharmacist:  '/pharmacy',
  patient:     '/patient/portal',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#bc000c]" />
      </div>
    );
  }

  // Not logged in → go to hospital selection
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // allowedRoles provided and user's role isn't in it → redirect to their home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />;
  }

  return children;
}
