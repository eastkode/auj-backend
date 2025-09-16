import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Tab, Tabs, Paper, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';

interface Lead {
  id: number;
  form_stage: string;
  [key: string]: any; // Allow any other properties
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      axios.get(`/api/leads/${id}`)
        .then(response => setLead(response.data))
        .catch(err => console.error('Failed to fetch lead details:', err));
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = async (event: any) => {
    const newStatus = event.target.value;
    if (!lead) return;

    const oldLead = lead;
    // Optimistic update
    setLead({ ...lead, form_stage: newStatus });

    try {
      await axios.put(`/api/leads/${lead.id}`, { form_stage: newStatus });
    } catch (error) {
      console.error('Failed to update lead status:', error);
      // Revert on error
      setLead(oldLead);
    }
  };

  if (!lead) {
    return <Typography>Loading lead details...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lead: {lead.first_name} {lead.last_name} ({lead.form_no})
      </Typography>
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Lead Info" />
          <Tab label="Entrance Calls" />
          <Tab label="Payments" disabled />
          <Tab label="Scholarships" disabled />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <FormControl sx={{ mb: 3, minWidth: 240 }}>
            <InputLabel>Lead Status</InputLabel>
            <Select value={lead.form_stage} onChange={handleStatusChange}>
              <MenuItem value="form_submitted">Form Submitted</MenuItem>
              <MenuItem value="entrance_pending">Entrance Pending</MenuItem>
              <MenuItem value="selected">Selected</MenuItem>
              <MenuItem value="not_selected">Not Selected</MenuItem>
              <MenuItem value="waitlisted">Waitlisted</MenuItem>
              <MenuItem value="fees_pending">Fees Pending</MenuItem>
              <MenuItem value="admitted">Admitted</MenuItem>
            </Select>
          </FormControl>

          {Object.entries(lead).map(([key, value]) => (
            <Typography key={key}>
              <strong>{key}:</strong> {value}
            </Typography>
          ))}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography>Entrance call history and form will be here.</Typography>
          {/* TODO: Implement EntranceCalls component */}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default LeadDetail;
