
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'customer' | 'manufacturer'>('customer');
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  const { signUp, signIn, signInWithGoogle, user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  // Redirect logic for authenticated users
  useEffect(() => {
    if (user && userProfile && userProfile.role) {
      if (userProfile.role === 'manufacturer') {
        navigate('/manufacturer-dashboard');
      } else if (userProfile.role === 'customer') {
        navigate('/customer-dashboard');
      }
    }
  }, [user, userProfile, navigate]);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setRole('customer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && !passwordsMatch) {
      return;
    }
    
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName, role);
      if (!error) {
        clearForm();
        setIsSignUp(false); // Switch to sign in view
      }
    } else {
      const { error } = await signIn(email, password);
      // Navigation is handled by useEffect when user/userProfile updates
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  const handleManufacturerSignup = () => {
    if (role === 'manufacturer') {
      // Store signup data in localStorage for manufacturer registration
      localStorage.setItem('manufacturerSignupData', JSON.stringify({
        email,
        password,
        fullName,
        role
      }));
      navigate('/manufacturer-registration');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 grid-lines opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-light text-primary tracking-tight">
            Millora
          </Link>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4 mb-6"></div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 font-light">
            {isSignUp ? 'Join our platform today' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="luxury-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-light text-center">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-light tracking-wide"
              variant="outline"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-light">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-light">Full Name</Label>
                    <Input 
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12 border-gray-300 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-light">Account Type</Label>
                    <Select value={role} onValueChange={(value: 'customer' | 'manufacturer') => setRole(value)}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-primary">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer - I need manufacturing services</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer - I provide manufacturing services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-light">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 border-gray-300 focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-light">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 border-gray-300 focus:border-primary"
                  required
                />
                {isSignUp && <PasswordStrengthIndicator password={password} />}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-light">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`h-12 border-gray-300 focus:border-primary ${
                      confirmPassword && !passwordsMatch ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
              )}

              {isSignUp && role === 'manufacturer' ? (
                <Button 
                  type="button"
                  onClick={handleManufacturerSignup}
                  disabled={loading || (isSignUp && !passwordsMatch)}
                  className="luxury-button luxury-button-primary w-full h-12"
                >
                  CONTINUE TO REGISTRATION
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading || (isSignUp && !passwordsMatch)}
                  className="luxury-button luxury-button-primary w-full h-12"
                >
                  {loading ? 'Please wait...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                </Button>
              )}
            </form>

            <div className="text-center">
              <span className="text-sm text-gray-600 font-light">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button 
                onClick={toggleMode}
                className="text-sm text-primary hover:underline font-light"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
