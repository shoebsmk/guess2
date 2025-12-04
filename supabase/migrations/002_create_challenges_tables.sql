-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    active_date DATE NOT NULL,
    time_limit INTEGER DEFAULT 300,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('multiple_choice', 'word_puzzle')),
    order_index INTEGER NOT NULL,
    points_value INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL
);

-- Create indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_active_date ON challenges(active_date);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);

-- Create indexes for questions
CREATE INDEX IF NOT EXISTS idx_questions_challenge_id ON questions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(challenge_id, order_index);

-- Create indexes for answers
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_correct ON answers(question_id, is_correct);

-- Grant permissions
GRANT SELECT ON challenges TO anon;
GRANT ALL PRIVILEGES ON challenges TO authenticated;
GRANT SELECT ON questions TO anon;
GRANT ALL PRIVILEGES ON questions TO authenticated;
GRANT SELECT ON answers TO anon;
GRANT ALL PRIVILEGES ON answers TO authenticated;

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active challenges" ON challenges FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON challenges FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage questions" ON questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can view answers" ON answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage answers" ON answers FOR ALL TO authenticated USING (true);