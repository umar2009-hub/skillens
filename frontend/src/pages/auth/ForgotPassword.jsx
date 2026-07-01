import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setStep('verify');
      toast.success('Recovery code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });
      if (error) throw error;
      
      // OTP is verified, user is now temporarily logged in to change password
      setStep('reset');
      toast.success('Code verified! Please enter your new password.');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Password reset successfully! Redirecting...');
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <Link to={ROUTES.HOME} className="absolute -top-12 left-0 text-muted-foreground hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <AuthCard>
        {step === 'request' && (
          <>
            <AuthHeader 
              title="Reset Password" 
              description="Enter your email to receive a secure recovery code." 
            />
            <AuthError error={error} />
            <form onSubmit={handleRequestOTP} className="space-y-4 mt-4">
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
              <AuthButton type="submit" loading={loading} className="mt-6">
                Send Recovery Code
              </AuthButton>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <AuthHeader 
              title="Enter Recovery Code" 
              description={`We sent an 8-digit code to ${email}`} 
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
                Verify Code
              </AuthButton>
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-sm text-primary hover:underline"
                >
                  Didn't receive a code? Try again.
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <AuthHeader 
              title="Create New Password" 
              description="Enter your new password below." 
            />
            <AuthError error={error} />
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <PasswordInput 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showStrength={true}
                required
              />
              <AuthButton type="submit" loading={loading} className="mt-6">
                Update Password
              </AuthButton>
            </form>
          </>
        )}

        {step === 'request' && (
          <div className="mt-8 text-center">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        )}
      </AuthCard>
    </div>
  );
}
