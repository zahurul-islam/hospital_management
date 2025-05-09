import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import { doctorService } from '../../services/api';
import { LocalHospital, School, Badge, AttachMoney, Description } from '@mui/icons-material';

const CreateDoctorProfile = () => {
  const { user, getProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    specialty: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    bio: ''
  });

  useEffect(() => {
    // If user is not a doctor, redirect to home
    if (user && user.role !== 'doctor') {
      navigate('/');
    }
    
    // If user already has a doctor profile, redirect to dashboard
    if (user && user.profile && user.profile.specialty) {
      navigate('/doctor/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.specialty || !formData.qualification || !formData.licenseNumber) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create doctor profile
      const response = await doctorService.createDoctorProfile({
        userId: user.id,
        specialty: formData.specialty,
        qualification: formData.qualification,
        experience: formData.experience ? parseInt(formData.experience) : null,
        licenseNumber: formData.licenseNumber,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        bio: formData.bio
      });

      setSuccess('Doctor profile created successfully!');
      
      // Refresh user profile
      await getProfile();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      setError(error.response?.data?.message || 'Failed to create doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Medicine',
    'Neurology',
    'Obstetrics & Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Urology'
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f9fff9',
        py: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 800,
          width: '100%',
          borderRadius: 2,
          borderTop: '4px solid #4CAF50'
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Complete Your Doctor Profile
        </Typography>

        <Chip 
          label="Required to access doctor dashboard" 
          color="primary" 
          variant="outlined" 
          sx={{ mb: 3 }} 
        />

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="specialty-label">Specialty</InputLabel>
                <Select
                  labelId="specialty-label"
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  label="Specialty *"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocalHospital />
                    </InputAdornment>
                  }
                >
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  ),
                }}
                helperText="e.g., MBBS, MD, MS"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="licenseNumber"
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge />
                    </InputAdornment>
                  ),
                }}
                helperText="Your medical license number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="experience"
                label="Experience (years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="consultationFee"
                label="Consultation Fee"
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="bio"
                label="Professional Bio"
                name="bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
                helperText="Tell patients about your professional background and expertise"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Submit" />
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Complete Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateDoctorProfile;
