import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

const SocialAuthCallback = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfile } = useAuth();
  
  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        // Get token and userId from URL params
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userId = params.get('userId');
        const error = params.get('error');
        
        if (error) {
          setError(error);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        if (!token || !userId) {
          setError('Invalid authentication response');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Fetch user profile
        await getProfile();
        
        // Redirect to dashboard
        navigate('/');
      } catch (error) {
        console.error('Social login error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    handleSocialLogin();
  }, [location, navigate, getProfile]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f9fff9'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
          borderTop: '4px solid #4CAF50'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom color="primary.dark" fontWeight="bold">
          {error ? 'Authentication Error' : 'Completing Login'}
        </Typography>
        
        {error ? (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <>
            <CircularProgress color="primary" sx={{ my: 4 }} />
            <Typography variant="body1" align="center">
              Please wait while we complete your login...
            </Typography>
          </>
        )}
        
        {error && (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Redirecting to login page...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default SocialAuthCallback;
