import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase env: set VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE')
}

async function main() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // List users from public.users (safe fields only)
  const { data, error } = await admin.from('users').select('id,email,username,is_premium,is_admin,created_at').order('created_at', { ascending: false })
  if (error) {
    console.error('Error listing users:', error.message)
    process.exit(1)
  }

  console.log(JSON.stringify(data, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
