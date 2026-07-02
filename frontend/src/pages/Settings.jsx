import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSessionToken, setDeleteSessionToken] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password: ' + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestDelete = async () => {
    try {
      setDeleteLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const api = (await import('@/services/api')).default;
      const { data } = await api.post('/auth/request-delete', {}, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setDeleteSessionToken(data.sessionToken);
      toast.success(data.message || 'OTP sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Failed to request account deletion');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setOtpLoading(true);
      const api = (await import('@/services/api')).default;
      await api.post('/auth/confirm-delete', {
        sessionToken: deleteSessionToken,
        otp
      });
      
      // Logout and redirect on success
      await supabase.auth.signOut();
      if (signOut) signOut();
      toast.success('Account successfully deleted.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Invalid OTP or failed to delete account.');
    } finally {
      setOtpLoading(false);
    }
  };

  const avatarInitial = fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-medium text-3xl shadow-lg ring-4 ring-background">
                {avatarInitial}
              </div>
              <Button variant="outline" disabled>Change Avatar</Button>
            </div>
            
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name" 
              />
            </div>
            
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <Input 
                value={email} 
                disabled 
                type="email" 
                className="opacity-50 cursor-not-allowed" 
                title="Email address cannot be changed here"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={loading || !fullName.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <Input 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new password" 
              />
            </div>
            
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <Input 
                type="password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password" 
              />
            </div>

            <Button 
              onClick={handleChangePassword} 
              disabled={passwordLoading || !newPassword.trim() || !confirmPassword.trim()}
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-lg">
              Once you delete your account, there is no going back. Please be certain. All your documents, notes, quizzes, and learning data will be permanently erased.
            </p>
            {showDeleteConfirm && !deleteSessionToken ? (
              <div className="space-y-4 p-4 border border-red-500/20 rounded-lg bg-red-500/10">
                <p className="text-sm font-medium text-white">Are you absolutely sure?</p>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleRequestDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Sending email...' : 'Yes, send deletion email'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : deleteSessionToken ? (
              <div className="space-y-4 p-4 border border-red-500/20 rounded-lg bg-red-500/10">
                <p className="text-sm font-medium text-white">Enter the 6-digit OTP sent to your email.</p>
                <div className="flex gap-3 max-w-xs">
                  <Input 
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleConfirmDelete} disabled={otpLoading || otp.length !== 6}>
                    {otpLoading ? 'Verifying...' : 'Verify & Delete Account'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setDeleteSessionToken(null);
                    setShowDeleteConfirm(false);
                    setOtp('');
                  }} disabled={otpLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
