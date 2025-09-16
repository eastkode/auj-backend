import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box
} from '@mui/material';
import { Link } from 'react-router-dom';

interface Lead {
  id: number;
  form_no: string;
  first_name: string;
  last_name: string;
  email: string;
  course_applied: string;
  form_stage: string;
}

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/api/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Lead Management</Typography>
        <Box>
          <Button component={Link} to="/leads/upload" variant="contained" color="secondary" sx={{ mr: 1 }}>
            Upload from PDF
          </Button>
          <Button component={Link} to="/leads/new" variant="contained">
            Add Lead Manually
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Form No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Course Applied</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.form_no}</TableCell>
                <TableCell>{`${lead.first_name} ${lead.last_name}`}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.course_applied}</TableCell>
                <TableCell>{lead.form_stage}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/leads/${lead.id}`} sx={{ mr: 1 }}>
                    View
                  </Button>
                  <Button component={Link} to={`/leads/${lead.id}/edit`}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeadList;
