const { MedicalRecord, Patient, Doctor, Appointment, User } = require('../models');

// Get all medical records (admin only)
exports.getAllMedicalRecords = async (req, res) => {
  try {
    // Only admin can access all medical records
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access all medical records' });
    }

    const medicalRecords = await MedicalRecord.findAll({
      include: [
        {
          model: Patient,
          as: 'patientRecord',
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
          as: 'doctorRecord',
          include: [
            {
              model: User,
              as: 'doctorUser',
              attributes: ['id', 'name', 'email']
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
    console.error('Get all medical records error:', error);
    return res.status(500).json({ message: 'Error getting medical records', error: error.message });
  }
};

// Get medical record by ID
exports.getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patientRecord',
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
          as: 'doctorRecord',
          include: [
            {
              model: User,
              as: 'doctorUser',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Appointment,
          as: 'appointmentRecord'
        }
      ]
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if user is authorized to view this medical record
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== medicalRecord.patientId) {
        return res.status(403).json({ message: 'Not authorized to view this medical record' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== medicalRecord.doctorId) {
        return res.status(403).json({ message: 'Not authorized to view this medical record' });
      }
    }

    return res.status(200).json(medicalRecord);
  } catch (error) {
    console.error('Get medical record by ID error:', error);
    return res.status(500).json({ message: 'Error getting medical record', error: error.message });
  }
};

// Create medical record (doctors only)
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, prescriptions, testResults, notes, followUpDate } = req.body;

    // Check if user is a doctor
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors can create medical records' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor && req.user.role === 'doctor') {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctorId = doctor ? doctor.id : req.body.doctorId;

    // Validate patient
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Validate appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if appointment belongs to this doctor and patient
      if (appointment.doctorId !== doctorId || appointment.patientId !== patientId) {
        return res.status(400).json({ message: 'Appointment does not match doctor and patient' });
      }
    }

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      symptoms,
      prescriptions,
      testResults,
      notes,
      followUpDate
    });

    // If appointment is provided, update its status to completed
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      await appointment.update({ status: 'completed' });
    }

    return res.status(201).json({
      message: 'Medical record created successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    return res.status(500).json({ message: 'Error creating medical record', error: error.message });
  }
};

// Update medical record (doctors only)
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, symptoms, prescriptions, testResults, notes, followUpDate } = req.body;

    const medicalRecord = await MedicalRecord.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if user is authorized to update this medical record
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== medicalRecord.doctorId) {
        return res.status(403).json({ message: 'Not authorized to update this medical record' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can update medical records' });
    }

    // Update medical record
    await medicalRecord.update({
      diagnosis,
      symptoms,
      prescriptions,
      testResults,
      notes,
      followUpDate
    });

    return res.status(200).json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    return res.status(500).json({ message: 'Error updating medical record', error: error.message });
  }
};

// Delete medical record (admin only)
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if user is authorized to delete this medical record
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete medical records' });
    }

    // Delete medical record
    await medicalRecord.destroy();

    return res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    return res.status(500).json({ message: 'Error deleting medical record', error: error.message });
  }
};
