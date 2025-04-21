import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Avatar,
  Grid,
  Link as MuiLink,
  CircularProgress,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { workshopApi } from '../../../utils/api';
import { decodeToken, isAuthenticated } from '../../../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const token = localStorage.getItem('accessToken');
      const decodedToken = decodeToken(token);
      const userRole = decodedToken?.role;
      
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'ATTENDEE') {
        navigate('/attendee/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    let isLoggedIn = false;
    
    // Try attendee login
    try {
      const response = await workshopApi.loginAttendee({
        attendeeEmail: email.trim(),
        attendeePassword: password
      });
      
      if (response?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('attendeeId', response.data.attendeeId);
        
        isLoggedIn = true;
        navigate('/attendee/dashboard');
      }
    } catch (attendeeError) {
      console.log('Attendee login failed, trying admin login');
      // Continue to admin login
    }
    
    // Only try admin login if attendee login failed
    if (!isLoggedIn) {
      try {
        const response = await workshopApi.loginAdmin({
          adminUserId: email.trim(),
          adminPassword: password
        });
        
        if (response?.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('adminId', response.data.adminId);
          
          isLoggedIn = true;
          navigate('/admin/dashboard');
        }
      } catch (adminError) {
        console.log('Admin login failed');
        // Both login attempts failed
        isLoggedIn = false;
      }
    }
    
    // If we get here and not logged in, show error
    if (!isLoggedIn) {
      setError('Incorrect credentials. Please check your email/ID and password.');
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{  
          p: 4, 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address / Admin ID"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink component={Link} to="/attendee/signup" variant="body2">
                Don't have an account? Sign Up
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
} 