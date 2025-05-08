const express = require('express');
const patientController = require('../controllers/patient.controller');
const { verifyToken, isDoctorOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all patients (for doctors and admins)
router.get('/', verifyToken, isDoctorOrAdmin, patientController.getAllPatients);

// Get patient by ID
router.get('/:id', verifyToken, patientController.getPatientById);

// Update patient
router.put('/:id', verifyToken, patientController.updatePatient);

// Get patient's appointments
router.get('/:id/appointments', verifyToken, patientController.getPatientAppointments);

// Get patient's medical records
router.get('/:id/medical-records', verifyToken, patientController.getPatientMedicalRecords);

module.exports = router;
