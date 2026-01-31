import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
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
} from '@mui/material';
import { Calendar, CalendarCheck, CalendarX, Plus } from 'lucide-react';
import { useLeaveSummary, useCreateLeave } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';
import type { LeaveType } from '../../types/leave';

const LeavePage: React.FC = () => {
  const { data: leaveSummary, isLoading } = useLeaveSummary();
  const createLeave = useCreateLeave();
  const { addNotification } = useUI();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: '' as LeaveType | '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const leaveTypeLabels: Record<LeaveType, string> = {
    EARNED_LEAVE: 'Earned Leave',
    CASUAL_LEAVE: 'Casual Leave',
    SICK_LEAVE: 'Sick Leave',
    OPTIONAL_HOLIDAY: 'Optional Holiday',
    REGIONAL_HOLIDAY: 'Regional Holiday',
    LEAVE_WITHOUT_PAY: 'Leave Without Pay',
    PATERNITY_LEAVE: 'Paternity Leave',
    MATERNITY_LEAVE: 'Maternity Leave',
    COMPENSATORY_LEAVE: 'Compensatory Leave',
    DEATH_LEAVE: 'Death Leave',
    ELECTION_LEAVE: 'Election Leave',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#16A34A';
      case 'REJECTED':
        return '#EF4444';
      case 'PENDING':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleCreateLeave = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    try {
      await createLeave.mutateAsync(formData);
      addNotification({
        id: Date.now().toString(),
        message: 'Leave request submitted successfully',
        type: 'success',
      });
      setDialogOpen(false);
      setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to submit leave request',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Calendar size={24} color="#EF4444" />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Leave Management
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            View your leave balance, apply for leave, and track leave history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setDialogOpen(true)}
          sx={{
            backgroundColor: '#EF4444',
            '&:hover': { backgroundColor: '#DC2626' },
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Leave Balances */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {leaveSummary?.balances.map((balance) => (
          <Grid item xs={12} sm={6} md={4} key={balance.id}>
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
                <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827', mb: 1 }}>
                  {leaveTypeLabels[balance.leave_type]}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280' }}>
                    Available
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {balance.available}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280' }}>
                    Used
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {balance.used}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '12px', color: '#6B7280' }}>
                    Pending
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#F59E0B' }}>
                    {balance.pending}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Leave History */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              <CalendarCheck size={20} color="#EF4444" />
              <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                Approved Leaves
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Type</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Dates</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveSummary?.approved_leaves.slice(0, 5).map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                        {leaveTypeLabels[leave.leave_type]}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', color: '#6B7280' }}>
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', color: '#111827' }}>{leave.number_of_days}</TableCell>
                    </TableRow>
                  ))}
                  {(!leaveSummary?.approved_leaves || leaveSummary.approved_leaves.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#6B7280', py: 3 }}>
                        No approved leaves
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              <CalendarX size={20} color="#F59E0B" />
              <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                Pending Leaves
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Type</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Dates</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveSummary?.pending_leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                        {leaveTypeLabels[leave.leave_type]}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', color: '#6B7280' }}>
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(leave.status) + '20',
                            color: getStatusColor(leave.status),
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!leaveSummary?.pending_leaves || leaveSummary.pending_leaves.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#6B7280', py: 3 }}>
                        No pending leaves
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Apply Leave Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Leave Type"
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as LeaveType })}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              {Object.entries(leaveTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Start Date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
            <TextField
              type="date"
              label="End Date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
            <TextField
              multiline
              rows={3}
              label="Reason (Optional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateLeave}
            variant="contained"
            disabled={createLeave.isPending}
            sx={{
              backgroundColor: '#EF4444',
              '&:hover': { backgroundColor: '#DC2626' },
              borderRadius: '10px',
              textTransform: 'none',
            }}
          >
            {createLeave.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePage;
