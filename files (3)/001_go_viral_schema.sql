-- Migration: 001_go_viral_schema.sql
-- Run: supabase migration new go_viral_schema, then paste this

-- ── Uploads table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image')),
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  duration_seconds FLOAT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security — users can only see their own uploads
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own uploads" ON uploads
  FOR ALL USING (auth.uid() = user_id);

-- ── Analyses table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'tiktok',
  niche TEXT,
  caption TEXT,
  virality_score INTEGER CHECK (virality_score >= 0 AND virality_score <= 100),
  one_line_verdict TEXT,
  visual_analysis JSONB,
  trend_analysis JSONB,
  caption_analysis JSONB,
  improvement_plan JSONB,
  processing_time_seconds FLOAT,
  errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own analyses" ON analyses
  FOR ALL USING (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_upload_id ON analyses(upload_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_score ON analyses(virality_score DESC);
