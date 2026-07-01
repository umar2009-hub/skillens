const { GoogleGenerativeAI } = require('@google/generative-ai');
const AI_CONFIG = require('../config/ai');
const AI_MODELS = require('../config/aiModels');
const logger = require('../utils/logger');

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const aiService = {
  /**
   * Generates a structured JSON output from Gemini based on the stage and prompt.
   * @param {Object} params
   * @param {string} params.stage - The AI stage (e.g. AI_STAGES.SUMMARY)
   * @param {string} params.text - The extracted text
   * @param {string} params.prompt - The system prompt enforcing the schema
   * @param {number} [retryCount=0] - Current retry iteration
   * @returns {Object} { data: Object, processing_time_ms: number, model_name: string }
   */
  generateStructuredOutput: async ({ stage, text, prompt, retryCount = 0 }) => {
    const start = Date.now();
    
    let modelName;
    if (retryCount === 0) {
      // First attempt: Route based on payload size
      modelName = text.length > AI_MODELS.LARGE_REQUEST_THRESHOLD 
        ? AI_MODELS.LARGE_CONTEXT_MODEL 
        : AI_MODELS.DEFAULT_MODEL;
    } else {
      // Retry attempt: Fallback to next available model
      modelName = AI_MODELS.FALLBACK_MODELS[retryCount % AI_MODELS.FALLBACK_MODELS.length];
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
      }

      logger.info(`[${stage}] Starting AI generation (Retry: ${retryCount}, Model: ${modelName})`);

      // 1. Large Document Strategy
      let processedText = text;
      if (text.length > AI_CONFIG.MAX_SUMMARY_INPUT) {
        logger.info(`[${stage}] Text exceeds MAX_SUMMARY_INPUT (${text.length} > ${AI_CONFIG.MAX_SUMMARY_INPUT}). Sampling...`);
        const partSize = Math.floor(AI_CONFIG.MAX_SUMMARY_INPUT / 3);
        const startText = text.substring(0, partSize);
        const midText = text.substring(Math.floor(text.length / 2) - Math.floor(partSize / 2), Math.floor(text.length / 2) + Math.floor(partSize / 2));
        const endText = text.substring(text.length - partSize);
        processedText = `${startText}\n\n...[CONTENT OMITTED FOR BREVITY]...\n\n${midText}\n\n...[CONTENT OMITTED FOR BREVITY]...\n\n${endText}`;
      }

      // 2. Call Gemini
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const fullPrompt = `${prompt}\n\nDOCUMENT TEXT:\n${processedText}`;
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();
      
      // 3. Parse and Validate JSON
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
      }

      // Perform validation based on stage
      aiService._validateSchema(stage, parsedData);

      const processing_time_ms = Date.now() - start;
      logger.info(`[${stage}] Generation successful in ${processing_time_ms}ms with ${modelName}`);

      return {
        data: parsedData,
        processing_time_ms,
        model_name: modelName
      };

    } catch (error) {
      logger.error(`[${stage}] AI Generation Error with ${modelName}:`, error.message);
      
      const isRateLimit = error.status === 429 || error.status === 503 || error.message.includes('429') || error.message.includes('Quota');

      if (retryCount < AI_MODELS.MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s, 16s
        const backoffMs = Math.pow(2, retryCount) * 2000;
        logger.info(`[${stage}] ${isRateLimit ? 'Rate limit hit' : 'Error'}. Waiting ${backoffMs}ms before retrying AI generation...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return aiService.generateStructuredOutput({ stage, text, prompt, retryCount: retryCount + 1 });
      }
      
      throw error;
    }
  },

  /**
   * Generates a simple JSON output without strict stage validation (e.g., for hints, explanations, analytics)
   * Uses the same dynamic routing logic as generateStructuredOutput
   */
  generateSimpleJSON: async ({ text, prompt, retryCount = 0 }) => {
    const start = Date.now();
    
    let modelName;
    if (retryCount === 0) {
      modelName = (text && text.length > AI_MODELS.LARGE_REQUEST_THRESHOLD)
        ? AI_MODELS.LARGE_CONTEXT_MODEL 
        : AI_MODELS.DEFAULT_MODEL;
    } else {
      modelName = AI_MODELS.FALLBACK_MODELS[retryCount % AI_MODELS.FALLBACK_MODELS.length];
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
      }

      logger.info(`[SimpleJSON] Starting AI generation (Retry: ${retryCount}, Model: ${modelName})`);

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const fullPrompt = text ? `${prompt}\n\nCONTEXT:\n${text}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();
      
      let parsedData;
      try {
        // Handle potential markdown formatting from Gemini
        let cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedData = JSON.parse(cleanText);
      } catch (parseErr) {
        throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
      }

      const processing_time_ms = Date.now() - start;
      logger.info(`[SimpleJSON] Generation successful in ${processing_time_ms}ms with ${modelName}`);

      return parsedData;

    } catch (error) {
      logger.error(`[SimpleJSON] AI Generation Error with ${modelName}:`, error.message);
      
      const isRateLimit = error.status === 429 || error.status === 503 || error.message.includes('429') || error.message.includes('Quota');

      if (retryCount < AI_MODELS.MAX_RETRIES) {
        const backoffMs = Math.pow(2, retryCount) * 2000;
        logger.info(`[SimpleJSON] ${isRateLimit ? 'Rate limit hit' : 'Error'}. Waiting ${backoffMs}ms before retrying...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return aiService.generateSimpleJSON({ text, prompt, retryCount: retryCount + 1 });
      }
      
      throw error;
    }
  },

  /**
   * Strictly validates the parsed JSON based on the expected schema for the stage.
   */
  _validateSchema: (stage, data) => {
    if (stage === require('../config/aiStages').SUMMARY) {
      if (!data.executive_summary || typeof data.executive_summary !== 'string') {
        throw new Error("Validation Failed: 'executive_summary' is missing or invalid.");
      }
      if (!Array.isArray(data.key_concepts)) {
        throw new Error("Validation Failed: 'key_concepts' must be an array.");
      }
      if (!Array.isArray(data.topics)) {
        throw new Error("Validation Failed: 'topics' must be an array.");
      }
      
      const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
      if (!validDifficulties.includes(data.difficulty_level)) {
        throw new Error(`Validation Failed: 'difficulty_level' must be one of: ${validDifficulties.join(', ')}`);
      }

      if (!data.estimated_study_time || typeof data.estimated_study_time.hours !== 'number' || typeof data.estimated_study_time.minutes !== 'number') {
        throw new Error("Validation Failed: 'estimated_study_time' must contain numeric 'hours' and 'minutes'.");
      }
    }

    if (stage === require('../config/aiStages').NOTES) {
      if (!data.title || typeof data.title !== 'string') {
        throw new Error("Validation Failed: 'title' is missing or invalid.");
      }
      if (!data.overview || typeof data.overview !== 'string') {
        throw new Error("Validation Failed: 'overview' is missing.");
      }
      if (!Array.isArray(data.sections)) {
        throw new Error("Validation Failed: 'sections' must be an array.");
      }
      data.sections.forEach((section, index) => {
        if (!section.heading || typeof section.heading !== 'string') {
          throw new Error(`Validation Failed: 'heading' missing in section ${index}`);
        }
        if (!section.concept_explanation || typeof section.concept_explanation !== 'string') {
          throw new Error(`Validation Failed: 'concept_explanation' missing in section ${index}`);
        }
      });
    }

    if (stage === require('../config/aiStages').FLASHCARDS) {
      if (!Array.isArray(data.cards)) {
        throw new Error("Validation Failed: 'cards' must be an array.");
      }
      data.cards.forEach((card, index) => {
        if (!card.id || typeof card.id !== 'string') throw new Error(`Validation Failed: 'id' missing in card ${index}`);
        if (!card.topic || typeof card.topic !== 'string') throw new Error(`Validation Failed: 'topic' missing in card ${index}`);
        if (!card.question || typeof card.question !== 'string') throw new Error(`Validation Failed: 'question' missing in card ${index}`);
        if (!card.answer || typeof card.answer !== 'string') throw new Error(`Validation Failed: 'answer' missing in card ${index}`);
        if (!card.concept_explanation || typeof card.concept_explanation !== 'string') throw new Error(`Validation Failed: 'concept_explanation' missing in card ${index}`);
        if (!card.difficulty || typeof card.difficulty !== 'string') throw new Error(`Validation Failed: 'difficulty' missing in card ${index}`);
      });
    }

    if (stage === require('../config/aiStages').QUIZ) {
      if (!Array.isArray(data.questions)) {
        throw new Error("Validation Failed: 'questions' must be an array.");
      }
      data.questions.forEach((q, index) => {
        if (!q.id || typeof q.id !== 'string') throw new Error(`Validation Failed: 'id' missing in question ${index}`);
        if (!q.type || typeof q.type !== 'string') throw new Error(`Validation Failed: 'type' missing in question ${index}`);
        if (!q.topic || typeof q.topic !== 'string') throw new Error(`Validation Failed: 'topic' missing in question ${index}`);
        if (!q.difficulty || typeof q.difficulty !== 'string') throw new Error(`Validation Failed: 'difficulty' missing in question ${index}`);
        if (!q.question || typeof q.question !== 'string') throw new Error(`Validation Failed: 'question' missing in question ${index}`);
        if (!q.correct_answer) throw new Error(`Validation Failed: 'correct_answer' missing in question ${index}`);
        if (!q.explanation || typeof q.explanation !== 'string') throw new Error(`Validation Failed: 'explanation' missing in question ${index}`);
      });
    }
  }
};

module.exports = aiService;
