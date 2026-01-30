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
};
