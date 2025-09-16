import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/auth', {
        action: 'forgotPassword',
        email,
      });
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Enter your email address and we will send you a link to reset your password.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message && <Typography color="success.main">{message}</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Send Reset Link
          </Button>
          <Link to="/login">Back to login</Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
