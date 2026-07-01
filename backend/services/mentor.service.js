const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const aiService = require('./ai.service');
const mentorContextService = require('./mentorContext.service');
const logger = require('../utils/logger');

const mentorService = {
  /**
   * Processes a mentor chat message and streams the response directly to the client via SSE
   */
  processChatStream: async (userId, documentId, message, accessToken, res) => {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    try {
      // 1. Log user message immediately
      await supabase.from('mentor_conversations').insert({
        user_id: userId,
        document_id: documentId,
        role: 'user',
        message: message
      });

      // 2. Build optimized context
      const prompt = await mentorContextService.buildContext(userId, documentId, message, accessToken);
      
      // 3. Setup SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Ensure headers are sent immediately

      // 4. Stream AI Response
      logger.info(`[Mentor] Streaming response for doc: ${documentId}`);
      const fullResponse = await aiService.generateTextStream({ prompt, res });

      // 5. Log AI response
      await supabase.from('mentor_conversations').insert({
        user_id: userId,
        document_id: documentId,
        role: 'model',
        message: fullResponse
      });

      // 6. End stream safely
      res.write('data: [DONE]\n\n');
      res.end();
      
    } catch (error) {
      logger.error('[Mentor] Error in chat stream:', error);
      res.write(`data: ${JSON.stringify({ error: "Failed to generate response. Please try again." })}\n\n`);
      res.end();
    }
  },

  getHistory: async (userId, documentId, accessToken) => {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    let query = supabase
      .from('mentor_conversations')
      .select('role, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (documentId) query = query.eq('document_id', documentId);
    else query = query.is('document_id', null);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  clearHistory: async (userId, documentId, accessToken) => {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    let query = supabase
      .from('mentor_conversations')
      .delete()
      .eq('user_id', userId);

    if (documentId) query = query.eq('document_id', documentId);
    else query = query.is('document_id', null);

    const { error } = await query;

    if (error) throw error;
    return true;
  }
};

module.exports = mentorService;
