const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all doctors
router.get('/', verifyToken, doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', verifyToken, doctorController.getDoctorById);

// Update doctor
router.put('/:id', verifyToken, doctorController.updateDoctor);

// Get doctor's appointments
router.get('/:id/appointments', verifyToken, doctorController.getDoctorAppointments);

// Get doctor's patients
router.get('/:id/patients', verifyToken, doctorController.getDoctorPatients);

// Create or update doctor profile
router.post('/profile', verifyToken, doctorController.createDoctorProfile);

module.exports = router;
