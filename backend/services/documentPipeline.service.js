const pdfService = require('./pdf.service');
const backgroundPipelineService = require('./backgroundPipeline.service');
const summaryService = require('./summary.service');
const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const documentPipelineService = {
  /**
   * Orchestrates the entire document processing pipeline (Extract -> AI Summary -> DB).
   */
  processDocument: async (documentId, storagePath, accessToken) => {
    // We instantiate a user-scoped client for status updates that are outside the sub-services
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    let extractedData = null;
    let userId = null;

    try {
      logger.info(`[Pipeline] Starting for document ${documentId}`);

      // 1. Fetch User ID from the session (we need it to save to document_summaries)
      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Could not resolve authenticated user from token.");
      }
      userId = user.id;

      // 2. Extract PDF Text (Sets DB status to text_extracted)
      extractedData = await pdfService.extractPdfText(documentId, storagePath, accessToken);
      
      // 3. Mark document as completed (Extraction finished)
      await userSupabase
        .from('documents')
        .update({
          status: 'completed',
          processing_stage: 'Ready',
          processing_progress: 100
        })
        .eq('id', documentId);

      // 4. Create placeholder records for all AI modules with status='processing'
      // This allows the frontend to show loading skeletons immediately
      const notesService = require('./notes.service');
      const flashcardsService = require('./flashcards.service');
      const quizService = require('./quiz.service');
      
      await Promise.all([
        summaryService.saveSummary(documentId, accessToken, { userId, status: 'processing' }),
        notesService.saveNotes(documentId, accessToken, { userId, status: 'processing' }),
        flashcardsService.saveFlashcards(documentId, accessToken, { userId, status: 'processing', cards: [] }),
        quizService.saveQuiz(documentId, accessToken, { userId, status: 'processing', questions: [] })
      ]);

      // 5. Fire and forget the background AI generation
      // Notice we DO NOT await this! It runs independently.
      backgroundPipelineService.runBackgroundAI(documentId, userId, extractedData.extractedText || '', accessToken)
        .catch(err => logger.error(`[Background Orchestration Error]`, err));

      logger.info(`[Pipeline] Extraction finished and background AI spawned for ${documentId}`);
      
      return {
        documentId,
        status: 'completed'
      };

    } catch (error) {
      logger.error(`[Pipeline] Fatal Pipeline Error for ${documentId}:`, error);
      throw error;
    }
  }
};

module.exports = documentPipelineService;
