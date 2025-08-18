// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Organization = require('../models/Organization');
require('dotenv').config();

exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const admin = await Admin.create({ email, password: hashedPassword });
        res.status(201).json({ message: 'Admin registered', admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Check if the user is an admin
    const admin = await Admin.findOne({ where: { email } });
    if (admin && await bcrypt.compare(password, admin.password)) {
        const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, userType: 'admin' }); // Include userType in the response
    }

    // Check if the user is an organization
    const organization = await Organization.findOne({ where: { email } });
    if (organization && await bcrypt.compare(password, organization.password)) {
        const token = jwt.sign({ id: organization.id, role: 'organization' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, userType: 'organization' }); // Include userType in the response
    }

    return res.status(401).json({ message: 'Invalid credentials' });
};

exports.registerOrganization = async (req, res) => {
    const { name, email, address, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const organization = await Organization.create({ name, email, address, password: hashedPassword });
        res.status(201).json({ message: 'Organization registered', organization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};