import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { VideoCall, ArrowBack } from '@mui/icons-material';

const AppointmentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await appointmentService.getAppointmentById(id);
        setAppointment(response.data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!appointment) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Appointment not found
      </Alert>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointment.time.substring(0, 5);
  
  const canJoinCall = appointment.type === 'video' && 
                      appointment.status === 'scheduled' && 
                      appointment.telemedicineSession?.joinUrl;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button 
          component={Link} 
          to={user.role === 'patient' ? '/patient/appointments' : '/doctor/appointments'} 
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Appointment Details
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Appointment ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {appointment.id}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={appointment.status} 
              color={getStatusChipColor(appointment.status)} 
              sx={{ mt: 0.5 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Patient
            </Typography>
            <Typography variant="body1" gutterBottom>
              {appointment.patient.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {appointment.patient.user.email}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Doctor
            </Typography>
            <Typography variant="body1" gutterBottom>
              Dr. {appointment.doctor.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {appointment.doctor.specialty}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Date & Time
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formattedDate} at {formattedTime}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Appointment Type
            </Typography>
            <Typography variant="body1" gutterBottom>
              {appointment.type === 'video' ? 'Video Call' : 'In-Person Visit'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Duration: {appointment.duration} minutes
            </Typography>
          </Grid>
          
          {appointment.reason && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary">
                Reason for Visit
              </Typography>
              <Typography variant="body1" paragraph>
                {appointment.reason}
              </Typography>
            </Grid>
          )}
          
          {appointment.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1" paragraph>
                {appointment.notes}
              </Typography>
            </Grid>
          )}
          
          {canJoinCall && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/video-call/${appointment.telemedicineSession.id}`}
                  startIcon={<VideoCall />}
                >
                  Join Video Call
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AppointmentDetails;
