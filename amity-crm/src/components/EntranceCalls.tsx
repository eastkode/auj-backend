import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider
} from '@mui/material';

interface EntranceCall {
  id: number;
  note: string;
  status: string;
  call_time: string;
  called_by: number;
}

interface Props {
  leadId: number;
}

const EntranceCalls: React.FC<Props> = ({ leadId }) => {
  const [calls, setCalls] = useState<EntranceCall[]>([]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('interested');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalls = async () => {
    try {
      const response = await axios.get(`/api/leads/${leadId}/calls`);
      setCalls(response.data);
    } catch (error) {
      console.error('Failed to fetch entrance calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/leads/${leadId}/calls`, { note, status });
      setNote(''); // Clear form
      fetchCalls(); // Refresh list
    } catch (error) {
      console.error('Failed to add entrance call:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Add New Call Remark</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Call Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="interested">Interested</MenuItem>
            <MenuItem value="not_coming">Not Coming</MenuItem>
            <MenuItem value="coming">Coming</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">Save Remark</Button>
      </Box>

      <Typography variant="h6" gutterBottom>Call History</Typography>
      {isLoading ? <Typography>Loading history...</Typography> : (
        <List>
          {calls.map((call, index) => (
            <React.Fragment key={call.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={call.note}
                  secondary={`Status: ${call.status} | Called at: ${new Date(call.call_time).toLocaleString()}`}
                />
              </ListItem>
              {index < calls.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default EntranceCalls;
