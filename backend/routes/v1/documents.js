const express = require('express');
const documentController = require('../../controllers/document.controller');

const router = express.Router();

// POST /api/v1/documents/extract
router.post('/extract', documentController.extractDocument);

// GET /api/v1/documents/:id
router.get('/:id', documentController.getDocument);

// GET /api/v1/documents/:id/summary
router.get('/:id/summary', documentController.getDocumentSummary);

module.exports = router;
