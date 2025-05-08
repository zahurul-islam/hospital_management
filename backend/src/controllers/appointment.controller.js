const { Appointment, Patient, Doctor, User, TelemedicineSession } = require('../models');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    // For admin, return all appointments
    // For doctor, return only their appointments
    // For patient, return only their appointments
    let whereClause = {};

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      whereClause.doctorId = doctor.id;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      whereClause.patientId = patient.id;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
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
        },
        {
          model: TelemedicineSession,
          as: 'telemedicineSession',
          required: false
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    return res.status(500).json({ message: 'Error getting appointments', error: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
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
        },
        {
          model: TelemedicineSession,
          as: 'telemedicineSession',
          required: false
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to view this appointment
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        return res.status(403).json({ message: 'Not authorized to view this appointment' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({ message: 'Not authorized to view this appointment' });
      }
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    return res.status(500).json({ message: 'Error getting appointment', error: error.message });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, duration, type, reason } = req.body;

    // Validate patient
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Validate doctor
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user is authorized to create this appointment
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile || patientProfile.id !== patientId) {
        return res.status(403).json({ message: 'Not authorized to create appointment for this patient' });
      }
    }

    // Check if doctor is available for video call if type is 'video'
    if (type === 'video' && !doctor.isAvailableForVideoCall) {
      return res.status(400).json({ message: 'Doctor is not available for video call appointments' });
    }

    // Check if the appointment time is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        date,
        time
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      duration: duration || 30,
      type,
      reason,
      status: 'scheduled'
    });

    // If appointment type is video, create telemedicine session
    if (type === 'video') {
      await TelemedicineSession.create({
        appointmentId: appointment.id,
        status: 'scheduled'
      });
    }

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, duration, type, reason, status, notes } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to update this appointment
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }

      // Patients can only update reason or cancel appointment
      if (status && status !== 'cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
    }

    // Update appointment
    await appointment.update({
      date,
      time,
      duration,
      type,
      reason,
      status,
      notes
    });

    // If appointment type changed to video, create telemedicine session if it doesn't exist
    if (type === 'video' && appointment.type !== 'video') {
      const existingSession = await TelemedicineSession.findOne({
        where: { appointmentId: id }
      });

      if (!existingSession) {
        await TelemedicineSession.create({
          appointmentId: id,
          status: 'scheduled'
        });
      }
    }

    // If appointment status changed to cancelled, update telemedicine session if it exists
    if (status === 'cancelled') {
      const telemedicineSession = await TelemedicineSession.findOne({
        where: { appointmentId: id }
      });

      if (telemedicineSession) {
        await telemedicineSession.update({ status: 'cancelled' });
      }
    }

    return res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to delete this appointment
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete appointments' });
    }

    // Delete telemedicine session if it exists
    const telemedicineSession = await TelemedicineSession.findOne({
      where: { appointmentId: id }
    });

    if (telemedicineSession) {
      await telemedicineSession.destroy();
    }

    // Delete appointment
    await appointment.destroy();

    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
};
