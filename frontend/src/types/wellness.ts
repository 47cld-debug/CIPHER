export interface Initiative {
  id: number;
  title: string;
  description?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  session_date?: string;
  session_time?: string;
  trainer_name?: string;
  total_slots?: number;
  location?: string;
  booked_slots?: number;
  available_slots?: number;
}

export interface InitiativeDetail extends Initiative {
  booked_slots: number;
  available_slots: number;
}

export interface BookSessionResponse {
  id: number;
  initiative_id: number;
  message: string;
}

export interface Session {
  id: number;
  initiative_id: number;
  requested_at: string;
  status: string;
  initiative: Initiative;
}
