import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workshopApi } from '../../../utils/api';
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
  CircularProgress,
  Snackbar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function AttendeeSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation - trim to prevent whitespace-only inputs
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation - trim to prevent whitespace-only inputs
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Phone validation - trim to prevent whitespace-only inputs and ensure exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Password validation - no trimming for security fields
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone field, only allow digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: digitsOnly
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear specific field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle form submission - trims all text input values before sending to backend
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormError('');

    try {
      // Trim all input values before submission
      const trimmedData = {
        attendeeName: formData.name.trim(),
        attendeeEmail: formData.email.trim(),
        attendeePhoneNumber: formData.phone.trim(),
        attendeePassword: formData.password // Don't trim password - spaces could be intentional
      };
      
      // Submit signup data with trimmed values
      const response = await workshopApi.signupAttendee(trimmedData);
      
      setSuccess(true);
      
      // Auto login after successful signup - use trimmed values
      try {
        const loginResponse = await workshopApi.loginAttendee({
          attendeeEmail: trimmedData.attendeeEmail,
          attendeePassword: formData.password
        });
        
        if (loginResponse.data.accessToken) {
          localStorage.setItem('accessToken', loginResponse.data.accessToken);
          localStorage.setItem('attendeeId', loginResponse.data.attendeeId);
          
          // Give time for success message to be seen
          setTimeout(() => {
            navigate('/attendee/dashboard');
          }, 1500);
        }
      } catch (loginErr) {
        console.error('Auto login failed:', loginErr);
        // If auto-login fails, redirect to login page after showing success
        setTimeout(() => {
          navigate('/attendee/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.status === 409) {
        setFormError('Email or phone number already in use');
      } else {
        setFormError(err.userMessage || err.response?.data || 'Failed to register. Please try again.');
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
        background: 'linear-gradient(to bottom right, rgb(255, 255, 255), rgb(253, 254, 253))',
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
          
          {formError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              inputProps={{ 
                maxLength: 10,
                inputMode: 'numeric' 
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
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
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            
            <Grid container justifyContent="center">
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
      
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        message="Account created successfully!"
      />
    </Box>
  );
} 