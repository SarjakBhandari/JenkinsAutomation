// routes/doctorRoutes.js
const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();

router.post('/', doctorController.createDoctor);
router.get('/', doctorController.getDoctors);
router.get('/:name', doctorController.getDoctorByName);  // Add this route
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
