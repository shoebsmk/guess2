-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    completion_time INTEGER,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    is_correct BOOLEAN,
    time_spent INTEGER
);

-- Create indexes for user_challenges
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON user_challenges(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_challenges_score ON user_challenges(score DESC);

-- Create indexes for user_answers
CREATE INDEX IF NOT EXISTS idx_user_answers_challenge ON user_answers(user_challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);

-- Grant permissions
GRANT SELECT ON user_challenges TO anon;
GRANT ALL PRIVILEGES ON user_challenges TO authenticated;
GRANT SELECT ON user_answers TO anon;
GRANT ALL PRIVILEGES ON user_answers TO authenticated;

-- Enable RLS
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own challenges" ON user_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own challenges" ON user_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON user_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own answers" ON user_answers FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM user_challenges WHERE user_challenges.id = user_answers.user_challenge_id AND user_challenges.user_id = auth.uid()
));
CREATE POLICY "Users can create own answers" ON user_answers FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM user_challenges WHERE user_challenges.id = user_answers.user_challenge_id AND user_challenges.user_id = auth.uid()
));