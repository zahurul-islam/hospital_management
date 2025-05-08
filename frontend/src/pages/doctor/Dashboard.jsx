import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/api';
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
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  CalendarMonth, 
  VideoCall, 
  People
} from '@mui/icons-material';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get doctor profile
        const doctorResponse = await doctorService.getDoctorById(user.profile?.id);
        setDoctorData(doctorResponse.data);

        // Get doctor appointments
        const appointmentsResponse = await doctorService.getDoctorAppointments(user.profile?.id);
        
        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const todaysAppts = appointmentsResponse.data
          .filter(appointment => {
            return appointment.date === todayStr && appointment.status !== 'cancelled';
          })
          .sort((a, b) => a.time.localeCompare(b.time));
        
        setTodayAppointments(todaysAppts);
        
        // Filter upcoming appointments (excluding today)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const upcoming = appointmentsResponse.data
          .filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= tomorrow && appointment.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        
        setUpcomingAppointments(upcoming);

        // Get patient count
        const patientsResponse = await doctorService.getDoctorPatients(user.profile?.id);
        setPatientCount(patientsResponse.data.length);
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
        Welcome, Dr. {user?.name}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Appointments
              </Typography>
              <Typography variant="h3" color="primary" align="center">
                {todayAppointments.length}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/doctor/appointments"
                  size="small"
                >
                  View All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Patients
              </Typography>
              <Typography variant="h3" color="primary" align="center">
                {patientCount}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/doctor/patients"
                  size="small"
                >
                  View All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Video Consultations
              </Typography>
              <Typography variant="h3" color="primary" align="center">
                {todayAppointments.filter(a => a.type === 'video').length}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/doctor/appointments"
                  size="small"
                >
                  View All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {todayAppointments.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No appointments scheduled for today.
                </Typography>
              ) : (
                <List>
                  {todayAppointments.map((appointment) => {
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
                                disabled={!appointment.telemedicineSession?.hostUrl}
                              >
                                Start Call
                              </Button>
                            )
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {formattedTime} - {appointment.patient.user.name}
                                </Typography>
                                <Chip 
                                  label={appointment.status} 
                                  size="small" 
                                  color={
                                    appointment.status === 'scheduled' ? 'primary' : 
                                    appointment.status === 'completed' ? 'success' : 
                                    'default'
                                  }
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {appointment.type === 'video' ? 'Video Call' : 'In-Person'} ({appointment.duration} mins)
                                </Typography>
                                {appointment.reason && (
                                  <>
                                    <br />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                      Reason: {appointment.reason}
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
            </CardContent>
          </Card>
        </Grid>

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
                    to="/doctor/appointments"
                    startIcon={<CalendarMonth />}
                  >
                    Manage Appointments
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/doctor/patients"
                    startIcon={<People />}
                  >
                    View Patients
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingAppointments.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No upcoming appointments scheduled.
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
                          component={Link}
                          to={`/appointments/${appointment.id}`}
                          sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {formattedDate} at {formattedTime} - {appointment.patient.user.name}
                                </Typography>
                                {appointment.type === 'video' && (
                                  <VideoCall color="primary" sx={{ ml: 1 }} fontSize="small" />
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {appointment.type === 'video' ? 'Video Call' : 'In-Person'} ({appointment.duration} mins)
                                </Typography>
                                {appointment.reason && (
                                  <>
                                    <br />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                      Reason: {appointment.reason}
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
                  to="/doctor/appointments"
                  color="primary"
                >
                  View All Appointments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
