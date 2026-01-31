import apiClient from './client';
import type { Leave, LeaveBalance, LeaveSummary } from '../types/leave';

export const leaveApi = {
  getLeaveSummary: async (): Promise<LeaveSummary> => {
    const response = await apiClient.get('/leave');
    return response.data;
  },

  getLeaves: async (): Promise<Leave[]> => {
    const response = await apiClient.get('/leave/leaves');
    return response.data;
  },

  getLeaveBalances: async (): Promise<LeaveBalance[]> => {
    const response = await apiClient.get('/leave/balances');
    return response.data;
  },

  createLeave: async (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
  }): Promise<Leave> => {
    const response = await apiClient.post('/leave/leaves', leaveData);
    return response.data;
  },
};
