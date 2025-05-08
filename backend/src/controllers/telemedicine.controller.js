const { TelemedicineSession, Appointment, Patient, Doctor, User } = require('../models');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Mock function to create a Zoom meeting (in a real app, this would use the Zoom API)
const createZoomMeeting = async (topic, startTime, duration) => {
  // In a real implementation, this would call the Zoom API
  // For now, we'll mock the response

  const meetingId = Math.floor(100000000 + Math.random() * 900000000);
  const password = Math.random().toString(36).substring(2, 10);

  return {
    id: meetingId,
    password: password,
    join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    host_url: `https://zoom.us/s/${meetingId}?zak=mock-host-key&pwd=${password}`,
    start_time: startTime,
    duration: duration
  };
};

// Get all telemedicine sessions (admin only)
exports.getAllTelemedicineSessions = async (req, res) => {
  try {
    // Only admin can access all telemedicine sessions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access all telemedicine sessions' });
    }

    const telemedicineSessions = await TelemedicineSession.findAll({
      include: [
        {
          model: Appointment,
          as: 'appointmentSession',
          include: [
            {
              model: Patient,
              as: 'appointmentPatient',
              include: [
                {
                  model: User,
                  as: 'patientUser',
                  attributes: ['id', 'name', 'email']
                }
              ]
            },
            {
              model: Doctor,
              as: 'appointmentDoctor',
              include: [
                {
                  model: User,
                  as: 'doctorUser',
                  attributes: ['id', 'name', 'email']
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(telemedicineSessions);
  } catch (error) {
    console.error('Get all telemedicine sessions error:', error);
    return res.status(500).json({ message: 'Error getting telemedicine sessions', error: error.message });
  }
};

// Get telemedicine session by ID
exports.getTelemedicineSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const telemedicineSession = await TelemedicineSession.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: 'appointmentSession',
          include: [
            {
              model: Patient,
              as: 'appointmentPatient',
              include: [
                {
                  model: User,
                  as: 'patientUser',
                  attributes: ['id', 'name', 'email']
                }
              ]
            },
            {
              model: Doctor,
              as: 'appointmentDoctor',
              include: [
                {
                  model: User,
                  as: 'doctorUser',
                  attributes: ['id', 'name', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!telemedicineSession) {
      return res.status(404).json({ message: 'Telemedicine session not found' });
    }

    // Check if user is authorized to view this telemedicine session
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== telemedicineSession.appointmentSession.patientId) {
        return res.status(403).json({ message: 'Not authorized to view this telemedicine session' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== telemedicineSession.appointmentSession.doctorId) {
        return res.status(403).json({ message: 'Not authorized to view this telemedicine session' });
      }
    }

    return res.status(200).json(telemedicineSession);
  } catch (error) {
    console.error('Get telemedicine session by ID error:', error);
    return res.status(500).json({ message: 'Error getting telemedicine session', error: error.message });
  }
};

// Create or update telemedicine session for an appointment
exports.createOrUpdateTelemedicineSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Validate appointment
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Patient,
          as: 'appointmentPatient',
          include: [
            {
              model: User,
              as: 'patientUser',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Doctor,
          as: 'appointmentDoctor',
          include: [
            {
              model: User,
              as: 'doctorUser',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment is a video appointment
    if (appointment.type !== 'video') {
      return res.status(400).json({ message: 'Appointment is not a video appointment' });
    }

    // Check if user is authorized to create/update this telemedicine session
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({ message: 'Not authorized to manage this telemedicine session' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can manage telemedicine sessions' });
    }

    // Check if telemedicine session already exists
    let telemedicineSession = await TelemedicineSession.findOne({
      where: { appointmentId }
    });

    // Create Zoom meeting
    const meetingTopic = `Appointment with Dr. ${appointment.appointmentDoctor.doctorUser.name} and ${appointment.appointmentPatient.patientUser.name}`;
    const startTime = new Date(`${appointment.date}T${appointment.time}`);
    const duration = appointment.duration;

    const zoomMeeting = await createZoomMeeting(meetingTopic, startTime, duration);

    if (telemedicineSession) {
      // Update existing session
      await telemedicineSession.update({
        meetingId: zoomMeeting.id.toString(),
        meetingPassword: zoomMeeting.password,
        joinUrl: zoomMeeting.join_url,
        hostUrl: zoomMeeting.host_url,
        startTime: zoomMeeting.start_time,
        duration: zoomMeeting.duration,
        status: 'scheduled'
      });
    } else {
      // Create new session
      telemedicineSession = await TelemedicineSession.create({
        appointmentId,
        meetingId: zoomMeeting.id.toString(),
        meetingPassword: zoomMeeting.password,
        joinUrl: zoomMeeting.join_url,
        hostUrl: zoomMeeting.host_url,
        startTime: zoomMeeting.start_time,
        duration: zoomMeeting.duration,
        status: 'scheduled'
      });
    }

    return res.status(200).json({
      message: 'Telemedicine session created/updated successfully',
      telemedicineSession
    });
  } catch (error) {
    console.error('Create/update telemedicine session error:', error);
    return res.status(500).json({ message: 'Error managing telemedicine session', error: error.message });
  }
};

// Start telemedicine session
exports.startTelemedicineSession = async (req, res) => {
  try {
    const { id } = req.params;

    const telemedicineSession = await TelemedicineSession.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: 'appointmentSession'
        }
      ]
    });

    if (!telemedicineSession) {
      return res.status(404).json({ message: 'Telemedicine session not found' });
    }

    // Check if user is authorized to start this session
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== telemedicineSession.appointmentSession.doctorId) {
        return res.status(403).json({ message: 'Not authorized to start this telemedicine session' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can start telemedicine sessions' });
    }

    // Update session status
    await telemedicineSession.update({
      status: 'in-progress',
      startTime: new Date()
    });

    return res.status(200).json({
      message: 'Telemedicine session started successfully',
      hostUrl: telemedicineSession.hostUrl
    });
  } catch (error) {
    console.error('Start telemedicine session error:', error);
    return res.status(500).json({ message: 'Error starting telemedicine session', error: error.message });
  }
};

// End telemedicine session
exports.endTelemedicineSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, recordingUrl } = req.body;

    const telemedicineSession = await TelemedicineSession.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: 'appointmentSession'
        }
      ]
    });

    if (!telemedicineSession) {
      return res.status(404).json({ message: 'Telemedicine session not found' });
    }

    // Check if user is authorized to end this session
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== telemedicineSession.appointmentSession.doctorId) {
        return res.status(403).json({ message: 'Not authorized to end this telemedicine session' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can end telemedicine sessions' });
    }

    // Update session status
    await telemedicineSession.update({
      status: 'completed',
      endTime: new Date(),
      notes,
      recordingUrl
    });

    // Update appointment status
    await Appointment.update(
      { status: 'completed' },
      { where: { id: telemedicineSession.appointmentId } }
    );

    return res.status(200).json({ message: 'Telemedicine session ended successfully' });
  } catch (error) {
    console.error('End telemedicine session error:', error);
    return res.status(500).json({ message: 'Error ending telemedicine session', error: error.message });
  }
};
