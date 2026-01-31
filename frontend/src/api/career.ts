import apiClient from './client';
import type {
  Goal,
  Appraisal,
  CareerSummary,
  CareerSkill,
  AchievementItem,
  CareerGrowthSummary,
  MentorSuggestions,
} from '../types/career';

export const careerApi = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await apiClient.get('/career/goals');
    return response.data;
  },

  getAppraisals: async (): Promise<Appraisal[]> => {
    const response = await apiClient.get('/career/appraisals');
    return response.data;
  },

  getCareerSummary: async (): Promise<CareerSummary> => {
    const response = await apiClient.get('/career/summary');
    return response.data;
  },

  getCareerSkills: async (): Promise<CareerSkill[]> => {
    const response = await apiClient.get('/career/skills');
    return response.data;
  },

  getCareerAchievements: async (): Promise<AchievementItem[]> => {
    const response = await apiClient.get('/career/achievements');
    return response.data;
  },

  getCareerGrowthSummary: async (): Promise<CareerGrowthSummary> => {
    const response = await apiClient.get('/career/growth');
    return response.data;
  },

  getCareerMentorSuggestions: async (): Promise<MentorSuggestions> => {
    const response = await apiClient.get('/career/mentor-suggestions');
    return response.data;
  },
};
