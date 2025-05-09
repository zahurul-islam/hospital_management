import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicalRecordService } from '../../services/api';
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
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Delete,
  Visibility,
  ExpandMore,
  Search
} from '@mui/icons-material';

const AdminMedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewRecordDialogOpen, setViewRecordDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await medicalRecordService.getAllMedicalRecords();
        setMedicalRecords(response.data);
        setFilteredRecords(response.data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
        setError('Failed to load medical records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(medicalRecords);
    } else {
      const filtered = medicalRecords.filter(record => {
        const patientName = record.patientRecord?.patientUser?.name.toLowerCase() || '';
        const doctorName = record.doctorRecord?.doctorUser?.name.toLowerCase() || '';
        const diagnosis = record.diagnosis?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return patientName.includes(search) || 
               doctorName.includes(search) || 
               diagnosis.includes(search);
      });
      
      setFilteredRecords(filtered);
    }
  }, [searchTerm, medicalRecords]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDialogOpen = (record) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleViewRecordDialogOpen = (record) => {
    setSelectedRecord(record);
    setViewRecordDialogOpen(true);
  };

  const handleViewRecordDialogClose = () => {
    setViewRecordDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = async () => {
    try {
      setLoading(true);
      
      await medicalRecordService.deleteMedicalRecord(selectedRecord.id);
      
      // Update local state
      const updatedRecords = medicalRecords.filter(r => r.id !== selectedRecord.id);
      setMedicalRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      setError('Failed to delete medical record. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && medicalRecords.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medical Records Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          placeholder="Search by patient, doctor, or diagnosis"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No medical records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => {
                const recordDate = new Date(record.createdAt);
                const formattedDate = recordDate.toLocaleDateString();

                return (
                  <TableRow key={record.id}>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>
                      {record.patientRecord?.patientUser?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      Dr. {record.doctorRecord?.doctorUser?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.diagnosis ? 
                        (record.diagnosis.length > 50 ? 
                          `${record.diagnosis.substring(0, 50)}...` : 
                          record.diagnosis) : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          color="primary"
                          size="small"
                          onClick={() => handleViewRecordDialogOpen(record)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDialogOpen(record)}
                          title="Delete Record"
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

      {/* View Medical Record Dialog */}
      <Dialog
        open={viewRecordDialogOpen}
        onClose={handleViewRecordDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Medical Record Details</DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {selectedRecord.patientRecord?.patientUser?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {selectedRecord.patientRecord?.patientUser?.email}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Doctor Information
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> Dr. {selectedRecord.doctorRecord?.doctorUser?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Specialty:</strong> {selectedRecord.doctorRecord?.specialty}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Medical Details
              </Typography>
              <Box>
                {selectedRecord.diagnosis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Diagnosis
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.diagnosis}
                    </Typography>
                  </Box>
                )}
                
                {selectedRecord.symptoms && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Symptoms
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.symptoms}
                    </Typography>
                  </Box>
                )}
                
                {selectedRecord.prescriptions && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Prescriptions
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedRecord.prescriptions}
                    </Typography>
                  </Box>
                )}
                
                {selectedRecord.testResults && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Test Results
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedRecord.testResults}
                    </Typography>
                  </Box>
                )}
                
                {selectedRecord.notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedRecord.notes}
                    </Typography>
                  </Box>
                )}
                
                {selectedRecord.followUpDate && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Follow-up Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedRecord.followUpDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewRecordDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Medical Record Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Medical Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this medical record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRecord} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMedicalRecords;
