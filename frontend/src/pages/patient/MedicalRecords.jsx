import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';
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
  Chip,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const PatientMedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user.profile?.id) {
          throw new Error('Patient profile not found');
        }

        const response = await patientService.getPatientMedicalRecords(user.profile.id);
        setMedicalRecords(response.data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
        setError('Failed to load medical records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
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
        My Medical Records
      </Typography>

      {medicalRecords.length === 0 ? (
        <Alert severity="info">
          You don't have any medical records yet.
        </Alert>
      ) : (
        <Box>
          {medicalRecords.map((record) => {
            const recordDate = new Date(record.createdAt);
            const formattedDate = recordDate.toLocaleDateString();
            
            return (
              <Accordion key={record.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {formattedDate} - Dr. {record.doctorRecord.doctorUser.name}
                    </Typography>
                    {record.diagnosis && (
                      <Chip 
                        label={record.diagnosis.substring(0, 30) + (record.diagnosis.length > 30 ? '...' : '')} 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper elevation={0} sx={{ p: 2 }}>
                    {record.diagnosis && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Diagnosis
                        </Typography>
                        <Typography variant="body1">
                          {record.diagnosis}
                        </Typography>
                      </Box>
                    )}
                    
                    {record.symptoms && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Symptoms
                        </Typography>
                        <Typography variant="body1">
                          {record.symptoms}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {record.prescriptions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Prescriptions
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {record.prescriptions}
                        </Typography>
                      </Box>
                    )}
                    
                    {record.testResults && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Test Results
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {record.testResults}
                        </Typography>
                      </Box>
                    )}
                    
                    {record.notes && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">
                          {record.notes}
                        </Typography>
                      </Box>
                    )}
                    
                    {record.followUpDate && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Follow-up Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(record.followUpDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PatientMedicalRecords;
