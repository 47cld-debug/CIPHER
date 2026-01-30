import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { adminApi } from '../../api/admin';
import { useUI } from '../../contexts/UIContext';
import { VerificationStatus } from '../../types/learning';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Certificate {
  id: number;
  enrollment_id: number;
  file_url: string;
  verification_status: VerificationStatus;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: number;
  enrollment?: {
    id: number;
    course: {
      id: number;
      title: string;
    };
    user: {
      id: number;
      full_name: string;
      email: string;
    };
  };
}

const CertificateVerification: React.FC = () => {
  const { addNotification } = useUI();
  const queryClient = useQueryClient();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);

  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ['pendingCertificates'],
    queryFn: () => adminApi.getPendingCertificates(),
    retry: 1,
    staleTime: 30000,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ certificateId, status }: { certificateId: number; status: VerificationStatus }) =>
      adminApi.verifyCertificate(certificateId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingCertificates'] });
      addNotification({
        id: Date.now().toString(),
        message: `Certificate ${actionType === 'verify' ? 'verified' : 'rejected'} successfully`,
        type: 'success',
      });
      setDialogOpen(false);
      setSelectedCertificate(null);
      setActionType(null);
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to update certificate status',
        type: 'error',
      });
    },
  });

  const handleVerify = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setActionType('verify');
    setDialogOpen(true);
  };

  const handleReject = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setActionType('reject');
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedCertificate && actionType) {
      verifyMutation.mutate({
        certificateId: selectedCertificate.id,
        status: actionType === 'verify' ? 'VERIFIED' : 'REJECTED',
      });
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          p: 4,
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VerifiedUserIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#DC143C',
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: '-0.5px',
              }}
            >
              Certificate Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and verify employee certificates
            </Typography>
          </Box>
        </Box>
      </Paper>

      {certificates.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: '2px dashed rgba(220, 20, 60, 0.3)',
            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.02) 0%, rgba(255, 107, 53, 0.02) 100%)',
          }}
        >
          <Typography variant="h6" sx={{ color: '#DC143C', mb: 2, fontWeight: 600 }}>
            No Pending Certificates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All certificates have been reviewed.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(220, 20, 60, 0.05)' }}>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Certificate</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow
                  key={cert.id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(220, 20, 60, 0.02)',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cert.enrollment?.user?.full_name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cert.enrollment?.user?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cert.enrollment?.course?.title || 'Unknown Course'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(cert.uploaded_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cert.verification_status}
                      size="small"
                      color={getStatusColor(cert.verification_status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      href={cert.file_url}
                      target="_blank"
                      sx={{
                        borderColor: '#DC143C',
                        color: '#DC143C',
                        '&:hover': {
                          borderColor: '#B0122A',
                          bgcolor: 'rgba(220, 20, 60, 0.05)',
                        },
                      }}
                    >
                      View Certificate
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleVerify(cert)}
                        sx={{
                          bgcolor: '#4caf50',
                          '&:hover': {
                            bgcolor: '#45a049',
                          },
                        }}
                      >
                        Verify
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(cert)}
                        sx={{
                          bgcolor: '#f44336',
                          '&:hover': {
                            bgcolor: '#da190b',
                          },
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#DC143C', fontWeight: 600 }}>
          {actionType === 'verify' ? 'Verify Certificate' : 'Reject Certificate'}
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box>
              <Card sx={{ mb: 2, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Employee
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {selectedCertificate.enrollment?.user?.full_name || 'Unknown'}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Course
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {selectedCertificate.enrollment?.course?.title || 'Unknown Course'}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Uploaded
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(selectedCertificate.uploaded_at).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
              <Typography variant="body2" color="text.secondary">
                Are you sure you want to {actionType === 'verify' ? 'verify' : 'reject'} this certificate?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={verifyMutation.isPending}
            sx={{
              bgcolor: actionType === 'verify' ? '#4caf50' : '#f44336',
              '&:hover': {
                bgcolor: actionType === 'verify' ? '#45a049' : '#da190b',
              },
            }}
          >
            {verifyMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              actionType === 'verify' ? 'Verify' : 'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificateVerification;
