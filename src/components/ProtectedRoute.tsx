
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'customer' | 'manufacturer';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  // Admin bypass - check if this is the admin/owner
  const isAdmin = () => {
    // You can replace this with your actual admin email or add an environment variable
    const adminEmail = "admin@millora.com"; // Replace with your admin email
    return user?.email === adminEmail;
  };

  useEffect(() => {
    if (!loading) {
      // Allow admin access regardless of role
      if (isAdmin()) {
        return;
      }

      if (!user) {
        navigate('/auth');
        return;
      }

      if (requireRole && userProfile) {
        if (userProfile.role !== requireRole) {
          // Redirect to correct dashboard based on role
          const redirectPath = userProfile.role === 'manufacturer'
            ? '/manufacturer-dashboard'
            : '/customer-dashboard';
          navigate(redirectPath);
        }
      }
    }
  }, [user, loading, userProfile, requireRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow admin access
  if (isAdmin()) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
