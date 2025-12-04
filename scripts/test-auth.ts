import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
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
  const timestamp = Date.now()
  const email = `test+${timestamp}@example.com`
  const password = `Test1234!${timestamp}`

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Create user via admin API (email confirmed)
  const createRes = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  const createdOk = !!createRes.data.user && !createRes.error
  log('Create user', createdOk, createdOk ? createRes.data.user?.id : createRes.error?.message)
  if (!createdOk) process.exit(1)

  // Login with password
  const signInRes = await client.auth.signInWithPassword({ email, password })
  const signInOk = !!signInRes.data.session && !signInRes.error
  log('Login with password', signInOk, signInOk ? signInRes.data.session?.user?.email ?? '' : signInRes.error?.message)
  if (!signInOk) process.exit(1)

  // Verify current user
  const me = await client.auth.getUser()
  const meOk = !!me.data.user && me.data.user?.email === email
  log('Get current user', meOk, meOk ? me.data.user?.id ?? '' : me.error?.message)

  // Update username in profile and verify RLS allows updating own row
  const username = `u_${timestamp}`
  const updateRes = await client.from('users').update({ username }).eq('id', me.data.user!.id)
  const updateOk = !updateRes.error
  log('Update own username', updateOk, updateOk ? username : updateRes.error?.message)

  const profileRes = await client.from('users').select('username,email').eq('id', me.data.user!.id).maybeSingle()
  const profileOk = !!profileRes.data && profileRes.data.username === username
  log('Read own profile', profileOk, profileOk ? profileRes.data.username : profileRes.error?.message)

  // Cleanup: delete user
  if (createRes.data.user?.id) {
    await admin.auth.admin.deleteUser(createRes.data.user.id)
  }

  console.log('Auth workflow test completed successfully.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
