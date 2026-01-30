import apiClient from './client';
import type { Initiative, InitiativeDetail, Session, BookSessionResponse } from '../types/wellness';

export const wellnessApi = {
  getInitiatives: async (): Promise<Initiative[]> => {
    const response = await apiClient.get('/wellness/initiatives');
    return response.data;
  },

  getInitiativeDetail: async (id: number): Promise<InitiativeDetail> => {
    const response = await apiClient.get(`/wellness/initiatives/${id}`);
    return response.data;
  },

  bookSession: async (initiativeId: number): Promise<BookSessionResponse> => {
    const response = await apiClient.post(`/wellness/initiatives/${initiativeId}/book`);
    return response.data;
  },

  cancelBooking: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/wellness/sessions/${sessionId}`);
  },

  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get('/wellness/sessions');
    return response.data;
  },
};
