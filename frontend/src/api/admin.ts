import apiClient from './client';
import type { Certificate, VerificationStatus, Course, CourseType } from '../types/learning';

export const adminApi = {
  getPendingCertificates: async (): Promise<Certificate[]> => {
    const response = await apiClient.get('/admin/certificates/pending');
    return response.data;
  },

  verifyCertificate: async (
    certificateId: number,
    verificationStatus: VerificationStatus
  ): Promise<Certificate> => {
    const response = await apiClient.put(`/admin/certificates/${certificateId}/verify`, {
      verification_status: verificationStatus,
    });
    return response.data;
  },

  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/admin/courses');
    return response.data;
  },

  createCourse: async (courseData: {
    title: string;
    description?: string;
    category?: string;
    skill_level?: string;
    duration?: number;
    course_type: CourseType;
    provider_name?: string;
    external_url?: string;
  }): Promise<Course> => {
    const response = await apiClient.post('/admin/courses', courseData);
    return response.data;
  },

  updateCourse: async (
    courseId: number,
    courseData: {
      title?: string;
      description?: string;
      category?: string;
      skill_level?: string;
      duration?: number;
      course_type?: CourseType;
      provider_name?: string;
      external_url?: string;
    }
  ): Promise<Course> => {
    const response = await apiClient.put(`/admin/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await apiClient.delete(`/admin/courses/${courseId}`);
  },

  // Leave Management
  getPendingLeaves: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/leaves/pending');
    return response.data;
  },

  getAllLeaves: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/leaves');
    return response.data;
  },

  approveLeave: async (
    leaveId: number,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/leaves/${leaveId}/approve`, {
      status,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  // Payroll Management
  getAllPayrolls: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/payrolls');
    return response.data;
  },

  createPayroll: async (payrollData: {
    user_id: number;
    month: number;
    year: number;
    pay_period_start: string;
    pay_period_end: string;
    basic_salary: number;
    house_rent_allowance?: number;
    leave_travel_allowance?: number;
    city_allowance?: number;
    performance_pay?: number;
    night_shift_allowance?: number;
    miscellaneous?: number;
    provident_fund?: number;
    professional_tax?: number;
    es_is_deduction?: number;
    status?: 'DRAFT' | 'PROCESSED' | 'PAID';
  }): Promise<any> => {
    const response = await apiClient.post('/admin/payrolls', payrollData);
    return response.data;
  },

  updatePayroll: async (
    payrollId: number,
    payrollData: {
      month?: number;
      year?: number;
      pay_period_start?: string;
      pay_period_end?: string;
      basic_salary?: number;
      house_rent_allowance?: number;
      leave_travel_allowance?: number;
      city_allowance?: number;
      performance_pay?: number;
      night_shift_allowance?: number;
      miscellaneous?: number;
      provident_fund?: number;
      professional_tax?: number;
      es_is_deduction?: number;
      status?: 'DRAFT' | 'PROCESSED' | 'PAID';
    }
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/payrolls/${payrollId}`, payrollData);
    return response.data;
  },

  deletePayroll: async (payrollId: number): Promise<void> => {
    await apiClient.delete(`/admin/payrolls/${payrollId}`);
  },

  // Users
  getAllUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
};
