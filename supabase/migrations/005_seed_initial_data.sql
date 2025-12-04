-- Insert sample achievements
INSERT INTO achievements (name, description, badge_url, points_required, achievement_type, rarity) VALUES
('First Steps', 'Complete your first challenge', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bronze+trophy+icon+minimalist+design&image_size=square', 0, 'milestone', 'common'),
('Streak Starter', 'Maintain a 3-day streak', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=silver+fire+icon+minimalist+design&image_size=square', 0, 'streak', 'common'),
('Week Warrior', 'Maintain a 7-day streak', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=gold+flame+icon+minimalist+design&image_size=square', 0, 'streak', 'rare'),
('Point Collector', 'Earn 1000 points', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=gold+coin+stack+icon+minimalist+design&image_size=square', 1000, 'points', 'common'),
('Trivia Master', 'Score 90% or higher on 10 challenges', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=gold+crown+icon+minimalist+design&image_size=square', 0, 'performance', 'epic'),
('Speed Demon', 'Complete a challenge in under 2 minutes', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=lightning+bolt+icon+minimalist+design&image_size=square', 0, 'speed', 'rare'),
('Perfect Score', 'Get 100% on any challenge', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=perfect+star+icon+minimalist+design&image_size=square', 0, 'performance', 'legendary'),
('Consistent Player', 'Play for 30 days straight', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calendar+icon+minimalist+design&image_size=square', 0, 'streak', 'epic');

-- Insert sample challenges
INSERT INTO challenges (title, description, difficulty, active_date, time_limit, is_premium, is_active) VALUES
('Daily Trivia Mix', 'A mix of general knowledge questions to test your trivia skills', 'easy', CURRENT_DATE, 300, false, true),
('Word Wizard Challenge', 'Test your vocabulary with word puzzles and definitions', 'medium', CURRENT_DATE, 360, false, true),
('History Buff Special', 'Questions about historical events and figures', 'hard', CURRENT_DATE + INTERVAL '1 day', 420, true, true),
('Science Spectacular', 'Explore the world of science with challenging questions', 'medium', CURRENT_DATE + INTERVAL '2 days', 360, false, true),
('Pop Culture Paradise', 'Movies, music, and entertainment trivia', 'easy', CURRENT_DATE + INTERVAL '3 days', 300, false, true);

-- Insert sample questions and answers for the daily challenge
INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value) VALUES
((SELECT id FROM challenges WHERE title = 'Daily Trivia Mix' LIMIT 1), 'What is the capital of France?', 'multiple_choice', 1, 10),
((SELECT id FROM challenges WHERE title = 'Daily Trivia Mix' LIMIT 1), 'Which planet is known as the Red Planet?', 'multiple_choice', 2, 10),
((SELECT id FROM challenges WHERE title = 'Daily Trivia Mix' LIMIT 1), 'What is the largest mammal in the world?', 'multiple_choice', 3, 10),
((SELECT id FROM challenges WHERE title = 'Daily Trivia Mix' LIMIT 1), 'In which year did World War II end?', 'multiple_choice', 4, 15),
((SELECT id FROM challenges WHERE title = 'Daily Trivia Mix' LIMIT 1), 'What is the chemical symbol for gold?', 'multiple_choice', 5, 10);

-- Insert answers for the questions
-- Question 1: Capital of France
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
((SELECT id FROM questions WHERE question_text = 'What is the capital of France?' LIMIT 1), 'London', false, 1),
((SELECT id FROM questions WHERE question_text = 'What is the capital of France?' LIMIT 1), 'Berlin', false, 2),
((SELECT id FROM questions WHERE question_text = 'What is the capital of France?' LIMIT 1), 'Paris', true, 3),
((SELECT id FROM questions WHERE question_text = 'What is the capital of France?' LIMIT 1), 'Madrid', false, 4);

-- Question 2: Red Planet
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
((SELECT id FROM questions WHERE question_text = 'Which planet is known as the Red Planet?' LIMIT 1), 'Venus', false, 1),
((SELECT id FROM questions WHERE question_text = 'Which planet is known as the Red Planet?' LIMIT 1), 'Mars', true, 2),
((SELECT id FROM questions WHERE question_text = 'Which planet is known as the Red Planet?' LIMIT 1), 'Jupiter', false, 3),
((SELECT id FROM questions WHERE question_text = 'Which planet is known as the Red Planet?' LIMIT 1), 'Saturn', false, 4);

-- Question 3: Largest mammal
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
((SELECT id FROM questions WHERE question_text = 'What is the largest mammal in the world?' LIMIT 1), 'African Elephant', false, 1),
((SELECT id FROM questions WHERE question_text = 'What is the largest mammal in the world?' LIMIT 1), 'Blue Whale', true, 2),
((SELECT id FROM questions WHERE question_text = 'What is the largest mammal in the world?' LIMIT 1), 'Giraffe', false, 3),
((SELECT id FROM questions WHERE question_text = 'What is the largest mammal in the world?' LIMIT 1), 'Polar Bear', false, 4);

-- Question 4: WWII end year
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
((SELECT id FROM questions WHERE question_text = 'In which year did World War II end?' LIMIT 1), '1944', false, 1),
((SELECT id FROM questions WHERE question_text = 'In which year did World War II end?' LIMIT 1), '1945', true, 2),
((SELECT id FROM questions WHERE question_text = 'In which year did World War II end?' LIMIT 1), '1946', false, 3),
((SELECT id FROM questions WHERE question_text = 'In which year did World War II end?' LIMIT 1), '1947', false, 4);

-- Question 5: Chemical symbol for gold
INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES
((SELECT id FROM questions WHERE question_text = 'What is the chemical symbol for gold?' LIMIT 1), 'Go', false, 1),
((SELECT id FROM questions WHERE question_text = 'What is the chemical symbol for gold?' LIMIT 1), 'Gd', false, 2),
((SELECT id FROM questions WHERE question_text = 'What is the chemical symbol for gold?' LIMIT 1), 'Au', true, 3),
((SELECT id FROM questions WHERE question_text = 'What is the chemical symbol for gold?' LIMIT 1), 'Ag', false, 4);