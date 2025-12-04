import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE) as string

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

type ChallengeSeed = {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit: number
  active_date: string
  is_premium: boolean
  is_active: boolean
  questions: Array<{
    question_text: string
    answers: Array<{ answer_text: string; is_correct: boolean }>
  }>
}

const samples: ChallengeSeed[] = [
  {
    title: 'Sample: World Capitals Sprint',
    description: 'Identify correct capitals under time pressure. Success: 4/5 correct. Outcome: Builds geography recall.',
    difficulty: 'easy',
    time_limit: 300,
    active_date: '2099-01-01',
    is_premium: false,
    is_active: true,
    questions: [
      { question_text: 'Capital of Canada?', answers: [
        { answer_text: 'Ottawa', is_correct: true },
        { answer_text: 'Toronto', is_correct: false },
        { answer_text: 'Montreal', is_correct: false },
        { answer_text: 'Vancouver', is_correct: false }
      ]},
      { question_text: 'Capital of Australia?', answers: [
        { answer_text: 'Canberra', is_correct: true },
        { answer_text: 'Sydney', is_correct: false },
        { answer_text: 'Melbourne', is_correct: false },
        { answer_text: 'Perth', is_correct: false }
      ]},
      { question_text: 'Capital of Japan?', answers: [
        { answer_text: 'Tokyo', is_correct: true },
        { answer_text: 'Kyoto', is_correct: false },
        { answer_text: 'Osaka', is_correct: false },
        { answer_text: 'Nagoya', is_correct: false }
      ]},
      { question_text: 'Capital of Brazil?', answers: [
        { answer_text: 'Brasília', is_correct: true },
        { answer_text: 'Rio de Janeiro', is_correct: false },
        { answer_text: 'São Paulo', is_correct: false },
        { answer_text: 'Salvador', is_correct: false }
      ]},
      { question_text: 'Capital of Egypt?', answers: [
        { answer_text: 'Cairo', is_correct: true },
        { answer_text: 'Alexandria', is_correct: false },
        { answer_text: 'Giza', is_correct: false },
        { answer_text: 'Luxor', is_correct: false }
      ]}
    ]
  },
  {
    title: 'Sample: Tech History Flash',
    description: 'Match milestones in computing. Success: score ≥40. Outcome: Learn timeline of innovations.',
    difficulty: 'medium',
    time_limit: 300,
    active_date: '2099-01-02',
    is_premium: false,
    is_active: true,
    questions: [
      { question_text: 'Year WWW became public?', answers: [
        { answer_text: '1991', is_correct: true },
        { answer_text: '1989', is_correct: false },
        { answer_text: '1995', is_correct: false },
        { answer_text: '2000', is_correct: false }
      ]},
      { question_text: 'Creator of Linux?', answers: [
        { answer_text: 'Linus Torvalds', is_correct: true },
        { answer_text: 'Richard Stallman', is_correct: false },
        { answer_text: 'Ken Thompson', is_correct: false },
        { answer_text: 'Steve Wozniak', is_correct: false }
      ]},
      { question_text: 'First iPhone release year?', answers: [
        { answer_text: '2007', is_correct: true },
        { answer_text: '2005', is_correct: false },
        { answer_text: '2008', is_correct: false },
        { answer_text: '2006', is_correct: false }
      ]},
      { question_text: 'Founder of Microsoft?', answers: [
        { answer_text: 'Bill Gates', is_correct: true },
        { answer_text: 'Paul Allen', is_correct: false },
        { answer_text: 'Steve Jobs', is_correct: false },
        { answer_text: 'Larry Page', is_correct: false }
      ]},
      { question_text: 'Language created by James Gosling?', answers: [
        { answer_text: 'Java', is_correct: true },
        { answer_text: 'C#', is_correct: false },
        { answer_text: 'Python', is_correct: false },
        { answer_text: 'Go', is_correct: false }
      ]}
    ]
  },
  {
    title: 'Sample: Science Basics',
    description: 'Core science facts quiz. Success: 4/5 correct. Outcome: Reinforce fundamentals.',
    difficulty: 'easy',
    time_limit: 300,
    active_date: '2099-01-03',
    is_premium: false,
    is_active: true,
    questions: [
      { question_text: 'Chemical symbol for Gold?', answers: [
        { answer_text: 'Au', is_correct: true },
        { answer_text: 'Ag', is_correct: false },
        { answer_text: 'Fe', is_correct: false },
        { answer_text: 'Cu', is_correct: false }
      ]},
      { question_text: 'Planet known as Red Planet?', answers: [
        { answer_text: 'Mars', is_correct: true },
        { answer_text: 'Venus', is_correct: false },
        { answer_text: 'Jupiter', is_correct: false },
        { answer_text: 'Mercury', is_correct: false }
      ]},
      { question_text: 'Water boils at (sea level)?', answers: [
        { answer_text: '100°C', is_correct: true },
        { answer_text: '80°C', is_correct: false },
        { answer_text: '90°C', is_correct: false },
        { answer_text: '110°C', is_correct: false }
      ]},
      { question_text: 'Basic unit of life?', answers: [
        { answer_text: 'Cell', is_correct: true },
        { answer_text: 'Atom', is_correct: false },
        { answer_text: 'Tissue', is_correct: false },
        { answer_text: 'Organ', is_correct: false }
      ]},
      { question_text: 'Earth’s atmosphere main gas?', answers: [
        { answer_text: 'Nitrogen', is_correct: true },
        { answer_text: 'Oxygen', is_correct: false },
        { answer_text: 'CO₂', is_correct: false },
        { answer_text: 'Argon', is_correct: false }
      ]}
    ]
  },
  {
    title: 'Sample: Sports Trivia Mix',
    description: 'Key sports moments. Success: score ≥40. Outcome: Broaden sports knowledge.',
    difficulty: 'medium',
    time_limit: 300,
    active_date: '2099-01-04',
    is_premium: false,
    is_active: true,
    questions: [
      { question_text: 'Number of players in a soccer team?', answers: [
        { answer_text: '11', is_correct: true },
        { answer_text: '10', is_correct: false },
        { answer_text: '12', is_correct: false },
        { answer_text: '9', is_correct: false }
      ]},
      { question_text: 'Grand Slam tournament on clay?', answers: [
        { answer_text: 'French Open', is_correct: true },
        { answer_text: 'Wimbledon', is_correct: false },
        { answer_text: 'US Open', is_correct: false },
        { answer_text: 'Australian Open', is_correct: false }
      ]},
      { question_text: 'NBA team from Chicago?', answers: [
        { answer_text: 'Bulls', is_correct: true },
        { answer_text: 'Lakers', is_correct: false },
        { answer_text: 'Celtics', is_correct: false },
        { answer_text: 'Knicks', is_correct: false }
      ]},
      { question_text: 'Cricket trophy contested by England and Australia?', answers: [
        { answer_text: 'The Ashes', is_correct: true },
        { answer_text: 'World Cup', is_correct: false },
        { answer_text: 'Champions Trophy', is_correct: false },
        { answer_text: 'The Shield', is_correct: false }
      ]},
      { question_text: 'Olympic Games held every?', answers: [
        { answer_text: '4 years', is_correct: true },
        { answer_text: '2 years', is_correct: false },
        { answer_text: '3 years', is_correct: false },
        { answer_text: '5 years', is_correct: false }
      ]}
    ]
  },
  {
    title: 'Sample: Pop Culture Quiz',
    description: 'Movies, music, and TV. Success: 4/5 correct. Outcome: Fun mix for guests.',
    difficulty: 'hard',
    time_limit: 300,
    active_date: '2099-01-05',
    is_premium: false,
    is_active: true,
    questions: [
      { question_text: 'Director of Inception?', answers: [
        { answer_text: 'Christopher Nolan', is_correct: true },
        { answer_text: 'Steven Spielberg', is_correct: false },
        { answer_text: 'James Cameron', is_correct: false },
        { answer_text: 'Ridley Scott', is_correct: false }
      ]},
      { question_text: 'Artist behind Thriller?', answers: [
        { answer_text: 'Michael Jackson', is_correct: true },
        { answer_text: 'Prince', is_correct: false },
        { answer_text: 'Madonna', is_correct: false },
        { answer_text: 'Elton John', is_correct: false }
      ]},
      { question_text: 'TV show with character Walter White?', answers: [
        { answer_text: 'Breaking Bad', is_correct: true },
        { answer_text: 'The Sopranos', is_correct: false },
        { answer_text: 'Ozark', is_correct: false },
        { answer_text: 'Narcos', is_correct: false }
      ]},
      { question_text: 'Singer of Hello (2015)?', answers: [
        { answer_text: 'Adele', is_correct: true },
        { answer_text: 'Beyoncé', is_correct: false },
        { answer_text: 'Taylor Swift', is_correct: false },
        { answer_text: 'Rihanna', is_correct: false }
      ]},
      { question_text: 'Film series featuring the One Ring?', answers: [
        { answer_text: 'The Lord of the Rings', is_correct: true },
        { answer_text: 'Harry Potter', is_correct: false },
        { answer_text: 'The Hobbit', is_correct: false },
        { answer_text: 'Star Wars', is_correct: false }
      ]}
    ]
  }
]

