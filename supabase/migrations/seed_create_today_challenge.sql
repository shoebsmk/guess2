WITH nc AS (
  INSERT INTO challenges (title, description, difficulty, active_date, time_limit, is_premium, is_active)
  VALUES (
    'Daily Trivia — General Knowledge',
    '5 curated questions testing general knowledge.',
    'medium',
    CURRENT_DATE,
    300,
    FALSE,
    TRUE
  )
  RETURNING id
),
q1 AS (
  INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value)
  SELECT id, 'What is the capital of France?', 'multiple_choice', 1, 10 FROM nc
  RETURNING id
),
a1 AS (
  INSERT INTO answers (question_id, answer_text, is_correct, order_index)
  SELECT q1.id, 'Paris', TRUE, 1 FROM q1
  UNION ALL SELECT q1.id, 'Lyon', FALSE, 2 FROM q1
  UNION ALL SELECT q1.id, 'Marseille', FALSE, 3 FROM q1
  UNION ALL SELECT q1.id, 'Nice', FALSE, 4 FROM q1
),
q2 AS (
  INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value)
  SELECT id, 'Which planet is known as the Red Planet?', 'multiple_choice', 2, 10 FROM nc
  RETURNING id
),
a2 AS (
  INSERT INTO answers (question_id, answer_text, is_correct, order_index)
  SELECT q2.id, 'Mars', TRUE, 1 FROM q2
  UNION ALL SELECT q2.id, 'Venus', FALSE, 2 FROM q2
  UNION ALL SELECT q2.id, 'Jupiter', FALSE, 3 FROM q2
  UNION ALL SELECT q2.id, 'Saturn', FALSE, 4 FROM q2
),
q3 AS (
  INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value)
  SELECT id, 'Who wrote "Hamlet"?', 'multiple_choice', 3, 10 FROM nc
  RETURNING id
),
a3 AS (
  INSERT INTO answers (question_id, answer_text, is_correct, order_index)
  SELECT q3.id, 'William Shakespeare', TRUE, 1 FROM q3
  UNION ALL SELECT q3.id, 'Charles Dickens', FALSE, 2 FROM q3
  UNION ALL SELECT q3.id, 'Jane Austen', FALSE, 3 FROM q3
  UNION ALL SELECT q3.id, 'Mark Twain', FALSE, 4 FROM q3
),
q4 AS (
  INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value)
  SELECT id, 'What is the chemical symbol for water?', 'multiple_choice', 4, 10 FROM nc
  RETURNING id
),
a4 AS (
  INSERT INTO answers (question_id, answer_text, is_correct, order_index)
  SELECT q4.id, 'H2O', TRUE, 1 FROM q4
  UNION ALL SELECT q4.id, 'O2', FALSE, 2 FROM q4
  UNION ALL SELECT q4.id, 'CO2', FALSE, 3 FROM q4
  UNION ALL SELECT q4.id, 'NaCl', FALSE, 4 FROM q4
),
q5 AS (
  INSERT INTO questions (challenge_id, question_text, question_type, order_index, points_value)
  SELECT id, 'In which year did the World Wide Web become publicly available?', 'multiple_choice', 5, 10 FROM nc
  RETURNING id
)
INSERT INTO answers (question_id, answer_text, is_correct, order_index)
SELECT q5.id, '1991', TRUE, 1 FROM q5
UNION ALL SELECT q5.id, '1989', FALSE, 2 FROM q5
UNION ALL SELECT q5.id, '1995', FALSE, 3 FROM q5
UNION ALL SELECT q5.id, '2000', FALSE, 4 FROM q5;
