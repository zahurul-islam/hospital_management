import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService, appointmentService } from '../../services/api';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  VideoCall,
  Cancel,
  Visibility
} from '@mui/icons-material';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user.profile?.id) {
          throw new Error('Patient profile not found');
        }

        const response = await patientService.getPatientAppointments(user.profile.id);
        setAppointments(response.data);
        filterAppointments(response.data, tabValue);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const filterAppointments = (appointments, tabIndex) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (tabIndex) {
      case 0: // All
        setFilteredAppointments(appointments);
        break;
      case 1: // Upcoming
        setFilteredAppointments(
          appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= today && appointment.status !== 'cancelled';
          })
        );
        break;
      case 2: // Past
        setFilteredAppointments(
          appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate < today || appointment.status === 'completed';
          })
        );
        break;
      case 3: // Cancelled
        setFilteredAppointments(
          appointments.filter(appointment => appointment.status === 'cancelled')
        );
        break;
      default:
        setFilteredAppointments(appointments);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterAppointments(appointments, newValue);
  };

  const handleCancelDialogOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    try {
      setLoading(true);
      
      await appointmentService.updateAppointment(selectedAppointment.id, {
        status: 'cancelled'
      });
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, status: 'cancelled' };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      filterAppointments(updatedAppointments, tabValue);
      
      handleCancelDialogClose();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Appointments</Typography>
        <Button
          variant="contained"
          component={Link}
          to="/patient/book-appointment"
          startIcon={<Add />}
        >
          Book New Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const formattedDate = appointmentDate.toLocaleDateString();
                const formattedTime = appointment.time.substring(0, 5);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = appointmentDate < today;
                const canCancel = !isPast && appointment.status === 'scheduled';
                const canJoinCall = appointment.type === 'video' && 
                                   appointment.status === 'scheduled' && 
                                   appointment.telemedicineSession?.joinUrl;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>
                      Dr. {appointment.doctor.user.name}
                      <Typography variant="body2" color="text.secondary">
                        {appointment.doctor.specialty}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status} 
                        color={getStatusChipColor(appointment.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          component={Link} 
                          to={`/appointments/${appointment.id}`}
                          color="primary"
                          size="small"
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        
                        {canJoinCall && (
                          <IconButton
                            component={Link}
                            to={`/video-call/${appointment.telemedicineSession.id}`}
                            color="success"
                            size="small"
                            title="Join Video Call"
                          >
                            <VideoCall />
                          </IconButton>
                        )}
                        
                        {canCancel && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancelDialogOpen(appointment)}
                            title="Cancel Appointment"
                          >
                            <Cancel />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            No, Keep It
          </Button>
          <Button onClick={handleCancelAppointment} color="error" disabled={loading}>
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientAppointments;
