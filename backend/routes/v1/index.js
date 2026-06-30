const express = require('express');
const router = express.Router();

// Base route for v1
router.get('/', (req, res) => {
  res.json({ message: 'SkillLens API v1' });
});

router.use('/documents', require('./documents'));

// Placeholders for future routes
// router.use('/auth', require('./auth.routes'));
// router.use('/upload', require('./upload.routes'));
// router.use('/mentor', require('./mentor.routes'));
// router.use('/analytics', require('./analytics.routes'));
// router.use('/quiz', require('./quiz.routes'));

module.exports = router;
