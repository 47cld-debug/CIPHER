import apiClient from './client';
import type { Course, Enrollment, Certificate, Recommendation, ProgressState } from '../types/learning';

export const learningApi = {
  getCourses: async (params?: {
    skip?: number;
    limit?: number;
    course_type?: string;
    category?: string;
    search?: string;
  }): Promise<Course[]> => {
    const response = await apiClient.get('/learning/courses', { params });
    return response.data;
  },

  getCourse: async (courseId: number): Promise<Course> => {
    const response = await apiClient.get(`/learning/courses/${courseId}`);
    return response.data;
  },

  enrollInCourse: async (courseId: number, autoEnrolled: boolean = false): Promise<Enrollment> => {
    const response = await apiClient.post(`/learning/courses/${courseId}/enroll?auto_enrolled=${autoEnrolled}`);
    return response.data;
  },

  getEnrollments: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get('/learning/enrollments');
    return response.data;
  },

  updateProgress: async (
    enrollmentId: number,
    progressState: ProgressState
  ): Promise<Enrollment> => {
    const response = await apiClient.put(`/learning/enrollments/${enrollmentId}/progress`, {
      progress_state: progressState,
    });
    return response.data;
  },

  uploadCertificate: async (
    enrollmentId: number,
    file: File
  ): Promise<Certificate> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(
      `/learning/enrollments/${enrollmentId}/certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get('/learning/recommendations');
    return response.data;
  },

  deleteEnrollment: async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(`/learning/enrollments/${enrollmentId}`);
  },
};
