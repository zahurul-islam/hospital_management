import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Login as LoginIcon,
  Google as GoogleIcon,
  Apple as AppleIcon,
  Facebook as FacebookIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const user = await login(email, password);

      // Redirect based on user role
      if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    // For development/demo purposes
    setError('To use Google login, you need to configure a valid Google OAuth client ID and secret in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=patient`;
  };

  const handleAppleLogin = () => {
    // For development/demo purposes
    setError('To use Apple login, you need to configure a valid Apple OAuth credentials in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple?role=patient`;
  };

  const handleFacebookLogin = () => {
    // For development/demo purposes
    setError('To use Facebook login, you need to configure a valid Facebook App ID and secret in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook?role=patient`;
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HospitalIcon sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Green University Hospital
              </Typography>
            </Box>
            <Typography component="h2" variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{
                    py: 1.2,
                    borderColor: '#DB4437',
                    color: '#DB4437',
                    '&:hover': {
                      borderColor: '#DB4437',
                      backgroundColor: 'rgba(219, 68, 55, 0.04)'
                    }
                  }}
                >
                  {isMobile ? <GoogleIcon /> : 'Google'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AppleIcon />}
                  onClick={handleAppleLogin}
                  sx={{
                    py: 1.2,
                    borderColor: '#000000',
                    color: '#000000',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {isMobile ? <AppleIcon /> : 'Apple'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={handleFacebookLogin}
                  sx={{
                    py: 1.2,
                    borderColor: '#4267B2',
                    color: '#4267B2',
                    '&:hover': {
                      borderColor: '#4267B2',
                      backgroundColor: 'rgba(66, 103, 178, 0.04)'
                    }
                  }}
                >
                  {isMobile ? <FacebookIcon /> : 'Facebook'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
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
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
              }}
              disabled={loading}
              startIcon={<LoginIcon />}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Don't have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
