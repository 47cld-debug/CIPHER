export interface Initiative {
  id: number;
  title: string;
  description?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export interface Session {
  id: number;
  initiative_id: number;
  requested_at: string;
  status: string;
  initiative: Initiative;
}
