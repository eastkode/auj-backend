import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 3, // Default to 'User'
    area_assigned: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    setFormData({
      ...formData,
      [e.target.name as string]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      role_id: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth', { action: 'register', ...formData });
      setSuccess('Registration successful! You can now log in.');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Form fields */}
          <TextField margin="normal" required fullWidth label="Full Name" name="name" onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Email Address" name="email" type="email" onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Password" name="password" type="password" onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Phone Number" name="phone" onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Area Assigned" name="area_assigned" onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role_id" value={formData.role_id} onChange={handleSelectChange}>
              <MenuItem value={1}>Super Admin</MenuItem>
              <MenuItem value={2}>Admin</MenuItem>
              <MenuItem value={3}>User</MenuItem>
            </Select>
          </FormControl>

          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success.main">{success}</Typography>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Register
          </Button>
          <Link to="/login">Already have an account? Sign in</Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
