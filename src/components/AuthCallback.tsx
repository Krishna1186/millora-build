import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthCallback = () => {
  const { user, loading, checkProfileExists } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!loading && user) {
        console.log('Auth callback - user:', user.email);

        // Check if profile exists for this user
        const { exists, profile } = await checkProfileExists(user.id);

        if (exists && profile?.role) {
          // Existing user with role - redirect to appropriate dashboard
          console.log('Existing user with role:', profile.role);
          if (profile.role === 'manufacturer') {
            navigate('/manufacturer-dashboard');
          } else {
            navigate('/customer-dashboard');
          }
        } else {
          // New user or user without role - show role selector
          console.log('New user or user without role - showing role selector');
          navigate('/role-selector');
        }
      } else if (!loading && !user) {
        // No user, redirect to auth
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [user, loading, navigate, checkProfileExists]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
