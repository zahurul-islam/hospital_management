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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PersonAdd,
  Google as GoogleIcon,
  Apple as AppleIcon,
  Facebook as FacebookIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    // Doctor specific fields
    specialty: '',
    qualification: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate doctor-specific fields
    if (formData.role === 'doctor') {
      if (!formData.specialty) {
        setError('Please enter your specialty');
        return;
      }
      if (!formData.qualification) {
        setError('Please enter your qualification');
        return;
      }
      if (!formData.licenseNumber) {
        setError('Please enter your license number');
        return;
      }
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;

      const user = await register(userData);

      // Redirect based on user role
      if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleRegister = () => {
    // For development/demo purposes
    setError('To use Google registration, you need to configure a valid Google OAuth client ID and secret in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${formData.role}`;
  };

  const handleAppleRegister = () => {
    // For development/demo purposes
    setError('To use Apple registration, you need to configure a valid Apple OAuth credentials in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple?role=${formData.role}`;
  };

  const handleFacebookRegister = () => {
    // For development/demo purposes
    setError('To use Facebook registration, you need to configure a valid Facebook App ID and secret in the backend .env file.');

    // Uncomment this when OAuth is properly configured
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook?role=${formData.role}`;
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
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
              Create your account
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
                  onClick={handleGoogleRegister}
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
                  {isMobile ? <GoogleIcon /> : 'Sign up with Google'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AppleIcon />}
                  onClick={handleAppleRegister}
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
                  {isMobile ? <AppleIcon /> : 'Sign up with Apple'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={handleFacebookRegister}
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
                  {isMobile ? <FacebookIcon /> : 'Sign up with Facebook'}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                  </Select>
                  <FormHelperText>Select your role in the system</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  autoComplete="address"
                  value={formData.address}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Doctor-specific fields */}
              {formData.role === 'doctor' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
                      Doctor Information (Required)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="specialty"
                      label="Specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      variant="outlined"
                      helperText="e.g., Cardiology, Neurology, Pediatrics"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="qualification"
                      label="Qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      variant="outlined"
                      helperText="e.g., MBBS, MD, MS"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="licenseNumber"
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      variant="outlined"
                      helperText="Your medical license number"
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 3,
                py: 1.5,
                background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
              }}
              disabled={loading}
              startIcon={<PersonAdd />}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
