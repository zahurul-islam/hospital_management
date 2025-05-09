import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState([]);

  useEffect(() => {
    console.log("Dashboard mounted, user:", user);

    if (!user) {
      console.log("No user found");
      return;
    }

    if (!user.profile || !user.profile.id) {
      console.log("No user profile found");
      setError('User profile not found. Please try logging in again.');
      return;
    }

    console.log("User profile ID:", user.profile.id);
  }, [user]);

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: 'primary.dark',
          fontWeight: 'bold',
          mb: 3
        }}
      >
        Welcome, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{
              height: '100%',
              borderTop: '4px solid #4CAF50',
              borderRadius: '12px'
            }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
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
                    sx={{
                      py: 1.2,
                      background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                      boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                    }}
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
          <Card sx={{
              height: '100%',
              borderTop: '4px solid #2196F3',
              borderRadius: '12px'
            }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'secondary.main',
                  fontWeight: 'bold'
                }}
              >
                Upcoming Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" color="text.secondary">
                No upcoming appointments. Book a new appointment to get started.
              </Typography>

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
          <Card sx={{
              borderTop: '4px solid #FF9800',
              borderRadius: '12px'
            }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'warning.dark',
                  fontWeight: 'bold'
                }}
              >
                Recent Medical Records
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" color="text.secondary">
                No medical records found.
              </Typography>

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
