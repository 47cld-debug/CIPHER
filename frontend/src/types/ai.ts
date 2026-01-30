export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
}

export interface LearningRecommendationRequest {
  query: string;
}

export interface LearningRecommendationResponse {
  id: number;
  title: string;
  description: string;
  course_type: 'INTERNAL' | 'EXTERNAL';
  external_url?: string;
}
