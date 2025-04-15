import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Avatar,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function AttendeeSignup() {
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhoneNumber: '',
    attendeePassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    
    if (formData.attendeePassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log("Sending signup request:", {
        attendeeName: formData.attendeeName,
        attendeeEmail: formData.attendeeEmail,
        attendeePhoneNumber: formData.attendeePhoneNumber
      });
      
      const signupResponse = await axios.post(
        'http://localhost:8080/attendees/signup',
        {
          attendeeName: formData.attendeeName,
          attendeeEmail: formData.attendeeEmail,
          attendeePhoneNumber: formData.attendeePhoneNumber,
          attendeePassword: formData.attendeePassword
        }
      );
      
      console.log("Signup response:", signupResponse);
      
      if (signupResponse.status === 200) {
        if (signupResponse.data === "Email already in use") {
          setError('This email is already registered. Please use a different email or login instead.');
          setLoading(false);
          return;
        }
        
        if (signupResponse.data === "Phone number already in use") {
          setError('This phone number is already registered. Please use a different phone number.');
          setLoading(false);
          return;
        }
        
        if (signupResponse.data !== "Attendee registered successfully") {
          setError(signupResponse.data || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }
        
        setSuccess(true);
        
        // Try to log in automatically
        try {
          const loginResponse = await axios.post('http://localhost:8080/attendees/login', {
            attendeeEmail: formData.attendeeEmail,
            attendeePassword: formData.attendeePassword,
          });
    
          if (loginResponse.data.accessToken) {
            localStorage.setItem('accessToken', loginResponse.data.accessToken);
            localStorage.setItem('attendeeId', loginResponse.data.attendeeId);
            setTimeout(() => {
              navigate('/attendee/dashboard');
            }, 1500);
          }
        } catch (loginErr) {
          console.error('Auto-login error:', loginErr);
          // Don't show error for this, just redirect to login page after delay
          setTimeout(() => {
            navigate('/attendee/login');
          }, 2000);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Display specific backend validation errors
      if (err.response) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError('Registration failed. Please check your information and try again.');
        }
      } else if (err.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(to bottom right,rgb(255, 255, 255),rgb(253, 254, 253))',
        padding: 2
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            maxWidth: 480
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Attendee Sign Up
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Registration successful! Redirecting you to dashboard...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="attendeeName"
              label="Full Name"
              name="attendeeName"
              autoComplete="name"
              autoFocus
              value={formData.attendeeName}
              onChange={handleChange}
              disabled={loading || success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="attendeeEmail"
              label="Email Address"
              name="attendeeEmail"
              autoComplete="email"
              value={formData.attendeeEmail}
              onChange={handleChange}
              disabled={loading || success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="attendeePhoneNumber"
              label="Phone Number"
              name="attendeePhoneNumber"
              autoComplete="tel"
              value={formData.attendeePhoneNumber}
              onChange={handleChange}
              disabled={loading || success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="attendeePassword"
              label="Password"
              type="password"
              id="attendeePassword"
              autoComplete="new-password"
              value={formData.attendeePassword}
              onChange={handleChange}
              disabled={loading || success}
              helperText="Minimum 6 characters"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || success}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            
            <Grid container justifyContent="space-between" spacing={1}>
              <Grid item>
                <Button 
                  onClick={() => navigate('/attendee/login')}
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Already have an account? Sign In
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 