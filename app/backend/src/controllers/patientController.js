const Patient = require('../models/Patient');

exports.createPatient = async (req, res) => {
    const { name, phone, disease, address } = req.body;

    // Check if the patient already exists
    const existingPatient = await Patient.findOne({ where: { phone } });
    if (existingPatient) {
        return res.status(400).json({ message: 'Patient with this phone number already exists' });
    }

    try {
        const patient = await Patient.create({ name, phone, disease, address });
        res.status(201).json({ message: 'Patient created', patient });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modified deletePatient function to delete by phone number
exports.deletePatient = async (req, res) => {
    const { phone } = req.params; // Assuming phone number is passed as a URL parameter
    try {
        const deletedCount = await Patient.destroy({ where: { phone } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// New function to get patient by phone number
exports.getPatientByPhone = async (req, res) => {
    const { phone } = req.params; // Assuming phone number is passed as a URL parameter
    try {
        const patient = await Patient.findOne({ where: { phone } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// New function to check if a patient exists by phone number
exports.checkPatientExists = async (req, res) => {
    const { phone } = req.params; // Assuming phone number is passed as a URL parameter
    try {
        const existingPatient = await Patient.findOne({ where: { phone } });
        if (existingPatient) {
            return res.status(200).json({ message: 'Patient exists' });
        }
        res.status(404).json({ message: 'Patient not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
