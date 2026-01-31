import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '../api/learning';
import { dashboardApi } from '../api/dashboard';
import { careerApi } from '../api/career';
import { complianceApi } from '../api/compliance';
import { wellnessApi } from '../api/wellness';
import { aiApi } from '../api/ai';
import { adminApi } from '../api/admin';
import type { ProgressState } from '../types/learning';

// Learning hooks
export const useCourses = (params?: {
  skip?: number;
  limit?: number;
  course_type?: string;
  category?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => learningApi.getCourses(params),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
  });
};

export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => learningApi.getEnrollments(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, progressState }: { enrollmentId: number; progressState: ProgressState }) =>
      learningApi.updateProgress(enrollmentId, progressState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

export const useUploadCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, file }: { enrollmentId: number; file: File }) =>
      learningApi.uploadCertificate(enrollmentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => learningApi.deleteEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

// Dashboard hooks
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

// Career hooks
export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => careerApi.getGoals(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useAppraisals = () => {
  return useQuery({
    queryKey: ['appraisals'],
    queryFn: () => careerApi.getAppraisals(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCareerSummary = () => {
  return useQuery({
    queryKey: ['career', 'summary'],
    queryFn: () => careerApi.getCareerSummary(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCareerSkills = () => {
  return useQuery({
    queryKey: ['career', 'skills'],
    queryFn: () => careerApi.getCareerSkills(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCareerAchievements = () => {
  return useQuery({
    queryKey: ['career', 'achievements'],
    queryFn: () => careerApi.getCareerAchievements(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCareerGrowthSummary = () => {
  return useQuery({
    queryKey: ['career', 'growth'],
    queryFn: () => careerApi.getCareerGrowthSummary(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCareerMentorSuggestions = () => {
  return useQuery({
    queryKey: ['career', 'mentor-suggestions'],
    queryFn: () => careerApi.getCareerMentorSuggestions(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000, // 1 min for AI response
  });
};

// Compliance hooks
export const usePolicies = (search?: string) => {
  return useQuery({
    queryKey: ['policies', search],
    queryFn: () => complianceApi.getPolicies(search),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useFAQs = (category?: string) => {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: () => complianceApi.getFAQs(category),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useReminders = () => {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: () => complianceApi.getReminders(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

// Wellness hooks
export const useInitiatives = () => {
  return useQuery({
    queryKey: ['wellness', 'initiatives'],
    queryFn: () => wellnessApi.getInitiatives(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useInitiativeDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['wellness', 'initiative', id],
    queryFn: () => wellnessApi.getInitiativeDetail(id!),
    enabled: id != null,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useBookSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (initiativeId: number) => wellnessApi.bookSession(initiativeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => wellnessApi.cancelBooking(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness'] });
    },
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['wellness', 'sessions'],
    queryFn: () => wellnessApi.getSessions(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

// AI hooks
export const useAIChat = () => {
  return useMutation({
    mutationFn: (data: { message: string; context?: string }) => aiApi.chat(data),
  });
};

export const useComplianceChat = () => {
  return useMutation({
    mutationFn: (message: string) => complianceApi.complianceChat(message),
  });
};

// Admin Compliance Document Management hooks
export const useComplianceDocuments = () => {
  return useQuery({
    queryKey: ['complianceDocuments'],
    queryFn: () => complianceApi.getComplianceDocuments(),
    retry: 1,
    staleTime: 30000,
  });
};

export const useUploadComplianceDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => complianceApi.uploadComplianceDocuments(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceDocuments'] });
    },
  });
};

export const useDeleteComplianceDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => complianceApi.deleteComplianceDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceDocuments'] });
    },
  });
};

// Learning recommendations hook
export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => learningApi.getRecommendations(),
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000, // 5 minutes - recommendations don't change often
  });
};

// Admin hooks
export const usePendingCertificates = () => {
  return useQuery({
    queryKey: ['pendingCertificates'],
    queryFn: () => adminApi.getPendingCertificates(),
    retry: 1,
    staleTime: 30000,
  });
};

export const useVerifyCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ certificateId, verificationStatus }: { certificateId: number; verificationStatus: any }) =>
      adminApi.verifyCertificate(certificateId, verificationStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingCertificates'] });
    },
  });
};
