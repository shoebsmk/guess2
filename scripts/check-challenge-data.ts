import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const service = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!url || !service) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE envs')
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const today = new Date().toISOString().split('T')[0]

  const { data: challenge } = await admin
    .from('challenges')
    .select('*')
    .eq('active_date', today)
    .eq('is_active', true)
    .maybeSingle()

  console.log('Today challenge:', challenge?.id, challenge?.title)

  const targetId = challenge?.id
  const { data: latest } = await admin
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('active_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const id = targetId || latest?.id
  console.log('Using challenge id:', id)

  if (!id) {
    console.log('No challenge found')
    return
  }

  const { data: questions } = await admin
    .from('questions')
    .select('id, question_text, order_index, answers(id, answer_text, is_correct)')
    .eq('challenge_id', id)
    .order('order_index', { ascending: true })

  console.log('Questions count:', questions?.length || 0)
  console.log(JSON.stringify(questions, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
