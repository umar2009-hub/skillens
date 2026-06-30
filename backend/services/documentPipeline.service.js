const pdfService = require('./pdf.service');
const aiService = require('./ai.service');
const summaryService = require('./summary.service');
const AI_STAGES = require('../config/aiStages');
const summaryPrompt = require('../prompts/summaryPrompt');
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
      
      // 3. Mark as ai_processing
      await userSupabase
        .from('documents')
        .update({
          status: 'ai_processing',
          processing_stage: 'Generating AI Assets',
          processing_progress: 50
        })
        .eq('id', documentId);

      // --- FEATURE: SUMMARY ---
      try {
        const aiSummaryResult = await aiService.generateStructuredOutput({
          stage: AI_STAGES.SUMMARY,
          text: extractedData.extractedText || '',
          prompt: summaryPrompt
        });
        await summaryService.saveSummary(documentId, accessToken, {
          userId,
          ...aiSummaryResult.data,
          model_name: aiSummaryResult.model_name,
          processing_time_ms: aiSummaryResult.processing_time_ms,
          status: 'completed',
          retry_count: 0
        });
      } catch (aiError) {
        logger.error(`[Pipeline] AI Summary Generation Failed for ${documentId}`, aiError);
        await summaryService.saveSummary(documentId, accessToken, {
          userId,
          status: 'failed',
          error_message: aiError.message,
          retry_count: 1
        });
      }

      // --- FEATURE: SMART NOTES ---
      const notesService = require('./notes.service');
      const notesPrompt = require('../prompts/notesPrompt');
      
      try {
        const aiNotesResult = await aiService.generateStructuredOutput({
          stage: AI_STAGES.NOTES,
          text: extractedData.extractedText || '',
          prompt: notesPrompt
        });
        await notesService.saveNotes(documentId, accessToken, {
          userId,
          ...aiNotesResult.data,
          model_name: aiNotesResult.model_name,
          processing_time_ms: aiNotesResult.processing_time_ms,
          status: 'completed',
          retry_count: 0
        });
      } catch (notesError) {
        logger.error(`[Pipeline] AI Notes Generation Failed for ${documentId}`, notesError);
        await notesService.saveNotes(documentId, accessToken, {
          userId,
          status: 'failed',
          error_message: notesError.message,
          retry_count: 1
        });
      }

      // --- FEATURE: FLASHCARDS ---
      const flashcardsService = require('./flashcards.service');
      const flashcardsPrompt = require('../prompts/flashcardsPrompt');
      
      try {
        const aiFlashcardsResult = await aiService.generateStructuredOutput({
          stage: AI_STAGES.FLASHCARDS,
          text: extractedData.extractedText || '',
          prompt: flashcardsPrompt
        });
        await flashcardsService.saveFlashcards(documentId, accessToken, {
          userId,
          ...aiFlashcardsResult.data,
          model_name: aiFlashcardsResult.model_name,
          processing_time_ms: aiFlashcardsResult.processing_time_ms,
          status: 'completed',
          retry_count: 0
        });
      } catch (flashcardsError) {
        logger.error(`[Pipeline] AI Flashcards Generation Failed for ${documentId}`, flashcardsError);
        await flashcardsService.saveFlashcards(documentId, accessToken, {
          userId,
          status: 'failed',
          error_message: flashcardsError.message,
          retry_count: 1
        });
      }

      // 6. Mark Document as Completed (Pipeline finished)
      await userSupabase
        .from('documents')
        .update({
          status: 'completed',
          processing_stage: 'Ready',
          processing_progress: 100
        })
        .eq('id', documentId);

      logger.info(`[Pipeline] Pipeline finished for ${documentId}`);
      
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
