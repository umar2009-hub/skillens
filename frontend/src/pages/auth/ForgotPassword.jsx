import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent!');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader 
        title="Reset Password" 
        description={submitted ? "Check your email for a reset link." : "Enter your email and we'll send you a reset link."} 
      />
      
      <AuthError error={error} />
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <AuthButton type="submit" loading={loading} className="mt-6">
            Send Reset Link
          </AuthButton>
        </form>
      ) : (
        <div className="text-center space-y-6 mt-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <AuthButton onClick={() => setSubmitted(false)} variant="outline">
            Try another email
          </AuthButton>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
