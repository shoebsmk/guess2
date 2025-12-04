import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const service = process.env.VITE_SUPABASE_SERVICE_ROLE

if (!url || !service) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE envs')
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } })

async function seedForChallenge(challengeId: string) {
  const qAndA = [
    {
      question_text: 'Which year did the World Wide Web become publicly available?',
      answers: [
        { answer_text: '1991', is_correct: true },
        { answer_text: '1989', is_correct: false },
        { answer_text: '1995', is_correct: false },
        { answer_text: '2000', is_correct: false },
      ],
    },
    {
      question_text: 'Who wrote the play Hamlet?',
      answers: [
        { answer_text: 'William Shakespeare', is_correct: true },
        { answer_text: 'Christopher Marlowe', is_correct: false },
        { answer_text: 'Ben Jonson', is_correct: false },
        { answer_text: 'John Milton', is_correct: false },
      ],
    },
    {
      question_text: 'What is the capital of France?',
      answers: [
        { answer_text: 'Paris', is_correct: true },
        { answer_text: 'Lyon', is_correct: false },
        { answer_text: 'Marseille', is_correct: false },
        { answer_text: 'Nice', is_correct: false },
      ],
    },
    {
      question_text: 'Which planet is known as the Red Planet?',
      answers: [
        { answer_text: 'Mars', is_correct: true },
        { answer_text: 'Venus', is_correct: false },
        { answer_text: 'Jupiter', is_correct: false },
        { answer_text: 'Saturn', is_correct: false },
      ],
    },
    {
      question_text: 'What is the chemical symbol for water?',
      answers: [
        { answer_text: 'H2O', is_correct: true },
        { answer_text: 'O2', is_correct: false },
        { answer_text: 'CO2', is_correct: false },
        { answer_text: 'NaCl', is_correct: false },
      ],
    },
  ]

  for (let i = 0; i < qAndA.length; i++) {
    const q = qAndA[i]
    const { data: insertedQ, error: qErr } = await admin
      .from('questions')
      .insert({
        challenge_id: challengeId,
        question_text: q.question_text,
        question_type: 'multiple_choice',
        order_index: i + 1,
        points_value: 10,
      })
      .select('id')
      .single()
    if (qErr) throw qErr

    const questionId = insertedQ.id
    const answersPayload = q.answers.map((a, idx) => ({
      question_id: questionId,
      answer_text: a.answer_text,
      is_correct: a.is_correct,
      order_index: idx + 1,
    }))
    const { error: aErr } = await admin.from('answers').insert(answersPayload)
    if (aErr) throw aErr
  }
}

async function main() {
  const today = new Date().toISOString().split('T')[0]
  const { data: challenge } = await admin
    .from('challenges')
    .select('id, title')
    .eq('active_date', today)
    .eq('is_active', true)
    .maybeSingle()

  if (!challenge) {
    console.log('No active challenge for today')
    return
  }

  const { data: existing } = await admin
    .from('questions')
    .select('id')
    .eq('challenge_id', challenge.id)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Questions already exist for challenge', challenge.id)
    return
  }

  await seedForChallenge(challenge.id)
  console.log('Seeded questions for challenge', challenge.id, challenge.title)
}

main().catch((e) => { console.error(e); process.exit(1) })
