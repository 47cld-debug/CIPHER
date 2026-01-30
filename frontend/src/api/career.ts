import apiClient from './client';
import type { Goal, Appraisal } from '../types/career';

export const careerApi = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await apiClient.get('/career/goals');
    return response.data;
  },

  getAppraisals: async (): Promise<Appraisal[]> => {
    const response = await apiClient.get('/career/appraisals');
    return response.data;
  },
};
