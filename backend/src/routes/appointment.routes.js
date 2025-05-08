const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all appointments
router.get('/', verifyToken, appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/:id', verifyToken, appointmentController.getAppointmentById);

// Create appointment
router.post('/', verifyToken, appointmentController.createAppointment);

// Update appointment
router.put('/:id', verifyToken, appointmentController.updateAppointment);

// Delete appointment (admin only)
router.delete('/:id', verifyToken, isAdmin, appointmentController.deleteAppointment);

module.exports = router;
