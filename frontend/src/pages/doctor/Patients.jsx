import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService, patientService } from '../../services/api';
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
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Person,
  CalendarMonth,
  MedicalServices,
  Phone,
  Email
} from '@mui/icons-material';

const DoctorPatients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user.profile?.id) {
          throw new Error('Doctor profile not found');
        }

        const response = await doctorService.getDoctorPatients(user.profile.id);
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const name = patient.patientUser.name.toLowerCase();
        const email = patient.patientUser.email.toLowerCase();
        const phone = patient.patientUser.phone ? patient.patientUser.phone.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        return name.includes(search) || email.includes(search) || phone.includes(search);
      });
      
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePatientDetailsOpen = async (patient) => {
    try {
      setLoading(true);
      
      // Get detailed patient information
      const response = await patientService.getPatientById(patient.id);
      setSelectedPatient(response.data);
      
      setPatientDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Failed to load patient details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientDetailsClose = () => {
    setPatientDetailsOpen(false);
    setSelectedPatient(null);
  };

  if (loading && patients.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Patients
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search patients by name, email, or phone"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredPatients.length === 0 ? (
        <Alert severity="info">
          No patients found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPatients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {patient.patientUser.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {patient.patientUser.email}
                      </Typography>
                    </Box>
                    
                    {patient.patientUser.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {patient.patientUser.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Person />}
                      onClick={() => handlePatientDetailsOpen(patient)}
                    >
                      View Details
                    </Button>
                    
                    <Button
                      component={Link}
                      to={`/patient/${patient.id}/appointments`}
                      size="small"
                      startIcon={<CalendarMonth />}
                    >
                      Appointments
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Patient Details Dialog */}
      <Dialog
        open={patientDetailsOpen}
        onClose={handlePatientDetailsClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Patient Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedPatient && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.patientUser.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.patientUser.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.patientUser.phone || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.gender ? selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1) : 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Blood Group
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.bloodGroup || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">
                  Medical History
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedPatient.medicalHistory || 'No medical history provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Allergies
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedPatient.allergies || 'No allergies provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Current Medications
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedPatient.currentMedications || 'No current medications provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">
                  Emergency Contact
                </Typography>
                <Typography variant="body1">
                  {selectedPatient.emergencyContact || 'No emergency contact provided'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePatientDetailsClose}>
            Close
          </Button>
          <Button 
            component={Link}
            to={`/patient/${selectedPatient?.id}/medical-records`}
            color="primary"
            onClick={handlePatientDetailsClose}
          >
            View Medical Records
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorPatients;
