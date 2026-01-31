import apiClient from './client';
import type { Payroll, PayrollSummary } from '../types/payroll';

export const payrollApi = {
  getPayrollSummary: async (): Promise<PayrollSummary> => {
    const response = await apiClient.get('/payroll');
    return response.data;
  },

  getPayslips: async (): Promise<Payroll[]> => {
    const response = await apiClient.get('/payroll/payslips');
    return response.data;
  },

  getPayslipByPeriod: async (month: number, year: number): Promise<Payroll> => {
    const response = await apiClient.get(`/payroll/payslips/${month}/${year}`);
    return response.data;
  },
};
