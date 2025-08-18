// routes/authRoutes.js
const express = require('express');
const { registerAdmin, login, logout, registerOrganization } = require('../controllers/authController');
const router = express.Router();

router.post('/register/admin', registerAdmin);
router.post('/login', login); // Single login route for both admin and organization
router.post('/register/organization', registerOrganization);
router.post('/logout', logout);

module.exports = router;