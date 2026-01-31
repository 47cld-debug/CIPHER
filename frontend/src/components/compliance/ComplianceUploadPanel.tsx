import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useComplianceDocuments, useUploadComplianceDocuments, useClearComplianceDocuments } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

const CRIMSON = '#DC143C';
const BORDER = '1px solid rgba(220, 20, 60, 0.1)';
const ALLOWED = ['.pdf', '.doc', '.docx', '.txt'];

function getFileIcon(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return <PictureAsPdfIcon sx={{ color: CRIMSON }} />;
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return <DescriptionIcon sx={{ color: CRIMSON }} />;
  return <TextSnippetIcon sx={{ color: CRIMSON }} />;
}

const ComplianceUploadPanel: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { data: docsData, isLoading: docsLoading } = useComplianceDocuments();
  const uploadMutation = useUploadComplianceDocuments();
  const clearMutation = useClearComplianceDocuments();
  const { addNotification } = useUI();

  const documents = docsData?.documents ?? [];
  const hasDocs = documents.length > 0;
  const isUploading = uploadMutation.isPending;
  const isClearing = clearMutation.isPending;

  const validateFiles = (files: FileList | File[]): File[] => {
    const arr = Array.from(files);
    return arr.filter((f) => {
      const ext = '.' + f.name.toLowerCase().split('.').pop();
      return ALLOWED.includes(ext);
    });
  };

  const handleUpload = useCallback(
    async (files: File[]) => {
      const valid = validateFiles(files);
      if (valid.length === 0) {
        setUploadError('Only PDF, DOC, DOCX, and TXT files are allowed.');
        return;
      }
      setUploadError(null);
      try {
        await uploadMutation.mutateAsync(valid);
        addNotification({
          id: Date.now().toString(),
          message: `Uploaded ${valid.length} file(s). You can now ask questions.`,
          type: 'success',
        });
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Upload failed. Please try again.';
        setUploadError(msg);
        addNotification({ id: Date.now().toString(), message: msg, type: 'error' });
      }
    },
    [uploadMutation, addNotification]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleUpload(Array.from(e.dataTransfer.files));
    },
    [handleUpload]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) handleUpload(Array.from(files));
      e.target.value = '';
    },
    [handleUpload]
  );

  const handleClear = useCallback(async () => {
    try {
      await clearMutation.mutateAsync();
      addNotification({
        id: Date.now().toString(),
        message: 'Documents cleared. You can upload new ones.',
        type: 'success',
      });
    } catch (err: any) {
      addNotification({
        id: Date.now().toString(),
        message: err.response?.data?.detail || 'Failed to clear documents.',
        type: 'error',
      });
    }
  }, [clearMutation, addNotification]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: BORDER,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, mb: 2 }}>
        Uploaded documents
      </Typography>
      <Box
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        sx={{
          border: `2px dashed ${dragOver ? CRIMSON : 'rgba(220, 20, 60, 0.3)'}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: dragOver ? 'rgba(220, 20, 60, 0.05)' : 'transparent',
          transition: 'all 0.2s ease',
          mb: 2,
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          id="compliance-upload-input"
        />
        <label htmlFor="compliance-upload-input">
          <CloudUploadIcon sx={{ fontSize: 48, color: CRIMSON, mb: 1, display: 'block', mx: 'auto' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Drag & drop files here, or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            PDF, DOC, DOCX, TXT only
          </Typography>
          <Button
            component="span"
            variant="outlined"
            size="small"
            sx={{
              mt: 2,
              borderColor: CRIMSON,
              color: CRIMSON,
              '&:hover': { borderColor: CRIMSON, bgcolor: 'rgba(220, 20, 60, 0.08)' },
            }}
          >
            Choose files
          </Button>
        </label>
      </Box>
      {uploadError && (
        <Typography variant="caption" sx={{ color: 'error.main', mb: 1, display: 'block' }}>
          {uploadError}
        </Typography>
      )}
      {isUploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} sx={{ color: CRIMSON }} />
          <Typography variant="body2" color="text.secondary">
            Uploading…
          </Typography>
        </Box>
      )}
      {docsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ color: CRIMSON }} />
        </Box>
      ) : hasDocs ? (
        <>
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {documents.map((d) => (
              <ListItem key={d.filename} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{getFileIcon(d.filename)}</ListItemIcon>
                <ListItemText
                  primary={d.filename}
                  secondary={`${d.chunks} chunk(s)`}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={isClearing ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <DeleteSweepIcon />}
            size="small"
            onClick={handleClear}
            disabled={isClearing}
            sx={{
              mt: 2,
              color: CRIMSON,
              '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
            }}
          >
            Clear all
          </Button>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Upload HR/IT/compliance documents to enable the assistant.
        </Typography>
      )}
    </Paper>
  );
};

export default ComplianceUploadPanel;
