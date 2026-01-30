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
