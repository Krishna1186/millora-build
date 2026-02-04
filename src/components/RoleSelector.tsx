
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Factory } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RoleSelector = () => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'manufacturer' | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUserRole, user, checkProfileExists } = useAuth();
  const navigate = useNavigate();

  // Check if user already has a role assigned
  useEffect(() => {
    const checkExistingRole = async () => {
      if (user) {
        const { exists, profile } = await checkProfileExists(user.id);

        if (exists && profile?.role) {
          // User already has a role, redirect appropriately
          if (profile.role === 'manufacturer') {
            navigate('/manufacturer-dashboard');
          } else {
            navigate('/customer-dashboard');
          }
        }
      }
    };

    checkExistingRole();
  }, [user, checkProfileExists, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;

    setLoading(true);

    if (selectedRole === 'manufacturer') {
      // For manufacturers, store role selection data and go to registration
      localStorage.setItem('manufacturerSignupData', JSON.stringify({
        email: user?.email || '',
        fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        role: 'manufacturer'
      }));
      navigate('/manufacturer-registration');
    } else {
      // For customers, set role and go to dashboard
      const { error } = await updateUserRole(selectedRole);

      if (!error) {
        navigate('/customer-dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 grid-lines opacity-20"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Welcome to Millora
          </h1>
          <p className="text-gray-600 font-light">
            Are you a Customer or Manufacturer?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className={`luxury-card cursor-pointer transition-all duration-300 ${selectedRole === 'customer' ? 'ring-2 ring-primary' : ''
              }`}
            onClick={() => setSelectedRole('customer')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-light">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 font-light">
                I need manufacturing services for my projects and products
              </p>
            </CardContent>
          </Card>

          <Card
            className={`luxury-card cursor-pointer transition-all duration-300 ${selectedRole === 'manufacturer' ? 'ring-2 ring-primary' : ''
              }`}
            onClick={() => setSelectedRole('manufacturer')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Factory className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-light">Manufacturer</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 font-light">
                I provide manufacturing services and want to connect with customers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="luxury-button luxury-button-primary px-12 h-12"
          >
            {loading ? 'Setting up your account...' : 'CONTINUE'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
