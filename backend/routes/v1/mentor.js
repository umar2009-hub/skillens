const express = require('express');
const router = express.Router();
const mentorService = require('../../services/mentor.service');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  req.accessToken = token;
  next();
};

router.use(requireAuth);

/**
 * POST /api/v1/mentor/chat
 * Send a message to the mentor and receive a streaming response
 */
router.post('/chat', async (req, res) => {
  try {
    const { documentId, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    
    // Pass control to service for SSE streaming
    await mentorService.processChatStream(req.user.id, documentId || null, message, req.accessToken, res);
  } catch (error) {
    console.error('Error in Mentor Chat API:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
});

/**
 * GET /api/v1/mentor/history/:documentId
 * Fetch conversation history
 */
router.get(['/history', '/history/:documentId'], async (req, res) => {
  try {
    const documentId = req.params.documentId === 'global' ? null : (req.params.documentId || null);
    const history = await mentorService.getHistory(req.user.id, documentId, req.accessToken);
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching Mentor history:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/mentor/history/:documentId
 * Clear conversation history
 */
router.delete(['/history', '/history/:documentId'], async (req, res) => {
  try {
    const documentId = req.params.documentId === 'global' ? null : (req.params.documentId || null);
    await mentorService.clearHistory(req.user.id, documentId, req.accessToken);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error clearing Mentor history:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
