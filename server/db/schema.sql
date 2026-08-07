-- PostgreSQL Database Schema for IELTS Preparation Platform

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  target_band DECIMAL(2, 1) DEFAULT 7.5,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  module_type VARCHAR(50) NOT NULL, -- 'listening' | 'reading' | 'writing' | 'speaking'
  difficulty VARCHAR(50) NOT NULL,  -- 'easy' | 'medium' | 'hard'
  topic VARCHAR(100) NOT NULL,       -- 'science' | 'environment' | 'technology' | 'education' | 'culture'
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_questions INTEGER NOT NULL DEFAULT 10,
  audio_url TEXT,                     -- audio asset for Listening
  passage_text TEXT,                  -- text article for Reading
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice' | 'matching' | 'sentence_completion'
  text TEXT NOT NULL,
  options_json TEXT,                  -- JSON string array for multiple choice/matching
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Results Table
CREATE TABLE IF NOT EXISTS user_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  band_score DECIMAL(2, 1) NOT NULL,
  raw_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers_json TEXT NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_tests_module_diff ON tests(module_type, difficulty);
CREATE INDEX IF NOT EXISTS idx_user_results_user ON user_results(user_id);
