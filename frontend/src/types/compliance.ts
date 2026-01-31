export interface Policy {
  id: number;
  title: string;
  content?: string;
  category?: string;
  version?: string;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface Reminder {
  id: number;
  type: string;
  message: string;
  due_date?: string;
  completed: boolean;
}

// RAG Compliance Chatbot
export interface DocumentInfo {
  filename: string;
  chunks: number;
}

export interface UploadResponse {
  uploaded: string[];
  chunks_added: number;
}

export interface ComplianceChatResponse {
  response: string;
  agent: 'hr' | 'it' | 'both';
  compliant?: boolean | null;
  policy_references: string[];
}

export interface ComplianceDocumentResponse {
  id: number;
  filename: string;
  category: string;
  uploaded_by: number;
  uploaded_at: string;
  chunk_count: number;
  file_size?: number | null;
}
