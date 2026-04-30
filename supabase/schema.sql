-- WorkQuest Database Schema
-- Safe to re-run: all statements use IF NOT EXISTS / DROP IF EXISTS
-- Run this in your Supabase project → SQL Editor → New Query → Run

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS companies (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  description TEXT,
  state       TEXT        DEFAULT 'early_stage',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  email        TEXT,
  avatar_color TEXT        DEFAULT '#7c3aed',
  is_active    BOOLEAN     DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpis (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  target_value  NUMERIC     DEFAULT 100,
  current_value NUMERIC     DEFAULT 0,
  unit          TEXT        DEFAULT '%',
  priority      INTEGER     DEFAULT 1,
  frequency     TEXT        DEFAULT 'weekly',
  start_date    DATE        DEFAULT CURRENT_DATE,
  end_date      DATE,
  is_active     BOOLEAN     DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_logs (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id         UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  kpi_id            UUID        REFERENCES kpis(id) ON DELETE SET NULL,
  company_id        UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_date         DATE        NOT NULL DEFAULT CURRENT_DATE,
  title             TEXT        NOT NULL,
  description       TEXT,
  contribution_type TEXT        DEFAULT 'direct' CHECK (contribution_type IN ('direct', 'indirect')),
  time_spent_hours  NUMERIC     DEFAULT 1,
  impact_score      NUMERIC     DEFAULT 7,
  effort_score      NUMERIC     DEFAULT 7,
  time_value_score  NUMERIC     DEFAULT 7,
  total_score       NUMERIC     DEFAULT 0,
  llm_feedback      TEXT,
  improvement_tip   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_winners (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  week_start  DATE        NOT NULL,
  week_end    DATE        NOT NULL,
  total_score NUMERIC     NOT NULL,
  announced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_players_company        ON players(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company           ON kpis(company_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_player       ON task_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_company      ON task_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_date         ON task_logs(task_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_kpi          ON task_logs(kpi_id);
CREATE INDEX IF NOT EXISTS idx_weekly_winners_company ON weekly_winners(company_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- The API uses the service_role key which bypasses RLS entirely.
-- These policies exist so anon/client reads are also safe.

ALTER TABLE companies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_winners ENABLE ROW LEVEL SECURITY;

-- Drop first so this script is safe to re-run multiple times
DROP POLICY IF EXISTS "workquest_companies_all"      ON companies;
DROP POLICY IF EXISTS "workquest_players_all"        ON players;
DROP POLICY IF EXISTS "workquest_kpis_all"           ON kpis;
DROP POLICY IF EXISTS "workquest_task_logs_all"      ON task_logs;
DROP POLICY IF EXISTS "workquest_weekly_winners_all" ON weekly_winners;

-- Also drop old policy names from previous schema versions
DROP POLICY IF EXISTS "Service role full access on companies"      ON companies;
DROP POLICY IF EXISTS "Service role full access on players"        ON players;
DROP POLICY IF EXISTS "Service role full access on kpis"           ON kpis;
DROP POLICY IF EXISTS "Service role full access on task_logs"      ON task_logs;
DROP POLICY IF EXISTS "Service role full access on weekly_winners" ON weekly_winners;

-- Re-create with USING + WITH CHECK so SELECT, INSERT, UPDATE, DELETE all work
CREATE POLICY "workquest_companies_all"      ON companies      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workquest_players_all"        ON players        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workquest_kpis_all"           ON kpis           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workquest_task_logs_all"      ON task_logs      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workquest_weekly_winners_all" ON weekly_winners FOR ALL USING (true) WITH CHECK (true);
