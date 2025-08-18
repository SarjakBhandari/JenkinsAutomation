const express = require('express');
const { createPatient, getPatients, deletePatient, getPatientByPhone, checkPatientExists } = require('../controllers/patientController');
const router = express.Router();

router.post('/', createPatient);
router.get('/', getPatients);
router.get('/phone/:phone', getPatientByPhone); // New route for getting patient by phone
router.get('/exists/:phone', checkPatientExists); // New route to check if patient exists
router.delete('/phone/:phone', deletePatient); // Updated route to delete patient by phone

module.exports = router;
