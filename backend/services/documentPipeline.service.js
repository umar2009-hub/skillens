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
          processing_stage: 'Generating AI Summary',
          processing_progress: 50
        })
        .eq('id', documentId);

      // 4. Generate AI Summary
      let aiResult;
      try {
        aiResult = await aiService.generateStructuredOutput({
          stage: AI_STAGES.SUMMARY,
          text: extractedData.extractedText || '',
          prompt: summaryPrompt
        });
      } catch (aiError) {
        // AI Generation Failed
        logger.error(`[Pipeline] AI Generation Failed for ${documentId}`, aiError);
        
        // Save failed summary state
        await summaryService.saveSummary(documentId, accessToken, {
          userId,
          status: 'failed',
          error_message: aiError.message,
          retry_count: 1 // since it already retried internally
        });

        // Set document status to summary_failed, preserving extracted text
        await userSupabase
          .from('documents')
          .update({
            status: 'summary_failed',
            processing_stage: 'AI Summary Failed'
          })
          .eq('id', documentId);
          
        throw aiError;
      }

      // 5. AI Generation Succeeded -> Save Summary
      await summaryService.saveSummary(documentId, accessToken, {
        userId,
        ...aiResult.data,
        model_name: aiResult.model_name,
        processing_time_ms: aiResult.processing_time_ms,
        status: 'completed',
        retry_count: 0
      });

      // 6. Mark Document as Completed
      await userSupabase
        .from('documents')
        .update({
          status: 'completed',
          processing_stage: 'Ready',
          processing_progress: 100
        })
        .eq('id', documentId);

      logger.info(`[Pipeline] Pipeline finished successfully for ${documentId}`);
      
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
