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
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const api = (await import('@/services/api')).default;
      const { data } = await api.post('/auth/reset-password/request', { email });
      setSessionToken(data.sessionToken);
      setStep('reset');
      toast.success(data.message || 'Recovery code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const api = (await import('@/services/api')).default;
      await api.post('/auth/reset-password/confirm', {
        sessionToken,
        otp,
        newPassword
      });
      
      toast.success('Password reset successfully! Redirecting...');
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid OTP or failed to update password');
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

        {step === 'reset' && (
          <>
            <AuthHeader 
              title="Enter Recovery Code" 
              description={`We sent a 6-digit code to ${email}`} 
            />
            <AuthError error={error} />
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailCheck size={18} className="text-muted-foreground" />
                  </div>
                  <Input 
                    type="text" 
                    placeholder="123456" 
                    className="pl-10 tracking-widest font-mono text-lg"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                    required 
                  />
                </div>
              </div>
              <div className="pt-2">
                <PasswordInput 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  showStrength={true}
                  required
                />
              </div>
              <AuthButton type="submit" loading={loading} className="mt-6">
                Update Password
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
