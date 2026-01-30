import apiClient from './client';
import type { Policy, FAQ, Reminder } from '../types/compliance';

export const complianceApi = {
  getPolicies: async (search?: string): Promise<Policy[]> => {
    const response = await apiClient.get('/compliance/policies', { params: { search } });
    return response.data;
  },

  getFAQs: async (category?: string): Promise<FAQ[]> => {
    const response = await apiClient.get('/compliance/faqs', { params: { category } });
    return response.data;
  },

  getReminders: async (): Promise<Reminder[]> => {
    const response = await apiClient.get('/compliance/reminders');
    return response.data;
  },
};
