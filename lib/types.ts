export interface Company {
  id: string
  name: string
  description: string | null
  state: string
  created_at: string
}

export interface Player {
  id: string
  company_id: string
  name: string
  email: string | null
  avatar_color: string
  is_active: boolean
  created_at: string
}

export interface KPI {
  id: string
  company_id: string
  title: string
  description: string | null
  target_value: number
  current_value: number
  unit: string
  priority: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface TaskLog {
  id: string
  player_id: string
  kpi_id: string | null
  company_id: string
  task_date: string
  title: string
  description: string | null
  contribution_type: 'direct' | 'indirect'
  time_spent_hours: number
  impact_score: number
  effort_score: number
  time_value_score: number
  total_score: number
  llm_feedback: string | null
  improvement_tip: string | null
  created_at: string
  player?: Player
  kpi?: KPI
}

export interface WeeklyWinner {
  id: string
  player_id: string
  company_id: string
  week_start: string
  week_end: string
  total_score: number
  announced_at: string
  player?: Player
}

export interface LeaderboardEntry {
  player: Player
  total_score: number
  weekly_score: number
  task_count: number
  streak: number
  rank: number
  daily_scores: { date: string; score: number }[]
}

export interface ScoreResult {
  impact_score: number
  effort_score: number
  time_value_score: number
  total_score: number
  feedback: string
  improvement_tip: string
}

export const COMPANY_STATES = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP / Pre-launch' },
  { value: 'early_stage', label: 'Early Stage' },
  { value: 'seed', label: 'Seed Funded' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B+' },
  { value: 'pre_revenue', label: 'Pre-Revenue' },
  { value: 'paid_customers', label: 'Paid Customers' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'bootstrapped', label: 'Bootstrapped / Profitable' },
]

export const KPI_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
]
