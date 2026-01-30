export type CourseType = 'INTERNAL' | 'EXTERNAL';
export type ProgressState = 'NOT_STARTED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'COMPLETED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED';

export interface Course {
  id: number;
  title: string;
  description?: string;
  category?: string;
  skill_level?: string;
  duration?: number;
  course_type: CourseType;
  provider_name?: string;
  external_url?: string;
  created_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: EnrollmentStatus;
  progress_state: ProgressState;
  enrolled_at: string;
  updated_at?: string;
  course: Course;
}

export interface Certificate {
  id: number;
  enrollment_id: number;
  file_url: string;
  verification_status: VerificationStatus;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: number;
}

export interface Recommendation {
  title: string;
  description: string;
}
