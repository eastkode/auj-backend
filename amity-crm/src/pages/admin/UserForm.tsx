import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, TextField, Container, Typography, Box, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel
} from '@mui/material';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: 3,
    area_assigned: '',
    is_active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/users/${id}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(err => console.error('Failed to fetch user:', err));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({ ...prev, role_id: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (isEditMode) {
        await axios.put(`/api/users/${id}`, formData);
      } else {
        await axios.post('/api/users', formData);
      }
      navigate('/admin/users');
    } catch (err) {
      setError('Failed to save user. Please try again.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit User' : 'Create User'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth margin="normal" label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Area Assigned" name="area_assigned" value={formData.area_assigned} onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role_id" value={formData.role_id} onChange={handleSelectChange}>
              <MenuItem value={1}>Super Admin</MenuItem>
              <MenuItem value={2}>Admin</MenuItem>
              <MenuItem value={3}>User</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch name="is_active" checked={formData.is_active} onChange={handleChange} />}
            label="Active"
          />
          {error && <Typography color="error">{error}</Typography>}
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={() => navigate('/admin/users')} sx={{ ml: 1 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default UserForm;
