// routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getAppointments, deleteAppointment } = require('../controllers/appointmentController');
const router = express.Router();

router.post('/', createAppointment); // Create an appointment
router.get('/', getAppointments); // Get all appointments
router.delete('/:id', deleteAppointment); // Delete an appointment by ID

module.exports = router;