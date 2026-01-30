export interface User {
  id: number;
  employee_number: string;
  email: string;
  full_name: string;
  role: 'EMPLOYEE' | 'ADMIN';
  created_at: string;
  last_login?: string;
}

export interface RequestOTPRequest {
  employee_number: string;
}

export interface RequestOTPResponse {
  message: string;
  email: string;
}

export interface VerifyOTPRequest {
  employee_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  has_admin_access: boolean;
  email: string;
  full_name: string;
}

export interface SelectRoleRequest {
  employee_number: string;
  role: 'ADMIN' | 'USER';
}

export interface SelectRoleResponse {
  access_token: string;
  token_type: string;
  user: User;
}
