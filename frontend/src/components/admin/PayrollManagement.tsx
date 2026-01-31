import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useUI } from '../../contexts/UIContext';
// import { useUsers } from '../../hooks/useApi';

const PayrollManagement: React.FC = () => {
  const { addNotification } = useUI();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    pay_period_start: '',
    pay_period_end: '',
    basic_salary: '',
    house_rent_allowance: '',
    leave_travel_allowance: '',
    city_allowance: '',
    performance_pay: '',
    night_shift_allowance: '',
    miscellaneous: '',
    provident_fund: '',
    professional_tax: '',
    es_is_deduction: '',
    status: 'PROCESSED' as 'DRAFT' | 'PROCESSED' | 'PAID',
  });

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['admin', 'payrolls'],
    queryFn: () => adminApi.getAllPayrolls(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createPayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Payroll created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to create payroll',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updatePayroll(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Payroll updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to update payroll',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payrolls'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Payroll deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to delete payroll',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (payroll?: any) => {
    if (payroll) {
      setEditingPayroll(payroll);
      setFormData({
        user_id: payroll.user_id.toString(),
        month: payroll.month,
        year: payroll.year,
        pay_period_start: payroll.pay_period_start,
        pay_period_end: payroll.pay_period_end,
        basic_salary: payroll.basic_salary.toString(),
        house_rent_allowance: payroll.house_rent_allowance.toString(),
        leave_travel_allowance: payroll.leave_travel_allowance.toString(),
        city_allowance: payroll.city_allowance.toString(),
        performance_pay: payroll.performance_pay.toString(),
        night_shift_allowance: payroll.night_shift_allowance.toString(),
        miscellaneous: payroll.miscellaneous.toString(),
        provident_fund: payroll.provident_fund.toString(),
        professional_tax: payroll.professional_tax.toString(),
        es_is_deduction: payroll.es_is_deduction.toString(),
        status: payroll.status,
      });
    } else {
      setEditingPayroll(null);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFormData({
        user_id: '',
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        pay_period_start: firstDay.toISOString().split('T')[0],
        pay_period_end: lastDay.toISOString().split('T')[0],
        basic_salary: '',
        house_rent_allowance: '',
        leave_travel_allowance: '',
        city_allowance: '',
        performance_pay: '',
        night_shift_allowance: '',
        miscellaneous: '',
        provident_fund: '',
        professional_tax: '',
        es_is_deduction: '',
        status: 'PROCESSED',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayroll(null);
    setFormData({
      user_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      pay_period_start: '',
      pay_period_end: '',
      basic_salary: '',
      house_rent_allowance: '',
      leave_travel_allowance: '',
      city_allowance: '',
      performance_pay: '',
      night_shift_allowance: '',
      miscellaneous: '',
      provident_fund: '',
      professional_tax: '',
      es_is_deduction: '',
      status: 'PROCESSED',
    });
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      user_id: parseInt(formData.user_id),
      month: parseInt(formData.month.toString()),
      year: parseInt(formData.year.toString()),
      basic_salary: parseFloat(formData.basic_salary) || 0,
      house_rent_allowance: parseFloat(formData.house_rent_allowance) || 0,
      leave_travel_allowance: parseFloat(formData.leave_travel_allowance) || 0,
      city_allowance: parseFloat(formData.city_allowance) || 0,
      performance_pay: parseFloat(formData.performance_pay) || 0,
      night_shift_allowance: parseFloat(formData.night_shift_allowance) || 0,
      miscellaneous: parseFloat(formData.miscellaneous) || 0,
      provident_fund: parseFloat(formData.provident_fund) || 0,
      professional_tax: parseFloat(formData.professional_tax) || 0,
      es_is_deduction: parseFloat(formData.es_is_deduction) || 0,
    };

    if (editingPayroll) {
      updateMutation.mutate({ id: editingPayroll.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DollarSign size={20} color="#EF4444" />
          <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            Payroll Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#EF4444',
            '&:hover': { backgroundColor: '#DC2626' },
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Create Payroll
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Employee</TableCell>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Period</TableCell>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Basic Salary</TableCell>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Net Salary</TableCell>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
              <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.map((payroll: any) => (
              <TableRow
                key={payroll.id}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                  {payroll.user?.full_name || 'N/A'}
                  <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>
                    {payroll.user?.email || ''}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '14px', color: '#6B7280' }}>
                  {monthNames[payroll.month - 1]} {payroll.year}
                </TableCell>
                <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                  {formatCurrency(payroll.basic_salary)}
                </TableCell>
                <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>
                  {formatCurrency(payroll.net_salary)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={payroll.status}
                    size="small"
                    sx={{
                      backgroundColor: payroll.status === 'PAID' ? '#16A34A20' : '#6B728020',
                      color: payroll.status === 'PAID' ? '#16A34A' : '#6B7280',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(payroll)}
                      sx={{
                        color: '#EF4444',
                        '&:hover': { backgroundColor: '#EF444420' },
                      }}
                    >
                      <Edit size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this payroll?')) {
                          deleteMutation.mutate(payroll.id);
                        }
                      }}
                      sx={{
                        color: '#EF4444',
                        '&:hover': { backgroundColor: '#EF444420' },
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          {editingPayroll ? 'Edit Payroll' : 'Create Payroll'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Employee"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              fullWidth
              required
              disabled={!!editingPayroll}
            >
              {users.map((user: any) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.full_name} ({user.email})
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="Month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 1, max: 12 }}
              />
              <TextField
                type="number"
                label="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Pay Period Start"
                value={formData.pay_period_start}
                onChange={(e) => setFormData({ ...formData, pay_period_start: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Pay Period End"
                value={formData.pay_period_end}
                onChange={(e) => setFormData({ ...formData, pay_period_end: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mt: 1 }}>
              Earnings
            </Typography>
            <TextField
              type="number"
              label="Basic Salary"
              value={formData.basic_salary}
              onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="House Rent Allowance"
                value={formData.house_rent_allowance}
                onChange={(e) => setFormData({ ...formData, house_rent_allowance: e.target.value })}
                fullWidth
              />
              <TextField
                type="number"
                label="Leave Travel Allowance"
                value={formData.leave_travel_allowance}
                onChange={(e) => setFormData({ ...formData, leave_travel_allowance: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="City Allowance"
                value={formData.city_allowance}
                onChange={(e) => setFormData({ ...formData, city_allowance: e.target.value })}
                fullWidth
              />
              <TextField
                type="number"
                label="Performance Pay"
                value={formData.performance_pay}
                onChange={(e) => setFormData({ ...formData, performance_pay: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="Night Shift Allowance"
                value={formData.night_shift_allowance}
                onChange={(e) => setFormData({ ...formData, night_shift_allowance: e.target.value })}
                fullWidth
              />
              <TextField
                type="number"
                label="Miscellaneous"
                value={formData.miscellaneous}
                onChange={(e) => setFormData({ ...formData, miscellaneous: e.target.value })}
                fullWidth
              />
            </Box>
            <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mt: 1 }}>
              Deductions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="number"
                label="Provident Fund"
                value={formData.provident_fund}
                onChange={(e) => setFormData({ ...formData, provident_fund: e.target.value })}
                fullWidth
              />
              <TextField
                type="number"
                label="Professional Tax"
                value={formData.professional_tax}
                onChange={(e) => setFormData({ ...formData, professional_tax: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              type="number"
              label="ES/IS Deduction"
              value={formData.es_is_deduction}
              onChange={(e) => setFormData({ ...formData, es_is_deduction: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              fullWidth
            >
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PROCESSED">Processed</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending || !formData.user_id || !formData.basic_salary}
            sx={{
              backgroundColor: '#EF4444',
              '&:hover': { backgroundColor: '#DC2626' },
              borderRadius: '10px',
              textTransform: 'none',
            }}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : editingPayroll
              ? 'Update'
              : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollManagement;
