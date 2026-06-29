const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

let supabase = null;

if (config.supabaseUrl && config.supabaseKey) {
  supabase = createClient(config.supabaseUrl, config.supabaseKey);
}

module.exports = supabase;
