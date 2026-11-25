const { createClient } = require('@supabase/supabase-js');

// The service_role key bypasses Row Level Security, so it must stay on the server.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

module.exports = supabase;
