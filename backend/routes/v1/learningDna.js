const express = require('express');
const router = express.Router();
const learningDnaService = require('../../services/learningDna.service');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

// Middleware to require authentication and set req.user
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  req.supabase = supabase;
  next();
};

router.use(requireAuth);

/**
 * GET /api/v1/learning-dna/global
 * Fetch the user's global learning DNA profile
 */
router.get('/global', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('user_learning_dna')
      .select('*')
      .eq('user_id', req.user.id)
      .is('document_id', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return res.status(200).json(data || null);
  } catch (error) {
    console.error('Error fetching global DNA:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/learning-dna/document/:id
 * Fetch the user's learning DNA profile for a specific document
 */
router.get('/document/:id', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('user_learning_dna')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('document_id', req.params.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return res.status(200).json(data || null);
  } catch (error) {
    console.error('Error fetching document DNA:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/learning-dna/recalculate
 * Manually force a recalculation of DNA. Body can optionally include documentId.
 */
router.post('/recalculate', async (req, res) => {
  try {
    const { documentId } = req.body; // If null, calculates global
    const accessToken = req.headers.authorization?.split(' ')[1];
    const result = await learningDnaService.recalculateDNA(req.user.id, documentId, accessToken);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error recalculating DNA:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
