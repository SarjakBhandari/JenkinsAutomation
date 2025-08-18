// src/controllers/adminController.js
const Admin = require('../models/Admin'); // Import the Admin model

// Create a new admin
exports.createAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const newAdmin = await Admin.create({ email, password });
        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an admin by ID
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCount = await Admin.destroy({ where: { id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};