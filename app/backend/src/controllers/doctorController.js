// controllers/doctorController.js
const Doctor = require('../models/Doctor');

exports.createDoctor = async (req, res) => {
    const { name, specialization } = req.body;

    // Check if the doctor already exists
    const existingDoctor = await Doctor.findOne({ where: { name, specialization } });
    if (existingDoctor) {
        return res.status(400).json({ message: 'Doctor already exists' });
    }

    try {
        const doctor = await Doctor.create({ name, specialization });
        res.status(201).json({ message: 'Doctor created', doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDoctorByName = async (req, res) => {
    const { name } = req.params;

    try {
        const doctor = await Doctor.findOne({ where: { name } });
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        await Doctor.destroy({ where: { id } });
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
