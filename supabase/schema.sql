-- WorkQuest Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  state TEXT DEFAULT 'early_stage',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar_color TEXT DEFAULT '#7c3aed',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  priority INTEGER DEFAULT 1,
  frequency TEXT DEFAULT 'weekly',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Logs
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  contribution_type TEXT DEFAULT 'direct' CHECK (contribution_type IN ('direct', 'indirect')),
  time_spent_hours NUMERIC DEFAULT 1,
  impact_score NUMERIC DEFAULT 7,
  effort_score NUMERIC DEFAULT 7,
  time_value_score NUMERIC DEFAULT 7,
  total_score NUMERIC DEFAULT 0,
  llm_feedback TEXT,
  improvement_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Winners
CREATE TABLE IF NOT EXISTS weekly_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_score NUMERIC NOT NULL,
  announced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_company ON players(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company ON kpis(company_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_player ON task_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_company ON task_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_date ON task_logs(task_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_kpi ON task_logs(kpi_id);
CREATE INDEX IF NOT EXISTS idx_weekly_winners_company ON weekly_winners(company_id);

-- Row Level Security (optional - disable for simplicity)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_winners ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (API uses service key)
CREATE POLICY "Service role full access on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Service role full access on players" ON players FOR ALL USING (true);
CREATE POLICY "Service role full access on kpis" ON kpis FOR ALL USING (true);
CREATE POLICY "Service role full access on task_logs" ON task_logs FOR ALL USING (true);
CREATE POLICY "Service role full access on weekly_winners" ON weekly_winners FOR ALL USING (true);
