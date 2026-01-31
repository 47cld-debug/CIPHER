import apiClient from './client';
import type {
  Policy,
  FAQ,
  Reminder,
  DocumentInfo,
  UploadResponse,
  ComplianceChatResponse,
} from '../types/compliance';

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

  // RAG Compliance Chatbot
  uploadDocuments: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const response = await apiClient.post('/compliance/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  getDocuments: async (): Promise<{ documents: DocumentInfo[] }> => {
    const response = await apiClient.get('/compliance/documents');
    return response.data;
  },

  clearDocuments: async (): Promise<{ cleared: boolean }> => {
    const response = await apiClient.delete('/compliance/documents');
    return response.data;
  },

  complianceChat: async (message: string): Promise<ComplianceChatResponse> => {
    const response = await apiClient.post('/compliance/chat', { message });
    return response.data;
  },
};
