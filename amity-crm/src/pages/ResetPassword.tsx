import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await axios.post('/api/auth', {
        action: 'resetPassword',
        token,
        newPassword: password,
      });
      setMessage('Password has been reset successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to reset password. The link may be invalid or expired.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {message && <Typography color="success.main">{message}</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Reset Password
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
