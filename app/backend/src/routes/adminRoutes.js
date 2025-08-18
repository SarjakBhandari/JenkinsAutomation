const express = require('express');
const { createAdmin, getAdmins, deleteAdmin } = require('../controllers/adminController'); // Ensure this path is correct
const router = express.Router();

// Route to create a new admin
router.post('/', createAdmin);

// Route to get all admins
router.get('/', getAdmins);

// Route to delete an admin by ID
router.delete('/:id', deleteAdmin);

module.exports = router;