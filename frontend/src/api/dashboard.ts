import apiClient from './client';
import type { Dashboard } from '../types/dashboard';

export const dashboardApi = {
  getDashboard: async (): Promise<Dashboard> => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};
