const pdfService = require('../services/pdf.service');
const logger = require('../utils/logger');

const documentController = {
  extractDocument: async (req, res, next) => {
    try {
      const { documentId, storagePath, accessToken } = req.body;

      if (!documentId || !storagePath || !accessToken) {
        return res.status(400).json({ error: 'documentId, storagePath, and accessToken are required.' });
      }

      logger.info(`Extract API called for document ${documentId}`);

      // Perform extraction
      const result = await pdfService.extractPdfText(documentId, storagePath, accessToken);

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in extractDocument controller:', error);
      next(error);
    }
  }
};

module.exports = documentController;
