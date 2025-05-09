import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService, appointmentService, telemedicineService, medicalRecordService } from '../../services/api';
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
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  VideoCall,
  Check,
  Cancel,
  Visibility,
  NoteAdd
} from '@mui/icons-material';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user.profile?.id) {
          throw new Error('Doctor profile not found');
        }

        const response = await doctorService.getDoctorAppointments(user.profile.id);
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
    const todayStr = today.toISOString().split('T')[0];

    switch (tabIndex) {
      case 0: // All
        setFilteredAppointments(appointments);
        break;
      case 1: // Today
        setFilteredAppointments(
          appointments.filter(appointment => {
            return appointment.date === todayStr && appointment.status !== 'cancelled';
          })
        );
        break;
      case 2: // Upcoming
        setFilteredAppointments(
          appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate > today && appointment.status !== 'cancelled';
          })
        );
        break;
      case 3: // Completed
        setFilteredAppointments(
          appointments.filter(appointment => appointment.status === 'completed')
        );
        break;
      case 4: // Cancelled
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

  const handleCompleteDialogOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes('');
    setDiagnosis('');
    setPrescriptions('');
    setCompleteDialogOpen(true);
  };

  const handleCompleteDialogClose = () => {
    setCompleteDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelDialogOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleNotesDialogOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setNotesDialogOpen(true);
  };

  const handleNotesDialogClose = () => {
    setNotesDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCompleteAppointment = async () => {
    try {
      setLoading(true);

      // Update appointment status
      await appointmentService.updateAppointment(selectedAppointment.id, {
        status: 'completed',
        notes: notes
      });

      // Create medical record
      await createMedicalRecord();

      // Update local state
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, status: 'completed', notes: notes };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      filterAppointments(updatedAppointments, tabValue);

      handleCompleteDialogClose();
    } catch (error) {
      console.error('Error completing appointment:', error);
      setError('Failed to complete appointment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createMedicalRecord = async () => {
    try {
      const medicalRecordData = {
        patientId: selectedAppointment.appointmentPatient.id,
        doctorId: user.profile.id,
        appointmentId: selectedAppointment.id,
        diagnosis: diagnosis,
        prescriptions: prescriptions,
        notes: notes
      };

      await medicalRecordService.createMedicalRecord(medicalRecordData);
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
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

  const handleSaveNotes = async () => {
    try {
      setLoading(true);

      await appointmentService.updateAppointment(selectedAppointment.id, {
        notes: notes
      });

      // Update local state
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, notes: notes };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      filterAppointments(updatedAppointments, tabValue);

      handleNotesDialogClose();
    } catch (error) {
      console.error('Error saving notes:', error);
      setError('Failed to save notes. Please try again later.');
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
      <Typography variant="h4" gutterBottom>
        Appointments
      </Typography>

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
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Patient</TableCell>
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
                const isScheduled = appointment.status === 'scheduled';
                const canComplete = isScheduled;
                const canCancel = isScheduled && !isPast;
                const canAddNotes = isScheduled || appointment.status === 'completed';
                const canStartCall = appointment.type === 'video' &&
                                    isScheduled &&
                                    appointment.telemedicineSession?.hostUrl;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>
                      {appointment.appointmentPatient.patientUser.name}
                      <Typography variant="body2" color="text.secondary">
                        {appointment.appointmentPatient.patientUser.email}
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

                        {canStartCall && (
                          <IconButton
                            component={Link}
                            to={`/video-call/${appointment.telemedicineSession.id}`}
                            color="success"
                            size="small"
                            title="Start Video Call"
                          >
                            <VideoCall />
                          </IconButton>
                        )}

                        {canComplete && (
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleCompleteDialogOpen(appointment)}
                            title="Complete Appointment"
                          >
                            <Check />
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

                        {canAddNotes && (
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleNotesDialogOpen(appointment)}
                            title="Add Notes"
                          >
                            <NoteAdd />
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

      {/* Complete Appointment Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={handleCompleteDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Complete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the appointment details to complete it.
          </DialogContentText>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                multiline
                rows={3}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prescriptions"
                multiline
                rows={4}
                value={prescriptions}
                onChange={(e) => setPrescriptions(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCompleteAppointment} color="success" disabled={loading}>
            Complete Appointment
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Add Notes Dialog */}
      <Dialog
        open={notesDialogOpen}
        onClose={handleNotesDialogClose}
      >
        <DialogTitle>Add Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotesDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveNotes} color="primary" disabled={loading}>
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorAppointments;
