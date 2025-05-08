import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService, appointmentService } from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import { VideoCall, Person } from '@mui/icons-material';

const steps = ['Select Doctor', 'Choose Date & Time', 'Confirm Details'];

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await doctorService.getAllDoctors();
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && !selectedDoctor) {
      setError('Please select a doctor to continue');
      return;
    }

    if (activeStep === 1) {
      if (!appointmentDate) {
        setError('Please select a date');
        return;
      }
      if (!appointmentTime) {
        setError('Please select a time');
        return;
      }
    }

    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentType(doctor.isAvailableForVideoCall ? appointmentType : 'in-person');
    
    // Reset date and time when doctor changes
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setAppointmentDate(date);
    setAppointmentTime('');
    
    try {
      setLoading(true);
      
      // In a real app, we would fetch available times from the backend
      // For now, we'll generate some mock available times
      const mockTimes = generateMockAvailableTimes(date);
      setAvailableTimes(mockTimes);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setError('Failed to load available times. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAvailableTimes = (date) => {
    // This is a mock function to generate available times
    // In a real app, this would come from the backend
    const times = [];
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If selected date is today, only show times after current time
    const startHour = selectedDate.toDateString() === today.toDateString() 
      ? new Date().getHours() + 1 
      : 9;
    
    for (let hour = startHour; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return times;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user.profile?.id) {
        throw new Error('Patient profile not found');
      }

      const appointmentData = {
        patientId: user.profile.id,
        doctorId: selectedDoctor.id,
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        reason: reason,
        duration: 30 // Default duration in minutes
      };

      await appointmentService.createAppointment(appointmentData);
      
      // Navigate to appointments page after successful booking
      navigate('/patient/appointments', { 
        state: { success: true, message: 'Appointment booked successfully!' } 
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again later.');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Doctor
            </Typography>
            
            <Grid container spacing={3}>
              {doctors.map((doctor) => (
                <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                  <Card 
                    elevation={selectedDoctor?.id === doctor.id ? 8 : 1}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedDoctor?.id === doctor.id ? '2px solid #1976d2' : 'none',
                      height: '100%'
                    }}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <Person />
                        </Avatar>
                        <Typography variant="h6">
                          Dr. {doctor.user.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {doctor.specialty}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Experience:</strong> {doctor.experience} years
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Consultation Fee:</strong> ${doctor.consultationFee}
                      </Typography>
                      
                      {doctor.isAvailableForVideoCall && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <VideoCall color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="primary">
                            Available for Video Consultation
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Date & Time
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    id="appointment-date"
                    label="Appointment Date"
                    type="date"
                    value={appointmentDate}
                    onChange={handleDateChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!appointmentDate}>
                  <InputLabel id="time-label">Appointment Time</InputLabel>
                  <Select
                    labelId="time-label"
                    id="appointment-time"
                    value={appointmentTime}
                    label="Appointment Time"
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  >
                    {availableTimes.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                  {!appointmentDate && (
                    <FormHelperText>Please select a date first</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    Appointment Type
                  </Typography>
                  <RadioGroup
                    row
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <FormControlLabel 
                      value="in-person" 
                      control={<Radio />} 
                      label="In-Person Visit" 
                    />
                    <FormControlLabel 
                      value="video" 
                      control={<Radio />} 
                      label="Video Call" 
                      disabled={!selectedDoctor?.isAvailableForVideoCall}
                    />
                  </RadioGroup>
                  {!selectedDoctor?.isAvailableForVideoCall && (
                    <FormHelperText>This doctor is not available for video consultations</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="reason"
                  label="Reason for Visit"
                  multiline
                  rows={4}
                  fullWidth
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Appointment Details
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Doctor</Typography>
                  <Typography variant="body1">Dr. {selectedDoctor?.user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedDoctor?.specialty}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Patient</Typography>
                  <Typography variant="body1">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Date & Time</Typography>
                  <Typography variant="body1">
                    {new Date(appointmentDate).toLocaleDateString()} at {appointmentTime}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Appointment Type</Typography>
                  <Typography variant="body1">
                    {appointmentType === 'video' ? 'Video Call' : 'In-Person Visit'}
                  </Typography>
                </Grid>
                
                {reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Reason for Visit</Typography>
                    <Typography variant="body1">{reason}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Alert severity="info">
              By confirming this appointment, you agree to the hospital's appointment policies.
              {appointmentType === 'video' && ' For video consultations, please ensure you have a stable internet connection and a device with a camera and microphone.'}
            </Alert>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading && doctors.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book an Appointment
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BookAppointment;
