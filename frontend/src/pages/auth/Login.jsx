import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthError } from '@/components/auth/AuthError';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login');
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
        <AuthHeader 
          title="Welcome back" 
          description="Enter your credentials to access your account." 
        />
      
      <AuthError error={error} />
      
      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
          required
        />
        
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background"
            />
            <span className="text-muted-foreground group-hover:text-white transition-colors">Remember me</span>
          </label>
          
          <Link 
            to={ROUTES.FORGOT_PASSWORD} 
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" loading={loading} className="mt-6">
          Sign In
        </AuthButton>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-white hover:text-primary transition-colors">
          Sign up
        </Link>
      </p>
    </AuthCard>
    </div>
  );
}
