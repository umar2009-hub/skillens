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
  },

  getDocumentNotes: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('document_notes')
        .select('*')
        .eq('document_id', id)
        .single();
        
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getDocumentFlashcards: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      const flashcardsService = require('../services/flashcards.service');
      const data = await flashcardsService.getFlashcards(id, accessToken);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getFlashcardsProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      const flashcardsService = require('../services/flashcards.service');
      const data = await flashcardsService.getProgress(id, accessToken);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateFlashcardProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const { flashcardId, progressData } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      if (!flashcardId || !progressData) {
        return res.status(400).json({ error: 'flashcardId and progressData are required' });
      }

      const flashcardsService = require('../services/flashcards.service');
      await flashcardsService.updateProgress(id, flashcardId, progressData, accessToken);
      
      return res.status(200).json({ message: 'Progress updated' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getFlashcardHint: async (req, res) => {
    try {
      const { question, topic } = req.body;
      if (!question) return res.status(400).json({ error: 'Question is required' });
      
      const aiService = require('../services/ai.service');
      const prompt = `You are a helpful professor. The student is stuck on a flashcard. Provide ONE single hint for the question. DO NOT reveal the answer. Return strictly JSON: {"hint": "..."}. Topic: ${topic || 'General'}. Question: ${question}`;
      
      const data = await aiService.generateSimpleJSON({ prompt });
      return res.status(200).json(data);
    } catch (error) {
      console.error('Hint API Error:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  getFlashcardExplanation: async (req, res) => {
    try {
      const { question, answer, topic } = req.body;
      if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });

      const aiService = require('../services/ai.service');
      const prompt = `You are a helpful professor. Explain this flashcard in more depth. Return strictly JSON: {"explanation": "..."}. Topic: ${topic || 'General'}. Question: ${question}. Answer: ${answer}`;
      
      const data = await aiService.generateSimpleJSON({ prompt });
      return res.status(200).json(data);
    } catch (error) {
      console.error('Explain API Error:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  cancelDocument: async (req, res) => {
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
        .update({ status: 'cancelled', processing_stage: 'Cancelled by user' })
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json({ message: 'Document processing cancelled successfully', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  retryDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // 1. Fetch document to get storagePath
      const { data: doc, error: fetchError } = await userSupabase
        .from('documents')
        .select('id, storage_path, status')
        .eq('id', id)
        .single();
        
      if (fetchError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // 2. Set back to initializing
      await userSupabase
        .from('documents')
        .update({ status: 'queued', processing_stage: 'Initializing retry...', processing_progress: 0 })
        .eq('id', id);

      // 3. Kick off pipeline (fire and forget for frontend to listen via realtime)
      documentPipelineService.processDocument(id, doc.storage_path, accessToken).catch(err => {
         logger.error(`Retry pipeline failed for ${id}`, err);
      });

      return res.status(200).json({ message: 'Retry initiated', documentId: id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('document_quizzes')
        .select('*')
        .eq('document_id', id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return res.status(200).json({ status: 'processing', data: null });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  startQuizSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { quizId } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });
      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user) throw new Error("Unauthorized");
      const userId = user.id;
      
      const quizService = require('../services/quiz.service');
      const session = await quizService.startSession(id, userId, quizId, accessToken);
      
      return res.status(200).json(session);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  submitQuizAttempt: async (req, res) => {
    try {
      const { id } = req.params;
      const attemptData = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });
      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user) throw new Error("Unauthorized");
      
      attemptData.userId = user.id;
      attemptData.documentId = id;
      
      const quizService = require('../services/quiz.service');
      await quizService.saveAttempt(attemptData, accessToken);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  finishQuizSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const quizService = require('../services/quiz.service');
      await quizService.finishSession(sessionId, accessToken);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getQuizAnalytics: async (req, res) => {
    try {
      const { id, sessionId } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // Fetch attempts for this session
      const { data: attempts, error: fetchError } = await userSupabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('session_id', sessionId);
        
      if (fetchError) throw fetchError;

      const aiService = require('../services/ai.service');
      const prompt = `You are an intelligent tutor. Analyze this quiz session performance and generate a personalized learning report. 
      Return STRICT JSON matching this structure:
      {
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."],
        "topics_to_revise": ["...", "..."],
        "confidence_analysis": "...",
        "learning_pattern": "...",
        "suggested_study_order": ["...", "..."],
        "estimated_revision_time_minutes": 15,
        "motivational_feedback": "..."
      }
      
      Session Data:
      ${JSON.stringify(attempts.map(a => ({ topic: a.topic, difficulty: a.difficulty, correct: a.is_correct, confidence: a.confidence, time: a.time_taken })))}`;
      
      const analytics = await aiService.generateSimpleJSON({ prompt });
      
      return res.status(200).json({ analytics, attempts });
    } catch (error) {
      console.error('Quiz Analytics API Error:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // 1. Fetch document to get storagePath
      const { data: doc, error: fetchError } = await userSupabase
        .from('documents')
        .select('storage_path')
        .eq('id', id)
        .single();
        
      if (fetchError || !doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // 2. Delete file from storage
      if (doc.storage_path) {
        await userSupabase.storage
          .from('documents')
          .remove([doc.storage_path]);
      }

      // 3. Delete document record (cascade will handle related tables)
      const { error: deleteError } = await userSupabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = documentController;
