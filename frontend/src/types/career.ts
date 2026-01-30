export interface Goal {
  id: number;
  title: string;
  description?: string;
  target_date?: string;
  status: string;
  created_at: string;
}

export interface Appraisal {
  id: number;
  period: string;
  self_review?: string;
  manager_feedback?: string;
  status: string;
}
