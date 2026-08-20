import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

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

  if (!user) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their department
    const roleRoutes = {
      admin: '/admin',
      acc: '/emergency',
      er_doctor: '/emergency',
      paramedic: '/emergency',
      nurse: '/nursing',
      radiologist: '/radiology',
      lab_tech: '/lab',
      dept_head: '/doctor',
      pharmacist: '/pharmacy',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
}
