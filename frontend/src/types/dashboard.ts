export interface Widget {
  id: number;
  name: string;
  type: string;
  config?: Record<string, any>;
}

export interface LearningProgressData {
  completed: number;
  in_progress: number;
  not_started: number;
  total: number;
  recent_courses: Array<{
    id: number;
    title: string;
    progress: string;
    category?: string;
  }>;
}

export interface UpcomingCoursesData {
  courses: Array<{
    id: number;
    title: string;
    description?: string;
    category?: string;
    course_type: string;
    provider_name?: string;
    duration?: number;
  }>;
}

export interface CareerGoalsData {
  active_goals: number;
  completed_goals: number;
  goals: Array<{
    id: number;
    title: string;
    description?: string;
    status: string;
    target_date?: string;
  }>;
}

export interface ComplianceRemindersData {
  pending: number;
  reminders: Array<{
    id: number;
    type: string;
    message: string;
    due_date?: string;
    completed: boolean;
  }>;
}

export interface WellnessInitiativesData {
  available: number;
  initiatives: Array<{
    id: number;
    title: string;
    description?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }>;
}

export type WidgetData = 
  | LearningProgressData 
  | UpcomingCoursesData 
  | CareerGoalsData 
  | ComplianceRemindersData 
  | WellnessInitiativesData
  | Record<string, any>;

export interface UserWidget {
  id: number;
  widget_id: number;
  position?: number;
  enabled: boolean;
  widget: Widget;
  data?: WidgetData;
}

export interface Dashboard {
  widgets: UserWidget[];
}
