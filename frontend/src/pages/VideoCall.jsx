import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { telemedicineService } from '../services/api';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Videocam,
  Mic,
  MicOff,
  VideocamOff,
  CallEnd,
  Chat,
  Note
} from '@mui/icons-material';

const VideoCall = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [endCallDialogOpen, setEndCallDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await telemedicineService.getTelemedicineSessionById(id);
        setSession(response.data);
      } catch (error) {
        console.error('Error fetching telemedicine session:', error);
        setError('Failed to load telemedicine session. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const startCall = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'doctor') {
        // Only doctors can start the call
        await telemedicineService.startTelemedicineSession(id);
      }
      
      setCallActive(true);
      
      // In a real app, this would initialize the video call using the telemedicine API
      // For this demo, we'll just simulate a call
      console.log('Starting video call...');
      
      // Redirect to the video call URL if available
      if (session.hostUrl && user.role === 'doctor') {
        window.open(session.hostUrl, '_blank');
      } else if (session.joinUrl) {
        window.open(session.joinUrl, '_blank');
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to start video call. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    // In a real app, this would enable/disable the video stream
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // In a real app, this would enable/disable the audio stream
  };

  const handleEndCallDialogOpen = () => {
    setEndCallDialogOpen(true);
  };

  const handleEndCallDialogClose = () => {
    setEndCallDialogOpen(false);
  };

  const handleNotesDialogOpen = () => {
    setNotesDialogOpen(true);
  };

  const handleNotesDialogClose = () => {
    setNotesDialogOpen(false);
  };

  const endCall = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'doctor') {
        // Only doctors can end the call officially
        await telemedicineService.endTelemedicineSession(id, {
          notes: notes
        });
      }
      
      setCallActive(false);
      handleEndCallDialogClose();
      
      // Navigate back to appointments
      if (user.role === 'patient') {
        navigate('/patient/appointments');
      } else if (user.role === 'doctor') {
        navigate('/doctor/appointments');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      setError('Failed to end video call. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = () => {
    // In a real app, this would save the notes to the backend
    handleNotesDialogClose();
  };

  if (loading && !session) {
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

  if (!session) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Telemedicine session not found
      </Alert>
    );
  }

  const appointmentDate = new Date(session.appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = session.appointment.time.substring(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Video Consultation
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 2, 
              height: 480, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#000'
            }}
          >
            {callActive ? (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                {/* Main video area - in a real app, this would show the video stream */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {!videoEnabled ? (
                    <Typography variant="h6" color="white">
                      Camera is turned off
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="white">
                      Video stream would appear here in a real application
                    </Typography>
                  )}
                </Box>
                
                {/* Self view - in a real app, this would show your own camera */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    width: 160,
                    height: 90,
                    bgcolor: '#333',
                    border: '1px solid #666',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {!videoEnabled ? (
                    <VideocamOff sx={{ color: 'white' }} />
                  ) : (
                    <Typography variant="caption" color="white">
                      Your camera
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="white" gutterBottom>
                  Video call not started
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startCall}
                  startIcon={<Videocam />}
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Video Call'}
                </Button>
              </Box>
            )}
          </Paper>
          
          {/* Call controls */}
          <Paper sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={audioEnabled ? 'primary' : 'error'}
              onClick={toggleAudio}
              disabled={!callActive}
              startIcon={audioEnabled ? <Mic /> : <MicOff />}
            >
              {audioEnabled ? 'Mute' : 'Unmute'}
            </Button>
            
            <Button
              variant="contained"
              color={videoEnabled ? 'primary' : 'error'}
              onClick={toggleVideo}
              disabled={!callActive}
              startIcon={videoEnabled ? <Videocam /> : <VideocamOff />}
            >
              {videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            </Button>
            
            <Button
              variant="contained"
              color="error"
              onClick={handleEndCallDialogOpen}
              disabled={!callActive}
              startIcon={<CallEnd />}
            >
              End Call
            </Button>
            
            {user.role === 'doctor' && callActive && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNotesDialogOpen}
                startIcon={<Note />}
              >
                Add Notes
              </Button>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1">
                {user.role === 'patient' ? 'Doctor' : 'Patient'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user.role === 'patient' 
                  ? `Dr. ${session.appointment.doctor.user.name}` 
                  : session.appointment.patient.user.name}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Date & Time
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formattedDate} at {formattedTime}
              </Typography>
              
              {session.appointment.reason && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Reason for Visit
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {session.appointment.reason}
                  </Typography>
                </>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                {callActive 
                  ? 'Call is in progress. You can end the call using the controls below the video.' 
                  : 'Click "Start Video Call" to begin the consultation.'}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* End Call Dialog */}
      <Dialog
        open={endCallDialogOpen}
        onClose={handleEndCallDialogClose}
      >
        <DialogTitle>End Video Call</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this video call?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEndCallDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={endCall} color="error">
            End Call
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notes Dialog (for doctors) */}
      <Dialog
        open={notesDialogOpen}
        onClose={handleNotesDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Consultation Notes</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Add notes about this consultation. These will be saved to the patient's medical record.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={8}
            fullWidth
            label="Consultation Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter diagnosis, prescriptions, and any other relevant information..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotesDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={saveNotes} color="primary" variant="contained">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoCall;
