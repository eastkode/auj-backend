import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, TextField, Container, Typography, Box, Grid
} from '@mui/material';

const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    form_no: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    course_applied: '',
    form_stage: 'form_submitted',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/leads/${id}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(err => console.error('Failed to fetch lead:', err));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (isEditMode) {
        await axios.put(`/api/leads/${id}`, formData);
      } else {
        await axios.post('/api/leads', formData);
      }
      navigate('/leads');
    } catch (err) {
      setError('Failed to save lead. Please try again.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Lead' : 'Create Lead'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Form No." name="form_no" value={formData.form_no} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Course Applied" name="course_applied" value={formData.course_applied} onChange={handleChange} /></Grid>
            {/* Add more fields as needed */}
          </Grid>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="primary">
              Save Lead
            </Button>
            <Button onClick={() => navigate('/leads')} sx={{ ml: 1 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LeadForm;
