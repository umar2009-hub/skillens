const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const { generateDeleteOTP, verifyDeleteOTP, generateAuthOTP, verifyAuthOTP } = require('../../utils/tokens');
const { sendDeletionEmail, sendRegistrationEmail, sendPasswordResetEmail } = require('../../services/email.service');

const router = express.Router();

// Get admin client for manipulating users
const supabaseAdmin = createClient(config.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseKey);

// ==========================================
// REGISTRATION (OTP FLOW)
// ==========================================

router.post('/register/request', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    // Check if user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) console.warn('Could not list users (needs service role key). Proceeding anyway.');
    
    if (users && users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { otp, sessionToken } = generateAuthOTP(email, 'registration');
    await sendRegistrationEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent successfully', sessionToken });
  } catch (error) {
    console.error('Register Request Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to request registration' });
  }
});

router.post('/register/confirm', async (req, res) => {
  try {
    const { sessionToken, otp, password, name } = req.body;
    if (!sessionToken || !otp || !password || !name) return res.status(400).json({ error: 'Missing fields' });

    const decoded = verifyAuthOTP(sessionToken, otp, 'registration');
    const email = decoded.email;

    // Create user in Supabase (Requires Service Role Key)
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (createError) {
      if (createError.message.includes('not allowed')) {
        throw new Error('Supabase Service Role Key is required in backend .env to create users via this method.');
      }
      throw createError;
    }

    return res.status(200).json({ message: 'Registration successful', user });
  } catch (error) {
    console.error('Register Confirm Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to confirm registration' });
  }
});

// ==========================================
// PASSWORD RESET (OTP FLOW)
// ==========================================

router.post('/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { otp, sessionToken } = generateAuthOTP(email, 'password_reset');
    await sendPasswordResetEmail(email, otp);

    return res.status(200).json({ message: 'Password reset OTP sent', sessionToken });
  } catch (error) {
    console.error('Reset Request Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to request password reset' });
  }
});

router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { sessionToken, otp, newPassword } = req.body;
    if (!sessionToken || !otp || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    const decoded = verifyAuthOTP(sessionToken, otp, 'password_reset');
    const email = decoded.email;

    // Find the user ID by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw new Error('Supabase Service Role Key is required to reset passwords via this method.');

    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) throw updateError;

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset Confirm Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to confirm password reset' });
  }
});

// ==========================================
// ACCOUNT DELETION (OTP FLOW)
// ==========================================

router.post('/request-delete', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { otp, sessionToken } = generateDeleteOTP(user.id);
    await sendDeletionEmail(user.email, otp);

    return res.status(200).json({ 
      message: 'Deletion OTP email sent successfully.',
      sessionToken 
    });
  } catch (error) {
    console.error('Delete Request Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to request account deletion' });
  }
});

// Confirm Account Deletion (Verify OTP and Delete)
router.post('/confirm-delete', async (req, res) => {
  try {
    const { sessionToken, otp } = req.body;
    if (!sessionToken || !otp) return res.status(400).json({ error: 'Token and OTP are required' });

    const decoded = verifyDeleteOTP(sessionToken, otp);
    const userId = decoded.sub;

    // 1. Fetch all documents for this user to delete them from storage
    const { data: docs } = await supabaseAdmin
      .from('documents')
      .select('storage_path')
      .eq('user_id', userId);

    if (docs && docs.length > 0) {
      const paths = docs.map(d => d.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await supabaseAdmin.storage.from('documents').remove(paths);
      }
    }

    // 2. Delete user data from public schema documents table
    await supabaseAdmin.from('documents').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 3. Delete user from auth schema (REQUIRES SERVICE ROLE KEY)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.warn('Could not fully delete user from Auth schema (Requires Service Role Key). Data was deleted though.');
      console.warn(deleteError);
    }

    return res.status(200).json({ message: 'Account and all data successfully deleted.' });
  } catch (error) {
    console.error('Confirm Delete Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to delete account' });
  }
});

module.exports = router;
