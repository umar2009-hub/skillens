import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function Register() {
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, session } = useAuth();
  const navigate = useNavigate();

  // If the user clicks the magic link in the email instead of typing the OTP,
  // the session will automatically be created. We detect that here and redirect.
  React.useEffect(() => {
    if (session && step === 'verify') {
      toast.success('Email verified successfully!');
      navigate(ROUTES.DASHBOARD);
    }
  }, [session, step, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await register(email, password, name);
      
      // If session exists, email confirmation is disabled in Supabase, user is logged in
      if (data?.session) {
        toast.success('Registration successful!');
        navigate(ROUTES.DASHBOARD);
      } else {
        // Email confirmation is enabled, switch to OTP verification step
        setStep('verify');
        toast.success('Confirmation code sent to your email!');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      
      toast.success('Email verified successfully! Welcome to SkillLens.');
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <Link to={ROUTES.HOME} className="hidden md:flex absolute -top-12 left-0 text-muted-foreground hover:text-white items-center gap-2 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <AuthCard>
        {step === 'register' && (
          <>
            <AuthHeader 
              title="Create an account" 
              description="Start your personalized learning journey today." 
            />
            
            <AuthError error={error} />

            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Your full name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <PasswordInput 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showStrength={true}
                required
              />

              <PasswordInput 
                id="confirm-password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <AuthButton type="submit" loading={loading} className="mt-6">
                Create Account
              </AuthButton>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-white hover:text-primary transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 'verify' && (
          <>
            <AuthHeader 
              title="Verify your email" 
              description={`We sent an 8-digit confirmation code to ${email}`} 
            />
            
            <AuthError error={error} />

            <form onSubmit={handleVerifyOTP} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  8-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailCheck size={18} className="text-muted-foreground" />
                  </div>
                  <Input 
                    type="text" 
                    placeholder="12345678" 
                    className="pl-10 tracking-widest font-mono text-lg"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                    required 
                  />
                </div>
              </div>
              
              <AuthButton type="submit" loading={loading} className="mt-6">
                Verify Email
              </AuthButton>
              
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm text-primary hover:underline"
                >
                  Typo in your email? Go back.
                </button>
              </div>
            </form>
          </>
        )}
      </AuthCard>
    </div>
  );
}
