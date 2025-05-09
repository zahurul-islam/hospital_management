const { Patient, User, Appointment, MedicalRecord, Doctor } = require('../models');

// Get all patients (for doctors and admins)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          as: 'patientUser',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    return res.status(200).json(patients);
  } catch (error) {
    console.error('Get all patients error:', error);
    return res.status(500).json({ message: 'Error getting patients', error: error.message });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'patientUser',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if user is authorized to view this patient
    if (req.user.role === 'patient' && req.user.id !== patient.patientUser.id) {
      return res.status(403).json({ message: 'Not authorized to view this patient' });
    }

    return res.status(200).json(patient);
  } catch (error) {
    console.error('Get patient by ID error:', error);
    return res.status(500).json({ message: 'Error getting patient', error: error.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateOfBirth, gender, bloodGroup, emergencyContact, medicalHistory, allergies, currentMedications } = req.body;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'patientUser'
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if user is authorized to update this patient
    if (req.user.role === 'patient' && req.user.id !== patient.patientUser.id) {
      return res.status(403).json({ message: 'Not authorized to update this patient' });
    }

    // Update patient
    await patient.update({
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      medicalHistory,
      allergies,
      currentMedications
    });

    return res.status(200).json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    return res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

// Get patient's appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if user is authorized to view this patient's appointments
    if (req.user.role === 'patient' && req.user.id !== patient.userId) {
      return res.status(403).json({ message: 'Not authorized to view these appointments' });
    }

    const appointments = await Appointment.findAll({
      where: { patientId: id },
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
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Get patient appointments error:', error);
    return res.status(500).json({ message: 'Error getting appointments', error: error.message });
  }
};

// Get patient's medical records
exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if user is authorized to view this patient's medical records
    if (req.user.role === 'patient' && req.user.id !== patient.userId) {
      return res.status(403).json({ message: 'Not authorized to view these medical records' });
    }

    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId: id },
      include: [
        {
          model: Doctor,
          as: 'doctorRecord',
          include: [
            {
              model: User,
              as: 'doctorUser',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Appointment,
          as: 'appointmentRecord'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(medicalRecords);
  } catch (error) {
    console.error('Get patient medical records error:', error);
    return res.status(500).json({ message: 'Error getting medical records', error: error.message });
  }
};
