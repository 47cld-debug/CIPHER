import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useUploadCertificate } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

interface CertificateUploadProps {
  open: boolean;
  onClose: () => void;
  enrollmentId: number;
  onSuccess?: () => void;
}

const CertificateUpload: React.FC<CertificateUploadProps> = ({
  open,
  onClose,
  enrollmentId,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadCertificate = useUploadCertificate();
  const { addNotification } = useUI();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        addNotification({
          id: Date.now().toString(),
          message: 'Please upload a PDF or image file',
          type: 'error',
        });
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please select a file',
        type: 'error',
      });
      return;
    }

    try {
      await uploadCertificate.mutateAsync({ enrollmentId, file });
      addNotification({
        id: Date.now().toString(),
        message: 'Certificate uploaded successfully',
        type: 'success',
      });
      setFile(null);
      setPreview(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to upload certificate',
        type: 'error',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          borderBottom: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
          Upload Completion Certificate
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Upload your certificate to verify course completion
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            border: '2px dashed rgba(220, 20, 60, 0.3)',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(220, 20, 60, 0.02)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#DC143C',
              backgroundColor: 'rgba(220, 20, 60, 0.05)',
            },
          }}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="certificate-upload"
          />
          <label htmlFor="certificate-upload">
            <Button
              variant="outlined"
              component="span"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#DC143C',
                color: '#DC143C',
                mb: 2,
                '&:hover': {
                  borderColor: '#8B0000',
                  backgroundColor: 'rgba(220, 20, 60, 0.05)',
                },
              }}
            >
              Choose File
            </Button>
          </label>
          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#DC143C', mb: 1 }}>
                Selected: {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
          {preview && (
            <Box
              sx={{
                mt: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Box>
          )}
          {!file && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported formats: PDF, PNG, JPG, JPEG
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: '#DC143C',
            color: '#DC143C',
            '&:hover': {
              borderColor: '#8B0000',
              backgroundColor: 'rgba(220, 20, 60, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!file || uploadCertificate.isPending}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {uploadCertificate.isPending ? 'Uploading...' : 'Upload Certificate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificateUpload;
