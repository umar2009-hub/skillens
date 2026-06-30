const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn('Missing Supabase credentials in backend config.');
}

// Ensure you use the Service Role Key for backend operations if bypassing RLS is needed,
// but for standard operations Anon key works if RLS allows it.
// The user prompt indicates standard setup, we will use the provided key.
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

module.exports = supabase;
