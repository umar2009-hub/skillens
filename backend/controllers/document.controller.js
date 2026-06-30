const documentPipelineService = require('../services/documentPipeline.service');
const logger = require('../utils/logger');

const documentController = {
  extractDocument: async (req, res, next) => {
    try {
      const { documentId, storagePath, accessToken } = req.body;

      if (!documentId || !storagePath || !accessToken) {
        return res.status(400).json({ error: 'documentId, storagePath, and accessToken are required.' });
      }

      logger.info(`Extract API called for document ${documentId}`);

      // Defer all business logic to the pipeline service
      const result = await documentPipelineService.processDocument(documentId, storagePath, accessToken);

      return res.status(200).json(result);
    } catch (error) {
      logger.error(`Error in extractDocument controller:`, error);
      return res.status(500).json({ error: error.message || 'Extraction failed' });
    }
  },

  getDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getDocumentSummary: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('document_summaries')
        .select('*')
        .eq('document_id', id)
        .single();
        
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = documentController;
