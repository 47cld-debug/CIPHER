import apiClient from './client';
import type { ChatRequest, ChatResponse } from '../types/ai';

export const aiApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post('/ai/chat', data);
    return response.data;
  },
};
