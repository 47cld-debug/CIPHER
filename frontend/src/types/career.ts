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
  performance_rating?: string;
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

// Career growth (Goals/Skills/Achievements tabs + progress % + AI mentor)
export interface InProgressCourseItem {
  enrollment_id: number;
  course_id: number;
  course_title: string;
  progress_state: string;
}

export interface SkillItem {
  id: number;
  name: string;
  category: string;
}

export interface SkillsTabData {
  existing: SkillItem[];
  from_courses: SkillItem[];
  from_certs: SkillItem[];
}

export interface AchievementCard {
  certification_name: string;
  issuing_organization: string;
  date_completed: string | null;
}

export interface CareerGrowthSummary {
  goals_tab: InProgressCourseItem[];
  skills_tab: SkillsTabData;
  achievements_tab: AchievementCard[];
  progress_pct: number;
  next_target_role: string | null;
}

export interface MentorSuggestions {
  suggestions: string;
  skill_gaps: string;
}
