import apiClient from './client';
import type { ChatRequest, ChatResponse, LearningRecommendationRequest, LearningRecommendationResponse } from '../types/ai';

export const aiApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post('/ai/chat', data);
    return response.data;
  },

  getLearningRecommendations: async (query: string): Promise<LearningRecommendationResponse[]> => {
    const response = await apiClient.post('/ai/learning-recommendations', { query });
    return response.data;
  },
};
