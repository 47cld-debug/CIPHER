import apiClient from './client';
import type { Initiative, Session } from '../types/wellness';

export const wellnessApi = {
  getInitiatives: async (): Promise<Initiative[]> => {
    const response = await apiClient.get('/wellness/initiatives');
    return response.data;
  },

  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get('/wellness/sessions');
    return response.data;
  },
};
