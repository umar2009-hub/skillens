const express = require('express');
const documentController = require('../../controllers/document.controller');

const router = express.Router();

router.post('/extract', documentController.extractDocument);

module.exports = router;
