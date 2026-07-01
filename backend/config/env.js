require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY'
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error(`[FATAL ERROR] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please configure these in your deployment dashboard or local .env file.');
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.warn(`[WARNING] FRONTEND_URL is not set. CORS might block requests in production.`);
}

// Strip trailing slash from FRONTEND_URL if user accidentally added one
const formattedFrontendUrl = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.replace(/\/+$/, '') 
  : undefined;

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: formattedFrontendUrl,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
