export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'PAID';

export interface Payroll {
  id: number;
  user_id: number;
  month: number;
  year: number;
  pay_period_start: string;
  pay_period_end: string;
  
  // Earnings
  basic_salary: number;
  house_rent_allowance: number;
  leave_travel_allowance: number;
  city_allowance: number;
  performance_pay: number;
  night_shift_allowance: number;
  miscellaneous: number;
  
  // Deductions
  provident_fund: number;
  professional_tax: number;
  es_is_deduction: number;
  
  // Totals
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  
  status: PayrollStatus;
  generated_at: string;
  file_url?: string;
}

export interface PayrollSummary {
  payrolls: Payroll[];
  latest_payroll?: Payroll;
  total_earnings_ytd: number;
  total_deductions_ytd: number;
  net_salary_ytd: number;
}
