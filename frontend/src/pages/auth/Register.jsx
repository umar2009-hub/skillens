import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register } = useAuth();
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
      await register(email, password, name);
      toast.success('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader 
        title="Create an account" 
        description="Start your personalized learning journey today." 
      />
      
      <AuthError error={error} />

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
            Full Name
          </label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
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
            placeholder="you@example.com" 
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
    </AuthCard>
  );
}
