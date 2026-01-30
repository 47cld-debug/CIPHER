export interface Goal {
  id: number;
  title: string;
  description?: string;
  target_date?: string;
  status: string;
  progress?: number; // 0-100
  created_at: string;
}

export interface Appraisal {
  id: number;
  period: string;
  self_review?: string;
  manager_feedback?: string;
  status: string;
}

export interface CareerSummary {
  path_label: string;
  current_level?: string;
  next_level?: string;
  progress_pct?: number;
  level_badge?: string;
  years_experience?: number;
  company_years?: number;
  achievements_count: number;
  achievements_this_year: number;
}

export interface CareerSkill {
  id: number;
  name: string;
  category: string;
}

export interface AchievementItem {
  title: string;
  date?: string;
  type: 'goal' | 'course';
}
