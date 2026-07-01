require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'FRONTEND_URL'
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error(`[FATAL ERROR] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please configure these in your Northflank dashboard or local .env file.');
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
