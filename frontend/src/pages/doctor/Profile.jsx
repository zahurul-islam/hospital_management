import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, doctorService } from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';

const DoctorProfile = () => {
  const { user, getProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialty: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    availableDays: [],
    availableTimeStart: '',
    availableTimeEnd: '',
    isAvailableForVideoCall: true,
    bio: ''
  });

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

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // Get updated profile
        const updatedProfile = await getProfile();
        
        // Set form data
        setFormData({
          name: updatedProfile.name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          specialty: updatedProfile.profile?.specialty || '',
          qualification: updatedProfile.profile?.qualification || '',
          experience: updatedProfile.profile?.experience || '',
          licenseNumber: updatedProfile.profile?.licenseNumber || '',
          consultationFee: updatedProfile.profile?.consultationFee || '',
          availableDays: updatedProfile.profile?.availableDays || [],
          availableTimeStart: updatedProfile.profile?.availableTimeStart ? updatedProfile.profile.availableTimeStart.substring(0, 5) : '',
          availableTimeEnd: updatedProfile.profile?.availableTimeEnd ? updatedProfile.profile.availableTimeEnd.substring(0, 5) : '',
          isAvailableForVideoCall: updatedProfile.profile?.isAvailableForVideoCall !== false,
          bio: updatedProfile.profile?.bio || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [getProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDayToggle = (day) => {
    const currentDays = [...formData.availableDays];
    
    if (currentDays.includes(day)) {
      // Remove day
      const updatedDays = currentDays.filter(d => d !== day);
      setFormData({
        ...formData,
        availableDays: updatedDays
      });
    } else {
      // Add day
      const updatedDays = [...currentDays, day];
      setFormData({
        ...formData,
        availableDays: updatedDays
      });
    }
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      isAvailableForVideoCall: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Update user data
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      await userService.updateUser(user.id, userData);
      
      // Update doctor data
      const doctorData = {
        specialty: formData.specialty,
        qualification: formData.qualification,
        experience: formData.experience,
        licenseNumber: formData.licenseNumber,
        consultationFee: formData.consultationFee,
        availableDays: formData.availableDays,
        availableTimeStart: formData.availableTimeStart,
        availableTimeEnd: formData.availableTimeEnd,
        isAvailableForVideoCall: formData.isAvailableForVideoCall,
        bio: formData.bio
      };
      
      await doctorService.updateDoctor(user.profile.id, doctorData);
      
      // Show success message
      setSuccess(true);
      
      // Refresh profile
      await getProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Professional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              >
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                placeholder="e.g., MBBS, MD, MS"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee"
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="e.g., 100.00"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Available Days
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {days.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    color={formData.availableDays.includes(day) ? 'primary' : 'default'}
                    onClick={() => handleDayToggle(day)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Time Start"
                name="availableTimeStart"
                type="time"
                value={formData.availableTimeStart}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Time End"
                name="availableTimeEnd"
                type="time"
                value={formData.availableTimeEnd}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailableForVideoCall}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Available for Video Consultations"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Bio"
                name="bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a short professional bio that will be visible to patients"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Profile updated successfully"
      />
    </Box>
  );
};

export default DoctorProfile;
