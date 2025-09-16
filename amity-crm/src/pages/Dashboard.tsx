import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { roleId } = useAuth();
  const isSuperAdmin = roleId === 1;
  const isAdmin = roleId === 2;

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Dashboard
      </Typography>

      <Typography sx={{ mb: 2 }}>
        Welcome to the Amity CRM Dashboard.
      </Typography>

      <Box>
        {(isSuperAdmin || isAdmin) && (
          <Button component={Link} to="/admin/users" variant="outlined" sx={{ mr: 1 }}>
            Manage Users
          </Button>
        )}
        <Button component={Link} to="/leads" variant="outlined" sx={{ mr: 1 }}>
          Manage Leads
        </Button>
        {(isSuperAdmin || isAdmin) && (
          <Button component={Link} to="/admin/courses" variant="outlined" sx={{ mr: 1 }}>
            Manage Courses
          </Button>
        )}
        {isAdmin && (
          <Button component={Link} to="/admin/upload-results" variant="outlined">
            Upload Entrance Results
          </Button>
        )}
      </Box>

    </Container>
  );
};

export default Dashboard;
