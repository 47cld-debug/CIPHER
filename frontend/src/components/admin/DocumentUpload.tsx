import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { useComplianceDocuments, useUploadComplianceDocument, useDeleteComplianceDocument } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

const DocumentUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { addNotification } = useUI();
  
  const { data: documents = [], isLoading, refetch } = useComplianceDocuments();
  const uploadMutation = useUploadComplianceDocument();
  const deleteMutation = useDeleteComplianceDocument();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      // Filter for allowed file types
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const validFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return allowedTypes.includes(ext);
      });
      
      if (validFiles.length !== files.length) {
        addNotification({
          id: Date.now().toString(),
          message: 'Some files were skipped. Only PDF, DOC, DOCX, and TXT files are allowed.',
          type: 'warning',
        });
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please select at least one file to upload',
        type: 'warning',
      });
      return;
    }

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(selectedFiles);
      addNotification({
        id: Date.now().toString(),
        message: `Successfully uploaded ${selectedFiles.length} document(s)`,
        type: 'success',
      });
      setSelectedFiles([]);
      refetch();
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to upload documents',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(documentId);
      addNotification({
        id: Date.now().toString(),
        message: 'Document deleted successfully',
        type: 'success',
      });
      refetch();
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to delete document',
        type: 'error',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'HR':
        return { bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
      case 'IT':
        return { bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' };
      case 'BOTH':
        return { bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
      default:
        return { bgcolor: 'rgba(0, 0, 0, 0.1)', color: '#666' };
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 2 }}>
          Upload Compliance Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload PDF, DOC, DOCX, or TXT files containing HR or IT policies. Documents will be automatically
          classified, chunked, and stored in ChromaDB for RAG-based compliance queries.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderColor: '#DC143C',
                color: '#DC143C',
                '&:hover': {
                  borderColor: '#B0122A',
                  backgroundColor: 'rgba(220, 20, 60, 0.05)',
                },
              }}
            >
              Select Files
            </Button>
          </label>
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Selected Files ({selectedFiles.length}):
            </Typography>
            <List dense>
              {selectedFiles.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ color: '#DC143C' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{
                    border: '1px solid rgba(220, 20, 60, 0.1)',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B0122A 0%, #E55A25 100%)',
                },
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Uploading...
                </>
              ) : (
                'Upload Documents'
              )}
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 2 }}>
          Uploaded Documents ({documents.length})
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#DC143C' }} />
          </Box>
        ) : documents.length === 0 ? (
          <Alert severity="info">
            No documents uploaded yet. Upload documents to enable RAG-based compliance queries.
          </Alert>
        ) : (
          <List>
            {documents.map((doc: any) => (
              <ListItem
                key={doc.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(doc.id)}
                    sx={{ color: '#DC143C' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  border: '1px solid rgba(220, 20, 60, 0.1)',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(220, 20, 60, 0.02)',
                  },
                }}
              >
                <DescriptionIcon sx={{ color: '#DC143C', mr: 2 }} />
                <ListItemText
                  primary={doc.filename}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={doc.category}
                        size="small"
                        sx={getCategoryColor(doc.category)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {doc.chunk_count} chunks • {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'N/A'} •{' '}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentUpload;
