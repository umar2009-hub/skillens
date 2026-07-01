import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function Settings() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      </div>
    </motion.div>
  )
}
