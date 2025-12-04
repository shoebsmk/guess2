import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yvqnfghaydvatdlguorq.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase env: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE')
}

function log(title: string, ok: boolean, detail?: string) {
  const status = ok ? 'PASS' : 'FAIL'
  console.log(`${status} - ${title}${detail ? `: ${detail}` : ''}`)
}

async function main() {
  const ts = Date.now()
  const email = `rls+${ts}@example.com`
  const password = `RlsPass123!${ts}`

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  const userId = created.data.user?.id
  log('Create user', !!userId && !created.error, userId)
  if (!userId) process.exit(1)

  const signed = await client.auth.signInWithPassword({ email, password })
  log('Login', !!signed.data.session && !signed.error)
  if (!signed.data.user) process.exit(1)

  // Attempt to insert another user row (should fail RLS)
  const badInsert = await client.from('users').insert({ id: '00000000-0000-0000-0000-000000000000', email: 'bad@example.com', username: 'bad' })
  log('Insert other user (expect deny)', !!badInsert.error, badInsert.error?.message)

  // Attempt to update own row (should pass)
  const okUpdate = await client.from('users').update({ username: `rls_user_${ts}` }).eq('id', userId)
  log('Update own user (expect allow)', !okUpdate.error, okUpdate.error?.message)

  // Ensure profile exists from trigger
  const prof = await client.from('users').select('id,email,username').eq('id', userId).maybeSingle()
  log('Profile exists via trigger', !!prof.data && !prof.error, prof.data?.email)

  await admin.auth.admin.deleteUser(userId)
}

main().catch((e) => { console.error(e); process.exit(1) })
