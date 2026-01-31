import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DollarSign, FileText, Download } from 'lucide-react';
import { usePayrollSummary, usePayslips } from '../../hooks/useApi';

const PayrollPage: React.FC = () => {
  const { data: payrollSummary, isLoading: summaryLoading } = usePayrollSummary();
  const { data: payslips, isLoading: payslipsLoading } = usePayslips();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isLoading = summaryLoading || payslipsLoading;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  const filteredPayslips = payslips?.filter(p => p.year === selectedYear) || [];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <DollarSign size={24} color="#EF4444" />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Payroll & Salary
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            View your salary slips, earnings, and deductions
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as number)}
            label="Year"
            sx={{ borderRadius: '10px' }}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                Total Earnings (YTD)
              </Typography>
              <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>
                {formatCurrency(payrollSummary?.total_earnings_ytd || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                Total Deductions (YTD)
              </Typography>
              <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>
                {formatCurrency(payrollSummary?.total_deductions_ytd || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>
                Net Salary (YTD)
              </Typography>
              <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#16A34A' }}>
                {formatCurrency(payrollSummary?.net_salary_ytd || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payslips List */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FileText size={20} color="#EF4444" />
          <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            Salary Slips ({selectedYear})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Month</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Earnings</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Deductions</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Net Salary</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow
                  key={payslip.id}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <TableCell sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {monthNames[payslip.month - 1]} {payslip.year}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                    {formatCurrency(payslip.total_earnings)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#EF4444' }}>
                    {formatCurrency(payslip.total_deductions)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>
                    {formatCurrency(payslip.net_salary)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payslip.status}
                      size="small"
                      sx={{
                        backgroundColor: payslip.status === 'PAID' ? '#16A34A20' : '#6B728020',
                        color: payslip.status === 'PAID' ? '#16A34A' : '#6B7280',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {payslip.file_url ? (
                      <Box
                        component="a"
                        href={payslip.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#EF4444',
                          textDecoration: 'none',
                          fontSize: '14px',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <Download size={16} />
                        Download
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                        Not available
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayslips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#6B7280', py: 4 }}>
                    No payslips available for {selectedYear}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Latest Payslip Details */}
      {payrollSummary?.latest_payroll && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            p: 3,
            mt: 3,
          }}
        >
          <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
            Latest Payslip Details ({monthNames[payrollSummary.latest_payroll.month - 1]} {payrollSummary.latest_payroll.year})
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 2 }}>
                Earnings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Basic Salary</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.basic_salary)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>House Rent Allowance</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.house_rent_allowance)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Leave Travel Allowance</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.leave_travel_allowance)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>City Allowance</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.city_allowance)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Performance Pay</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.performance_pay)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Night Shift Allowance</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.night_shift_allowance)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Miscellaneous</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.miscellaneous)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #E5E7EB', mt: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Total Earnings</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {formatCurrency(payrollSummary.latest_payroll.total_earnings)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 2 }}>
                Deductions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Provident Fund</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#EF4444' }}>
                    {formatCurrency(payrollSummary.latest_payroll.provident_fund)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>Professional Tax</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#EF4444' }}>
                    {formatCurrency(payrollSummary.latest_payroll.professional_tax)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>ES/IS Deduction</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#EF4444' }}>
                    {formatCurrency(payrollSummary.latest_payroll.es_is_deduction)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #E5E7EB', mt: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Total Deductions</Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
                    {formatCurrency(payrollSummary.latest_payroll.total_deductions)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '2px solid #E5E7EB', mt: 1 }}>
                  <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Net Salary</Typography>
                  <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#16A34A' }}>
                    {formatCurrency(payrollSummary.latest_payroll.net_salary)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default PayrollPage;
