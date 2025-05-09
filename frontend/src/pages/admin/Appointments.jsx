import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Delete,
  Visibility,
  VideoCall
} from '@mui/icons-material';

const AdminAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await appointmentService.getAllAppointments();
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
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      filterAppointments(appointments, tabValue);
    } else {
      const filtered = appointments.filter(appointment => {
        const status = tabValue === 0 ? true : 
                      tabValue === 1 ? appointment.status === 'scheduled' : 
                      tabValue === 2 ? appointment.status === 'completed' : 
                      appointment.status === 'cancelled';
        
        const patientName = appointment.appointmentPatient?.patientUser?.name.toLowerCase() || '';
        const doctorName = appointment.appointmentDoctor?.doctorUser?.name.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return status && (patientName.includes(search) || doctorName.includes(search));
      });
      
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments, tabValue]);

  const filterAppointments = (appointments, tabIndex) => {
    switch (tabIndex) {
      case 0: // All
        setFilteredAppointments(appointments);
        break;
      case 1: // Scheduled
        setFilteredAppointments(appointments.filter(appointment => appointment.status === 'scheduled'));
        break;
      case 2: // Completed
        setFilteredAppointments(appointments.filter(appointment => appointment.status === 'completed'));
        break;
      case 3: // Cancelled
        setFilteredAppointments(appointments.filter(appointment => appointment.status === 'cancelled'));
        break;
      default:
        setFilteredAppointments(appointments);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterAppointments(appointments, newValue);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDialogOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = async () => {
    try {
      setLoading(true);
      
      await appointmentService.deleteAppointment(selectedAppointment.id);
      
      // Update local state
      const updatedAppointments = appointments.filter(a => a.id !== selectedAppointment.id);
      setAppointments(updatedAppointments);
      filterAppointments(updatedAppointments, tabValue);
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment. Please try again later.');
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
        Appointments Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <TextField
            placeholder="Search by patient or doctor name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mr: 2 }}
          />
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All" />
          <Tab label="Scheduled" />
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
              <TableCell>Doctor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const formattedDate = appointmentDate.toLocaleDateString();
                const formattedTime = appointment.time.substring(0, 5);
                const canJoinCall = appointment.type === 'video' && 
                                   appointment.status === 'scheduled' && 
                                   appointment.telemedicineSession?.joinUrl;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>
                      {appointment.appointmentPatient?.patientUser?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      Dr. {appointment.appointmentDoctor?.doctorUser?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.type === 'video' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VideoCall fontSize="small" sx={{ mr: 0.5 }} />
                          Video Call
                        </Box>
                      ) : (
                        'In-Person'
                      )}
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
                        
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDialogOpen(appointment)}
                          title="Delete Appointment"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Appointment Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAppointment} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAppointments;
