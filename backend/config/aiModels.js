/**
 * Centralized Configuration for AI Models
 * Ensures the application is compatible with the latest Google Gemini API Free Tier offerings.
 */

module.exports = {
  // Model for small to medium payloads
  DEFAULT_MODEL: 'gemini-2.5-flash',
  
  // Faster, more token-efficient model for massive payloads
  LARGE_CONTEXT_MODEL: 'gemini-2.5-flash',
  
  // Fallback chain when a model hits a 429 / 503 / 404 error
  FALLBACK_MODELS: [
    'gemini-2.5-flash'
  ],
  
  // Character threshold to switch from DEFAULT to LARGE_CONTEXT
  LARGE_REQUEST_THRESHOLD: 20000,
  
  // Maximum retry attempts when encountering rate limits
  MAX_RETRIES: 4
};
