// routes/staffRoutes.js
const express = require('express');
const { createStaff, getStaffs, deleteStaff,searchStaffByPhone } = require('../controllers/staffController');
const router = express.Router();

router.post('/', createStaff); // Create staff
router.get('/', getStaffs); // Get all staff
router.delete('/:id', deleteStaff); // Delete staff by ID
router.get('/:phone', searchStaffByPhone); // Search staff by name
module.exports = router;