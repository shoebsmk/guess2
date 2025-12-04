import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL for backend')
if (!supabaseServiceKey) throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE for backend')

// Create admin client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
