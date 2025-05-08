const express = require('express');
const telemedicineController = require('../controllers/telemedicine.controller');
const { verifyToken, isAdmin, isDoctorOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all telemedicine sessions (admin only)
router.get('/', verifyToken, isAdmin, telemedicineController.getAllTelemedicineSessions);

// Get telemedicine session by ID
router.get('/:id', verifyToken, telemedicineController.getTelemedicineSessionById);

// Create or update telemedicine session for an appointment
router.post('/', verifyToken, isDoctorOrAdmin, telemedicineController.createOrUpdateTelemedicineSession);

// Start telemedicine session
router.post('/:id/start', verifyToken, isDoctorOrAdmin, telemedicineController.startTelemedicineSession);

// End telemedicine session
router.post('/:id/end', verifyToken, isDoctorOrAdmin, telemedicineController.endTelemedicineSession);

module.exports = router;
