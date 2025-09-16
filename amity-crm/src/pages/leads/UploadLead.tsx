import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Box, Input } from '@mui/material';

const UploadLead: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadResponse(null);

    const formData = new FormData();
    formData.append('leadPdf', selectedFile);

    try {
      // Step 1: Upload the PDF and get mock extracted data
      const uploadResponse = await axios.post('/api/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { extractedData } = uploadResponse.data;

      if (!extractedData) {
        throw new Error('No extracted data returned from PDF processing.');
      }

      // Step 2: Create the lead with the extracted data
      const createLeadResponse = await axios.post('/api/leads', extractedData);

      setUploadResponse(createLeadResponse.data); // Show the newly created lead
    } catch (err) {
      setError('An error occurred during the lead creation process.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Lead from PDF
        </Typography>
        <Box sx={{ my: 2 }}>
          <Input type="file" onChange={handleFileChange} />
        </Box>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload and Process PDF'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {uploadResponse && (
          <Box sx={{ mt: 4, p: 2, border: '1px solid grey' }}>
            <Typography variant="h6">Upload Successful!</Typography>
            <Typography>A new lead has been created with the following mock data:</Typography>
            <pre>{JSON.stringify(uploadResponse.createdLead, null, 2)}</pre>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UploadLead;
