import React from 'react';
import { Typography, Container } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Dashboard
      </Typography>
      <Typography>
        Welcome to the Amity CRM Dashboard.
      </Typography>
    </Container>
  );
};

export default Dashboard;
