const aiService = require('./ai.service');
const summaryService = require('./summary.service');
const notesService = require('./notes.service');
const flashcardsService = require('./flashcards.service');
const quizService = require('./quiz.service');
const AI_STAGES = require('../config/aiStages');
const summaryPrompt = require('../prompts/summaryPrompt');
const notesPrompt = require('../prompts/notesPrompt');
const flashcardsPrompt = require('../prompts/flashcardsPrompt');
const quizPrompt = require('../prompts/quizPrompt');
const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const backgroundPipelineService = {
  
  runBackgroundAI: async (documentId, userId, extractedText, accessToken, moduleToRun = 'all') => {
    logger.info(`[Background] Starting Async Pipeline for document ${documentId} (Module: ${moduleToRun})`);
    
    try {
      const promisesToRun = [];

      // Create independent promises for each AI module
      const generateSummary = async () => {
        try {
          // Set processing state first
          await summaryService.saveSummary(documentId, accessToken, { userId, status: 'processing' });
          const aiSummaryResult = await aiService.generateStructuredOutput({
            stage: AI_STAGES.SUMMARY,
            text: extractedText,
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
          logger.info(`[Background] Summary completed for ${documentId}`);
        } catch (error) {
          logger.error(`[Background] Summary failed for ${documentId}`, error);
          await summaryService.saveSummary(documentId, accessToken, {
            userId,
            status: 'failed',
            error_message: error.message,
            retry_count: 1
          });
        }
      };

      const generateNotes = async () => {
        try {
          await notesService.saveNotes(documentId, accessToken, { userId, status: 'processing' });
          const aiNotesResult = await aiService.generateStructuredOutput({
            stage: AI_STAGES.NOTES,
            text: extractedText,
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
          logger.info(`[Background] Notes completed for ${documentId}`);
        } catch (error) {
          logger.error(`[Background] Notes failed for ${documentId}`, error);
          await notesService.saveNotes(documentId, accessToken, {
            userId,
            status: 'failed',
            error_message: error.message,
            retry_count: 1
          });
        }
      };

      const generateFlashcards = async () => {
        try {
          await flashcardsService.saveFlashcards(documentId, accessToken, { userId, status: 'processing', cards: [] });
          const aiFlashcardsResult = await aiService.generateStructuredOutput({
            stage: AI_STAGES.FLASHCARDS,
            text: extractedText,
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
          logger.info(`[Background] Flashcards completed for ${documentId}`);
        } catch (error) {
          logger.error(`[Background] Flashcards failed for ${documentId}`, error);
          await flashcardsService.saveFlashcards(documentId, accessToken, {
            userId,
            status: 'failed',
            error_message: error.message,
            retry_count: 1
          });
        }
      };

      const generateQuiz = async () => {
        try {
          await quizService.saveQuiz(documentId, accessToken, { userId, status: 'processing', questions: [] });
          const aiQuizResult = await aiService.generateStructuredOutput({
            stage: AI_STAGES.QUIZ,
            text: extractedText,
            prompt: quizPrompt
          });
          await quizService.saveQuiz(documentId, accessToken, {
            userId,
            ...aiQuizResult.data,
            model_name: aiQuizResult.model_name,
            processing_time_ms: aiQuizResult.processing_time_ms,
            status: 'completed',
            retry_count: 0
          });
          logger.info(`[Background] Quiz completed for ${documentId}`);
        } catch (error) {
          logger.error(`[Background] Quiz failed for ${documentId}`, error);
          await quizService.saveQuiz(documentId, accessToken, {
            userId,
            status: 'failed',
            error_message: error.message,
            retry_count: 1
          });
        }
      };

      if (moduleToRun === 'all' || moduleToRun === 'summary') promisesToRun.push(generateSummary());
      if (moduleToRun === 'all' || moduleToRun === 'notes') promisesToRun.push(generateNotes());
      if (moduleToRun === 'all' || moduleToRun === 'flashcards') promisesToRun.push(generateFlashcards());
      if (moduleToRun === 'all' || moduleToRun === 'quiz') promisesToRun.push(generateQuiz());

      // Execute independently using Promise.allSettled
      await Promise.allSettled(promisesToRun);

      logger.info(`[Background] Async tasks finished for ${documentId} (Module: ${moduleToRun})`);

    } catch (error) {
      logger.error(`[Background] Fatal Error in background orchestration for ${documentId}:`, error);
    }
  }
};

module.exports = backgroundPipelineService;
