import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updatePassword(password);
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader 
        title="Set new password" 
        description={success ? "Your password has been successfully updated." : "Please enter your new password below."} 
      />
      
      <AuthError error={error} />
      
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <PasswordInput 
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength={true}
            required
          />

          <PasswordInput 
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <AuthButton type="submit" loading={loading} className="mt-6">
            Update Password
          </AuthButton>
        </form>
      ) : (
        <div className="text-center space-y-6 mt-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Link to={ROUTES.LOGIN} className="block w-full">
            <AuthButton>
              Continue to Login
            </AuthButton>
          </Link>
        </div>
      )}

      {!success && (
        <div className="mt-8 text-center">
          <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
