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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Calendar, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useUI } from '../../contexts/UIContext';

const LeaveManagement: React.FC = () => {
  const { addNotification } = useUI();
  const queryClient = useQueryClient();
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; leave: any; action: 'approve' | 'reject' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: pendingLeaves = [], isLoading } = useQuery({
    queryKey: ['admin', 'pendingLeaves'],
    queryFn: () => adminApi.getPendingLeaves(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ leaveId, status, reason }: { leaveId: number; status: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      adminApi.approveLeave(leaveId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Leave request processed successfully',
        type: 'success',
      });
      setApprovalDialog(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to process leave request',
        type: 'error',
      });
    },
  });

  const handleApprove = (leave: any) => {
    setApprovalDialog({ open: true, leave, action: 'approve' });
  };

  const handleReject = (leave: any) => {
    setApprovalDialog({ open: true, leave, action: 'reject' });
  };

  const handleConfirm = () => {
    if (!approvalDialog) return;
    
    const status = approvalDialog.action === 'approve' ? 'APPROVED' : 'REJECTED';
    approveMutation.mutate({
      leaveId: approvalDialog.leave.id,
      status,
      reason: approvalDialog.action === 'reject' ? rejectionReason : undefined,
    });
  };

  const leaveTypeLabels: Record<string, string> = {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calendar size={20} color="#EF4444" />
        <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          Pending Leave Requests
        </Typography>
      </Box>

      {pendingLeaves.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Typography variant="body1" sx={{ color: '#6B7280' }}>
            No pending leave requests
          </Typography>
        </Paper>
      ) : (
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
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Leave Type</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Dates</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Days</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Reason</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Applied At</TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingLeaves.map((leave: any) => (
                <TableRow
                  key={leave.id}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                    {leave.user?.full_name || 'N/A'}
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>
                      {leave.user?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#111827' }}>
                    {leaveTypeLabels[leave.leave_type] || leave.leave_type}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#111827' }}>{leave.number_of_days}</TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#6B7280', maxWidth: 200 }}>
                    {leave.reason || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {new Date(leave.applied_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleApprove(leave)}
                        sx={{
                          color: '#16A34A',
                          '&:hover': { backgroundColor: '#16A34A20' },
                        }}
                      >
                        <Check size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleReject(leave)}
                        sx={{
                          color: '#EF4444',
                          '&:hover': { backgroundColor: '#EF444420' },
                        }}
                      >
                        <X size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={approvalDialog?.open || false}
        onClose={() => {
          setApprovalDialog(null);
          setRejectionReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          {approvalDialog?.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent>
          {approvalDialog?.action === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              sx={{ mt: 2 }}
            />
          )}
          {approvalDialog?.action === 'approve' && (
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
              Are you sure you want to approve this leave request?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setApprovalDialog(null);
              setRejectionReason('');
            }}
            sx={{ color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={approveMutation.isPending || (approvalDialog?.action === 'reject' && !rejectionReason.trim())}
            sx={{
              backgroundColor: approvalDialog?.action === 'approve' ? '#16A34A' : '#EF4444',
              '&:hover': {
                backgroundColor: approvalDialog?.action === 'approve' ? '#15803D' : '#DC2626',
              },
              borderRadius: '10px',
              textTransform: 'none',
            }}
          >
            {approveMutation.isPending ? 'Processing...' : approvalDialog?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
