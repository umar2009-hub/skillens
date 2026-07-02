const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

const router = express.Router();

// Initialize Supabase Admin client for secure deletion
const supabaseAdmin = createClient(config.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Securely delete account with password confirmation
router.post('/delete-account', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Verify the password by attempting to sign in with a temporary client
    const tempClient = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: authData, error: authError } = await tempClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid password. Account deletion failed.' });
    }

    const userId = authData.user.id;

    // 2. Password is correct. Delete the user using the Admin client.
    // This will trigger cascading deletes in the database for all their data.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Failed to delete user via admin api:', deleteError);
      return res.status(500).json({ error: 'Failed to delete user from authentication system' });
    }

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during account deletion' });
  }
});

module.exports = router;
