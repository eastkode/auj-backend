import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Tab, Tabs, Paper, FormControl, Select, MenuItem, InputLabel, Switch, FormControlLabel
} from '@mui/material';
import EntranceCalls from '../../components/EntranceCalls';

interface Lead {
  id: number;
  form_stage: string;
  scholarship_eligible: boolean;
  scholarship_amount: number;
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
    updateLead({ form_stage: newStatus });
  };

  const handleScholarshipChange = (field: string, value: any) => {
    let update: Partial<Lead> = { [field]: value };
    // If toggling eligibility off, reset amount
    if (field === 'scholarship_eligible' && !value) {
      update.scholarship_amount = 0;
    }
    updateLead(update);
  };

  const updateLead = async (updateData: Partial<Lead>) => {
    if (!lead) return;

    const oldLead = { ...lead };
    const newLead = { ...lead, ...updateData };

    // Optimistic update
    setLead(newLead);

    try {
      await axios.put(`/api/leads/${lead.id}`, updateData);
    } catch (error) {
      console.error('Failed to update lead:', error);
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

          <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Scholarship</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={lead.scholarship_eligible}
                  onChange={(e) => handleScholarshipChange('scholarship_eligible', e.target.checked)}
                />
              }
              label="Scholarship Eligible"
            />
            {lead.scholarship_eligible && (
              <FormControl sx={{ mt: 2, minWidth: 240 }}>
                <InputLabel>Scholarship Percentage</InputLabel>
                <Select
                  value={lead.scholarship_amount || 0}
                  onChange={(e) => handleScholarshipChange('scholarship_amount', e.target.value)}
                >
                  <MenuItem value={0}>Not Applicable</MenuItem>
                  <MenuItem value={25}>25%</MenuItem>
                  <MenuItem value={50}>50%</MenuItem>
                  <MenuItem value={100}>100%</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Lead Details</Typography>
            {Object.entries(lead).map(([key, value]) => (
              <Typography key={key}>
                <strong>{key}:</strong> {String(value)}
              </Typography>
            ))}
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <EntranceCalls leadId={lead.id} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default LeadDetail;
