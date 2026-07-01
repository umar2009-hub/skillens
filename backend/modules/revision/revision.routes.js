const express = require('express');
const router = express.Router();
const revisionController = require('./revision.controller');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

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

router.get('/plan', revisionController.getRevisionPlan);
router.post('/action', revisionController.recordRevisionAction);

module.exports = router;
