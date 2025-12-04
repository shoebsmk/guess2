import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase env: set VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE')
}

async function main() {
  const ts = Date.now()
  const email = `demo+${ts}@example.com`
  const password = `DemoPass123!${ts}`

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const res = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (res.error || !res.data.user) {
    console.error('Failed to create login user:', res.error?.message)
    process.exit(1)
  }

  console.log('EMAIL=' + email)
  console.log('PASSWORD=' + password)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
