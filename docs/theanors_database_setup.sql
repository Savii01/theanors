-- ==============================================================================
-- TheAnors Content Operations Platform — Complete Database Setup Script
-- ==============================================================================

-- ==============================================================================
-- PART 1: SUPABASE (Real-Time Active Database)
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Settings (Global Brand Voice & Configuration)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  global_brand_voice TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_settings_user_id_key UNIQUE(user_id)
);

-- 2. Per-Workflow Master Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  workflow VARCHAR(50) NOT NULL,
  prompt_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT prompts_user_workflow_key UNIQUE(user_id, workflow)
);

-- 3. Daily Transcription Quota & Usage Tracking
CREATE TABLE IF NOT EXISTS transcription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  groq_used_seconds INT DEFAULT 0,
  deepgram_used_seconds INT DEFAULT 0,
  assembly_used_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT transcription_usage_user_date_key UNIQUE(user_id, date)
);

-- 4. Engagement Workflow
CREATE TABLE IF NOT EXISTS engagement_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  total_posts INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES engagement_batches(id) ON DELETE CASCADE,
  post_link TEXT NOT NULL,
  platform VARCHAR(50) DEFAULT 'linkedin_personal',
  post_content TEXT DEFAULT '',
  selected_comment_option INT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'posted', 'skipped'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES engagement_posts(id) ON DELETE CASCADE,
  option_number INT NOT NULL,
  comment_text TEXT NOT NULL,
  style VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Captions Workflow
CREATE TABLE IF NOT EXISTS captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  video_link TEXT,
  transcript TEXT NOT NULL,
  linkedin TEXT,
  tiktok TEXT,
  instagram TEXT,
  youtube_title TEXT,
  youtube_desc TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Content Scripting Workflow
CREATE TABLE IF NOT EXISTS scripting_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  topic TEXT,
  script_type VARCHAR(50) NOT NULL, -- 'talking_head', 'carousel', 'flyer', 'trend_acting'
  raw_transcript TEXT,
  angle TEXT,
  script_content TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Newsletter Workflow
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  theme TEXT NOT NULL,
  posts JSONB DEFAULT '[]',
  validation_score INT,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Initial Comments Workflow
CREATE TABLE IF NOT EXISTS initial_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  post_link TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  option_1 TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  selected_option INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Default Settings for 'default' User
INSERT INTO user_settings (user_id, global_brand_voice)
VALUES ('default', 'Founder & thought leader voice: authentic, authoritative, actionable, concise, engaging.')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Default Prompts for all 5 Workflows
INSERT INTO prompts (user_id, workflow, prompt_text)
VALUES 
  ('default', 'engagement', 'You are an engagement specialist. Write high-value, relationship-building comments tailored to the platform tone. Avoid generic praise.'),
  ('default', 'captions', 'Generate platform-optimized captions with strong hooks, platform-appropriate length, clear CTAs, and strategic hashtags.'),
  ('default', 'scripting', 'Create engaging, structured video scripts with compelling 3-second hooks, clear body points, and strong closing CTAs.'),
  ('default', 'newsletter', 'Write a cohesive, engaging weekly newsletter synthesizing the chosen theme and linked posts into an introduction, structured body, and actionable takeaways.'),
  ('default', 'comments', 'Generate 3 distinctive initial comment options: (1) thoughtful question, (2) contrarian insight, (3) community prompt.')
ON CONFLICT (user_id, workflow) DO NOTHING;

-- Enable Row Level Security (RLS) policies (Optional / Open for Service Role & Anon in development)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on prompts" ON prompts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on transcription_usage" ON transcription_usage FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on engagement_batches" ON engagement_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on engagement_posts" ON engagement_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on engagement_comments" ON engagement_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on captions" ON captions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on scripting_jobs" ON scripting_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on newsletters" ON newsletters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on initial_comments" ON initial_comments FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- PART 2: NEON POSTGRESQL (Analytics & Self-Training Engine)
-- Run this in the Neon SQL Console: https://console.neon.tech
-- ==============================================================================

-- 1. Feedback Log (Stores accept / edit / reject / keep_in_memory actions)
CREATE TABLE IF NOT EXISTS feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  workflow VARCHAR(50) NOT NULL,
  output_id VARCHAR(100),
  action VARCHAR(50) NOT NULL, -- 'accept', 'edit', 'reject', 'keep_in_memory', 'forget'
  original_content TEXT,
  edited_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Learned User Preferences (Patterns injected into Prompt Assembly)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  workflow VARCHAR(50) NOT NULL,
  preference_type VARCHAR(100) NOT NULL, -- e.g., 'comment_style', 'tone', 'length'
  preference_value TEXT NOT NULL,        -- e.g., 'prefers concise bullet points and witty tone'
  frequency_selected INT DEFAULT 1,
  confidence_score NUMERIC(3, 2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Historical LLM Runs & Latency Analytics
CREATE TABLE IF NOT EXISTS historical_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  workflow VARCHAR(50) NOT NULL,
  model_used VARCHAR(100) NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Newsletter Theme History Archive
CREATE TABLE IF NOT EXISTS theme_history_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  theme TEXT NOT NULL,
  used_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create helpful query indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_workflow ON feedback_log(user_id, workflow);
CREATE INDEX IF NOT EXISTS idx_preferences_user_workflow ON user_preferences(user_id, workflow, frequency_selected DESC);
CREATE INDEX IF NOT EXISTS idx_runs_user_created ON historical_runs(user_id, created_at DESC);
