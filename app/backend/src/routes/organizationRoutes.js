const express = require('express');
const { createOrganization, getOrganizations, deleteOrganization, getOrganizationByEmail } = require('../controllers/organizationController'); // Ensure this path is correct
const router = express.Router();

// Route to create a new organization
router.post('/', createOrganization);

// Route to get all organizations
router.get('/', getOrganizations);

// Route to get an organization by email
router.get('/email/:email', getOrganizationByEmail);

// Route to delete an organization by email
router.delete('/email/:email', deleteOrganization);

module.exports = router;
