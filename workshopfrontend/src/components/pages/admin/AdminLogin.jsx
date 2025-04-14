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
import ShieldIcon from '@mui/icons-material/Shield';

export default function AdminLogin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/admin/login', {
        adminUserId: userId,
        adminPassword: password,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data || 'Failed to login. Please check your credentials.');
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
        background: 'linear-gradient(to bottom right,rgb(255, 255, 255),rgb(255, 255, 255))',
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <ShieldIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Admin Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="userId"
              label="User ID"
              name="userId"
              autoComplete="username"
              autoFocus
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
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
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Grid container justifyContent="center">
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
