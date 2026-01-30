export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
}
