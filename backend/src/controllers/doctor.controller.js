const { Doctor, User, Appointment, MedicalRecord, Patient } = require('../models');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    return res.status(200).json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    return res.status(500).json({ message: 'Error getting doctors', error: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    return res.status(500).json({ message: 'Error getting doctor', error: error.message });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      specialty, qualification, experience, licenseNumber,
      consultationFee, availableDays, availableTimeStart,
      availableTimeEnd, isAvailableForVideoCall, bio
    } = req.body;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user is authorized to update this doctor
    if (req.user.role === 'doctor' && req.user.id !== doctor.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this doctor' });
    }

    // Update doctor
    await doctor.update({
      specialty,
      qualification,
      experience,
      licenseNumber,
      consultationFee,
      availableDays,
      availableTimeStart,
      availableTimeEnd,
      isAvailableForVideoCall,
      bio
    });

    return res.status(200).json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user is authorized to view this doctor's appointments
    if (req.user.role === 'doctor' && req.user.id !== doctor.userId) {
      return res.status(403).json({ message: 'Not authorized to view these appointments' });
    }

    const appointments = await Appointment.findAll({
      where: { doctorId: id },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    return res.status(500).json({ message: 'Error getting appointments', error: error.message });
  }
};

// Get doctor's patients
exports.getDoctorPatients = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user is authorized to view this doctor's patients
    if (req.user.role === 'doctor' && req.user.id !== doctor.userId) {
      return res.status(403).json({ message: 'Not authorized to view these patients' });
    }

    // Get all appointments for this doctor
    const appointments = await Appointment.findAll({
      where: { doctorId: id },
      attributes: ['patientId'],
      group: ['patientId']
    });

    // Get unique patient IDs
    const patientIds = appointments.map(appointment => appointment.patientId);

    // Get patient details
    const patients = await Patient.findAll({
      where: { id: patientIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    return res.status(200).json(patients);
  } catch (error) {
    console.error('Get doctor patients error:', error);
    return res.status(500).json({ message: 'Error getting patients', error: error.message });
  }
};
