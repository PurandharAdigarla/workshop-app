import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Autocomplete,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';

function AddAttendeeDialog({ open, onClose, workshopId, onAttendeeAdded }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhoneNumber: '',
    attendeePassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [allAttendees, setAllAttendees] = useState([]);
  const [fetchingAttendees, setFetchingAttendees] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [selectedExistingAttendee, setSelectedExistingAttendee] = useState(null);
  const [existingAttendeeError, setExistingAttendeeError] = useState('');

  useEffect(() => {
    if (open && tabIndex === 1) {
      fetchAllAttendees();
    }
  }, [open, tabIndex]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAttendees(allAttendees);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = allAttendees.filter(attendee => 
      attendee.attendeeName.toLowerCase().includes(lowercaseQuery) ||
      attendee.attendeeEmail.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredAttendees(filtered);
  }, [searchQuery, allAttendees]);

  const fetchAllAttendees = async () => {
    setFetchingAttendees(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:8080/attendees',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        setAllAttendees(response.data);
        setFilteredAttendees(response.data);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError('Failed to fetch attendees. Please try again.');
    } finally {
      setFetchingAttendees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setSuccess(false);
    setExistingAttendeeError('');
  };

  const validateForm = () => {
    if (!formData.attendeeName.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.attendeeEmail.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.attendeePhoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (!formData.attendeePassword.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (formData.attendeePassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmitNew = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      
      //Create the attendee account
      const signupResponse = await axios.post(
        'http://localhost:8080/attendees/signup',
        formData
      );
      
      if (signupResponse.status !== 200) {
        throw new Error('Failed to create attendee account');
      }
      
      console.log("Signup successful:", signupResponse.data);
      
      //Attempt to login with the new credentials to get the attendee ID
      try {
        const loginResponse = await axios.post(
          'http://localhost:8080/attendees/login',
          {
            attendeeEmail: formData.attendeeEmail,
            attendeePassword: formData.attendeePassword
          }
        );
        
        if (loginResponse.data && loginResponse.data.attendeeId) {
          console.log("Login successful, got attendee ID:", loginResponse.data.attendeeId);
          
          //Register the attendee to the workshop
          await registerAttendeeToWorkshop(loginResponse.data.attendeeId, token);
          
          setSuccess(true);
          
          setFormData({
            attendeeName: '',
            attendeeEmail: '',
            attendeePhoneNumber: '',
            attendeePassword: ''
          });
          
          if (onAttendeeAdded) {
            onAttendeeAdded();
          }
          
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 1500);
          
          return; 
        }
      } catch (loginErr) {
        console.warn("Couldn't login with new credentials:", loginErr);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const attendeesResponse = await axios.get(
        'http://localhost:8080/attendees',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("All attendees:", attendeesResponse.data);
      console.log("Looking for email:", formData.attendeeEmail);
      
      const attendeeEmail = formData.attendeeEmail.toLowerCase().trim();
      const attendee = attendeesResponse.data.find(a => {
        console.log("Comparing", a.attendeeEmail?.toLowerCase().trim(), "with", attendeeEmail);
        return a.attendeeEmail && a.attendeeEmail.toLowerCase().trim() === attendeeEmail;
      });
      
      if (!attendee) {
        console.error("Could not find attendee with email:", attendeeEmail);
        console.error("Available attendees:", attendeesResponse.data.map(a => a.attendeeEmail));
        throw new Error('Could not find newly created attendee by email');
      }
      
      if (!attendee.attendeeId) {
        console.error("Found attendee but missing ID:", attendee);
        throw new Error('Found attendee but missing ID');
      }
      
      console.log("Found attendee:", attendee);
      
      await registerAttendeeToWorkshop(attendee.attendeeId, token);
      
      setSuccess(true);
      
      setFormData({
        attendeeName: '',
        attendeeEmail: '',
        attendeePhoneNumber: '',
        attendeePassword: ''
      });
      
      if (onAttendeeAdded) {
        onAttendeeAdded();
      }
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error adding attendee:', err);
      setError(err.response?.data || 'Failed to add attendee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExisting = async () => {
    if (!selectedExistingAttendee) {
      setExistingAttendeeError('Please select an attendee to add');
      return;
    }
    
    setLoading(true);
    setExistingAttendeeError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      
      await registerAttendeeToWorkshop(selectedExistingAttendee.attendeeId, token);
      
      setSuccess(true);
      setSelectedExistingAttendee(null);
      setSearchQuery('');
      
      if (onAttendeeAdded) {
        onAttendeeAdded();
      }
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error adding existing attendee:', err);
      if (err.response?.data?.includes('already registered')) {
        setExistingAttendeeError('This attendee is already registered for this workshop');
      } else {
        setExistingAttendeeError(err.response?.data || 'Failed to add attendee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const registerAttendeeToWorkshop = async (attendeeId, token) => {
    const registrationResponse = await axios.post(
      'http://localhost:8080/workshop/register',
      {
        attendeeId: attendeeId,
        workshopId: workshopId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (registrationResponse.status !== 200) {
      throw new Error('Failed to register attendee to workshop');
    }
    
    return registrationResponse;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Attendee to Workshop</DialogTitle>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Add New Attendee" />
        <Tab label="Add Existing Attendee" />
      </Tabs>
      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Attendee successfully added to workshop!
          </Alert>
        )}
        
        {/* New Attendee Form */}
        {tabIndex === 0 && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              This will create a new attendee account and register them for this workshop.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="attendeeName"
                  label="Full Name"
                  fullWidth
                  required
                  value={formData.attendeeName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="attendeeEmail"
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={formData.attendeeEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="attendeePhoneNumber"
                  label="Phone Number"
                  fullWidth
                  required
                  value={formData.attendeePhoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="attendeePassword"
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={formData.attendeePassword}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Minimum 6 characters"
                />
              </Grid>
            </Grid>
          </>
        )}
        
        {/* Existing Attendee Form */}
        {tabIndex === 1 && (
          <>
            {existingAttendeeError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {existingAttendeeError}
              </Alert>
            )}
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Search for an existing attendee to add to this workshop.
            </Typography>
            
            <TextField
              fullWidth
              label="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={fetchingAttendees || loading}
              sx={{ mb: 2 }}
            />
            
            {fetchingAttendees ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : filteredAttendees.length === 0 ? (
              <Typography>No attendees found matching your search.</Typography>
            ) : (
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {filteredAttendees.map((attendee, index) => (
                    <React.Fragment key={attendee.attendeeId}>
                      <ListItem 
                        button
                        selected={selectedExistingAttendee?.attendeeId === attendee.attendeeId}
                        onClick={() => setSelectedExistingAttendee(attendee)}
                      >
                        <ListItemText
                          primary={attendee.attendeeName}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Email: {attendee.attendeeEmail}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Phone: {attendee.attendeePhoneNumber || 'No phone number'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < filteredAttendees.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
            
            {selectedExistingAttendee && (
              <Box mt={2} p={2} bgcolor="rgba(0, 0, 0, 0.04)" borderRadius={1}>
                <Typography variant="subtitle2">Selected Attendee:</Typography>
                <Typography variant="body1">{selectedExistingAttendee.attendeeName}</Typography>
                <Typography variant="body2">{selectedExistingAttendee.attendeeEmail}</Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {tabIndex === 0 ? (
          <Button 
            onClick={handleSubmitNew} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add New Attendee'}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitExisting} 
            variant="contained" 
            color="primary"
            disabled={loading || !selectedExistingAttendee}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Selected Attendee'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AddAttendeeDialog; 