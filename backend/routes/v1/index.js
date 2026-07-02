const express = require('express');
const router = express.Router();

// Base route for v1
router.get('/', (req, res) => {
  res.json({ message: 'SkillLens API v1' });
});

router.use('/documents', require('./documents'));
router.use('/learning-dna', require('./learningDna'));
router.use('/mentor', require('./mentor'));

// Placeholders for future routes
// router.use('/auth', require('./auth.routes'));
// router.use('/upload', require('./upload.routes'));
router.use('/analytics', require('../../modules/analytics/analytics.routes'));
router.use('/revision', require('../../modules/revision/revision.routes'));
// router.use('/quiz', require('./quiz.routes'));

module.exports = router;
