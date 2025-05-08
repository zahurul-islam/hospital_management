const express = require('express');
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { verifyToken, isAdmin, isDoctorOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all medical records (admin only)
router.get('/', verifyToken, isAdmin, medicalRecordController.getAllMedicalRecords);

// Get medical record by ID
router.get('/:id', verifyToken, medicalRecordController.getMedicalRecordById);

// Create medical record (doctors only)
router.post('/', verifyToken, isDoctorOrAdmin, medicalRecordController.createMedicalRecord);

// Update medical record (doctors only)
router.put('/:id', verifyToken, isDoctorOrAdmin, medicalRecordController.updateMedicalRecord);

// Delete medical record (admin only)
router.delete('/:id', verifyToken, isAdmin, medicalRecordController.deleteMedicalRecord);

module.exports = router;
