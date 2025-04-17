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
      
      // Try to create the attendee account
      try {
        const signupResponse = await axios.post(
          'http://localhost:8080/attendees/signup',
          formData
        );
        
        console.log("Signup successful:", signupResponse.data);
      } catch (signupErr) {
        // If the error is 409 (Conflict), the attendee already exists
        if (signupErr.response?.status !== 409) {
          console.error("Signup error:", signupErr);
          throw new Error(typeof signupErr.response?.data === 'string' 
            ? signupErr.response.data 
            : 'Failed to create attendee account');
        }
        console.log("Attendee already exists, continuing with login attempt");
      }
      
      // Attempt to login with the credentials to get the attendee ID
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
          
          // Register the attendee to the workshop
          await registerAttendeeToWorkshop(loginResponse.data.attendeeId, token);
          
          handleSuccess();
          return; 
        }
      } catch (loginErr) {
        console.warn("Couldn't login with credentials:", loginErr);
      }
      
      // If login fails or attendeeId is missing, try to find the attendee by email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const attendeesResponse = await axios.get(
        'http://localhost:8080/attendees',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const attendeeEmail = formData.attendeeEmail.toLowerCase().trim();
      const attendee = attendeesResponse.data.find(a => 
        a.attendeeEmail && a.attendeeEmail.toLowerCase().trim() === attendeeEmail
      );
      
      if (!attendee) {
        throw new Error('Could not find attendee by email');
      }
      
      if (!attendee.attendeeId) {
        throw new Error('Found attendee but missing ID');
      }
      
      // Register the attendee to the workshop
      await registerAttendeeToWorkshop(attendee.attendeeId, token);
      
      handleSuccess();
    } catch (err) {
      console.error('Error adding attendee:', err);
      setError(typeof err.message === 'string' ? err.message : 'Failed to add attendee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle successful registration
  const handleSuccess = () => {
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
      
      // Check if it's a conflict error (attendee already registered)
      if (err.response && err.response.status === 409) {
        setExistingAttendeeError('This attendee is already registered for this workshop');
      } else {
        // Safely extract error message
        let errorMessage = 'Failed to add attendee. Please try again.';
        
        if (err.response) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data && typeof err.response.data.message === 'string') {
            errorMessage = err.response.data.message;
          }
        }
          
        setExistingAttendeeError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerAttendeeToWorkshop = async (attendeeId, token) => {
    try {
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
      
      return registrationResponse;
    } catch (error) {
      // If conflict (already registered), don't treat as error since the goal is achieved
      if (error.response && error.response.status === 409) {
        console.log("Attendee already registered for this workshop");
        return { status: 200, data: "Already registered" };
      }
      throw error;
    }
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
                        component="div"
                        selected={selectedExistingAttendee?.attendeeId === attendee.attendeeId}
                        onClick={() => setSelectedExistingAttendee(attendee)}
                        sx={{ cursor: 'pointer' }}
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
              <Box mt={2} p={2} bgcolor="rgba(182, 244, 181, 0.55)" borderRadius={1}>
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