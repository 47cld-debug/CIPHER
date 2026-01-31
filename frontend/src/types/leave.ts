export type LeaveType = 
  | 'EARNED_LEAVE'
  | 'CASUAL_LEAVE'
  | 'SICK_LEAVE'
  | 'OPTIONAL_HOLIDAY'
  | 'REGIONAL_HOLIDAY'
  | 'LEAVE_WITHOUT_PAY'
  | 'PATERNITY_LEAVE'
  | 'MATERNITY_LEAVE'
  | 'COMPENSATORY_LEAVE'
  | 'DEATH_LEAVE'
  | 'ELECTION_LEAVE';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id: number;
  user_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason?: string;
  status: LeaveStatus;
  applied_at: string;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type: LeaveType;
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
  year: number;
}

export interface LeaveSummary {
  leaves: Leave[];
  balances: LeaveBalance[];
  pending_leaves: Leave[];
  approved_leaves: Leave[];
  rejected_leaves: Leave[];
}
