const { GoogleGenerativeAI } = require('@google/generative-ai');
const AI_CONFIG = require('../config/ai');
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
    
    // Model fallback strategy: if one model is experiencing high demand (503), try the next.
    const fallbackModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    const MAX_RETRIES = 4;
    const modelName = fallbackModels[retryCount % fallbackModels.length];

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
      logger.error(`[${stage}] AI Generation Error:`, error.message);
      
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s, 16s
        const backoffMs = Math.pow(2, retryCount) * 2000;
        logger.info(`[${stage}] Waiting ${backoffMs}ms before retrying AI generation...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return aiService.generateStructuredOutput({ stage, text, prompt, retryCount: retryCount + 1 });
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
    // Future stages (notes, flashcards, etc.) will add their validation logic here.
  }
};

module.exports = aiService;
