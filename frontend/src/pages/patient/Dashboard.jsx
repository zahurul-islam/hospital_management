import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService, appointmentService } from '../../services/api';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  CalendarMonth, 
  VideoCall, 
  MedicalServices, 
  Add 
} from '@mui/icons-material';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get patient profile
        const patientResponse = await patientService.getPatientById(user.profile?.id);
        setPatientData(patientResponse.data);

        // Get patient appointments
        const appointmentsResponse = await patientService.getPatientAppointments(user.profile?.id);
        
        // Filter upcoming appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = appointmentsResponse.data
          .filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= today && appointment.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        
        setUpcomingAppointments(upcoming);

        // Get patient medical records
        const medicalRecordsResponse = await patientService.getPatientMedicalRecords(user.profile?.id);
        
        // Get recent medical records
        const recent = medicalRecordsResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setRecentMedicalRecords(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.profile) {
      fetchDashboardData();
    }
  }, [user]);

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    component={Link}
                    to="/patient/book-appointment"
                    startIcon={<Add />}
                  >
                    Book New Appointment
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/patient/appointments"
                    startIcon={<CalendarMonth />}
                  >
                    View All Appointments
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/patient/medical-records"
                    startIcon={<MedicalServices />}
                  >
                    View Medical Records
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingAppointments.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No upcoming appointments. Book a new appointment to get started.
                </Typography>
              ) : (
                <List>
                  {upcomingAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.date);
                    const formattedDate = appointmentDate.toLocaleDateString();
                    const formattedTime = appointment.time.substring(0, 5);
                    
                    return (
                      <Paper key={appointment.id} elevation={1} sx={{ mb: 2, p: 1 }}>
                        <ListItem
                          secondaryAction={
                            appointment.type === 'video' && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                component={Link}
                                to={`/video-call/${appointment.telemedicineSession?.id}`}
                                startIcon={<VideoCall />}
                                disabled={!appointment.telemedicineSession?.joinUrl}
                              >
                                Join Call
                              </Button>
                            )
                          }
                        >
                          <ListItemText
                            primary={`Dr. ${appointment.doctor.user.name} - ${appointment.doctor.specialty}`}
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {formattedDate} at {formattedTime} ({appointment.duration} mins)
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Type: {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Status: {appointment.status}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/patient/appointments"
                  color="primary"
                >
                  View All Appointments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Medical Records */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Medical Records
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recentMedicalRecords.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No medical records found.
                </Typography>
              ) : (
                <List>
                  {recentMedicalRecords.map((record) => {
                    const recordDate = new Date(record.createdAt);
                    const formattedDate = recordDate.toLocaleDateString();
                    
                    return (
                      <Paper key={record.id} elevation={1} sx={{ mb: 2, p: 1 }}>
                        <ListItem>
                          <ListItemText
                            primary={`Dr. ${record.doctor.user.name} - ${formattedDate}`}
                            secondary={
                              <>
                                {record.diagnosis && (
                                  <>
                                    <Typography component="span" variant="body2" fontWeight="bold">
                                      Diagnosis:
                                    </Typography>{' '}
                                    <Typography component="span" variant="body2">
                                      {record.diagnosis}
                                    </Typography>
                                    <br />
                                  </>
                                )}
                                {record.prescriptions && (
                                  <>
                                    <Typography component="span" variant="body2" fontWeight="bold">
                                      Prescriptions:
                                    </Typography>{' '}
                                    <Typography component="span" variant="body2">
                                      {record.prescriptions}
                                    </Typography>
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/patient/medical-records"
                  color="primary"
                >
                  View All Medical Records
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard;