async function insertChallengeWithQA(sample: ChallengeSeed) {
  try {
    const { data: challenge, error: chErr } = await admin
      .from('challenges')
      .insert([{ 
        title: sample.title, 
        description: sample.description,
        difficulty: sample.difficulty,
        time_limit: sample.time_limit,
        active_date: sample.active_date,
        is_premium: sample.is_premium,
        is_active: sample.is_active
      }])
      .select('*')
      .single()

    if (chErr) throw chErr

    const challengeId = challenge.id
    for (let i = 0; i < sample.questions.length; i++) {
      const q = sample.questions[i]
      const { data: qRow, error: qErr } = await admin
        .from('questions')
        .insert([{ 
          challenge_id: challengeId,
          question_text: q.question_text,
          question_type: 'multiple_choice',
          order_index: i + 1,
          points_value: 10
        }])
        .select('*')
        .single()
      if (qErr) throw qErr

      const answersPayload = q.answers.map((a, idx) => ({
        question_id: qRow.id,
        answer_text: a.answer_text,
        is_correct: a.is_correct,
        order_index: idx + 1
      }))
      const { error: aErr } = await admin.from('answers').insert(answersPayload)
      if (aErr) throw aErr
    }
    console.log(`Inserted challenge ${challenge.title} (${challenge.id}) with ${sample.questions.length} questions`)
    return challengeId
  } catch (e: any) {
    console.error('Error inserting sample challenge:', { code: e.code, message: e.message })
    throw e
  }
}

async function main() {
  try {
    const inserted: string[] = []
    for (const sample of samples) {
      const id = await insertChallengeWithQA(sample)
      inserted.push(id)
    }
    const { count } = await admin
      .from('challenges')
      .select('id', { count: 'exact' })
      .ilike('title', 'Sample%')
    console.log(`Verification: ${count} sample challenges present.`)
  } catch (e) {
    console.error('Seeding failed:', e)
    process.exit(1)
  }
}

main()

