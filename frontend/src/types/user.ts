export interface UserProfile {
  id: number;
  employee_number: string;
  email: string;
  full_name: string;
  role: 'EMPLOYEE' | 'ADMIN';
  created_at: string;
  last_login?: string;
}
