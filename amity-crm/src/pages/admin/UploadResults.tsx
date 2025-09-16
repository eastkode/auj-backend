import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, Input, Alert } from '@mui/material';

const UploadResults: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<string>('');
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadResponse('');

    const formData = new FormData();
    formData.append('resultsCsv', selectedFile);

    try {
      // Step 1: "Parse" the CSV
      const parseResponse = await axios.post('/api/upload-results', formData);
      const updates = parseResponse.data.updates;

      // Step 2: Send the updates to be processed
      const bulkUpdateResponse = await axios.post('/api/leads/bulk-update', { updates });

      setUploadResponse(bulkUpdateResponse.data.message);
    } catch (err) {
      setError('File upload and processing failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Entrance Results (CSV)
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Upload a CSV file with columns 'form_no' and 'result' ('selected', 'not_selected', 'waitlisted').
        </Typography>
        <Box sx={{ my: 2 }}>
          <Input type="file" onChange={handleFileChange} accept=".csv" />
        </Box>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Processing...' : 'Upload and Process Results'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {uploadResponse && <Alert severity="success" sx={{ mt: 2 }}>{uploadResponse}</Alert>}
      </Box>
    </Container>
  );
};

export default UploadResults;
