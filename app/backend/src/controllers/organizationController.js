const Organization = require('../models/Organization'); // Import the Organization model

// Create a new organization
exports.createOrganization = async (req, res) => {
    const { name, email, address, password } = req.body;

    try {
        const newOrganization = await Organization.create({ name, email, address, password });
        res.status(201).json({ message: 'Organization created successfully', organization: newOrganization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all organizations
exports.getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.findAll();
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an organization by email
exports.getOrganizationByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const organization = await Organization.findOne({ where: { email } });

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json(organization);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an organization by email
exports.deleteOrganization = async (req, res) => {
    const { email } = req.params;

    try {
        const deletedCount = await Organization.destroy({ where: { email } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
