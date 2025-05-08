import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService, appointmentService, medicalRecordService } from '../../services/api';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  People, 
  CalendarMonth, 
  MedicalServices,
  VideoCall
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalVideoAppointments: 0,
    totalMedicalRecords: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get users
        const usersResponse = await userService.getAllUsers();
        const users = usersResponse.data;
        
        // Calculate stats
        const totalUsers = users.length;
        const totalPatients = users.filter(user => user.role === 'patient').length;
        const totalDoctors = users.filter(user => user.role === 'doctor').length;
        
        // Get appointments
        const appointmentsResponse = await appointmentService.getAllAppointments();
        const appointments = appointmentsResponse.data;
        
        const totalAppointments = appointments.length;
        const totalVideoAppointments = appointments.filter(appointment => appointment.type === 'video').length;
        
        // Get recent appointments
        const recentAppts = appointments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setRecentAppointments(recentAppts);
        
        // Get medical records
        const medicalRecordsResponse = await medicalRecordService.getAllMedicalRecords();
        const totalMedicalRecords = medicalRecordsResponse.data.length;
        
        // Set stats
        setStats({
          totalUsers,
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalVideoAppointments,
          totalMedicalRecords
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Users
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" align="center">
                {stats.totalUsers}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patients
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalPatients}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Doctors
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalDoctors}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/admin/users"
                  size="small"
                >
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Appointments
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" align="center">
                {stats.totalAppointments}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    In-Person
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalAppointments - stats.totalVideoAppointments}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Video Calls
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalVideoAppointments}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/admin/appointments"
                  size="small"
                >
                  View Appointments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MedicalServices color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Medical Records
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" align="center">
                {stats.totalMedicalRecords}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Total medical records in the system
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/admin/medical-records"
                  size="small"
                >
                  View Records
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Appointments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} elevation={0}>
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
                    {recentAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAppointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.date);
                        const formattedDate = appointmentDate.toLocaleDateString();
                        const formattedTime = appointment.time.substring(0, 5);
                        
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>{formattedDate}</TableCell>
                            <TableCell>{formattedTime}</TableCell>
                            <TableCell>{appointment.patient.user.name}</TableCell>
                            <TableCell>Dr. {appointment.doctor.user.name}</TableCell>
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
                              <Typography 
                                className={`status-${appointment.status}`}
                                sx={{ fontWeight: 'bold' }}
                              >
                                {appointment.status}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                component={Link}
                                to={`/appointments/${appointment.id}`}
                                size="small"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/admin/appointments"
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

export default AdminDashboard;
