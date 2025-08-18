const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

exports.createAppointment = async (req, res) => {
    const { patientNumber, doctorName, date, time } = req.body;

    try {
        // Validate patient existence
    
        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (appointmentDateTime <= now) {
            return res.status(400).json({ message: 'Appointment must be scheduled for a future date and time' });
        }

        const appointmentHour = appointmentDateTime.getHours();
        if (appointmentHour < 10 || appointmentHour > 15) {
            return res.status(400).json({ message: 'Appointment time must be between 10 AM and 3 PM' });
        }

        // Check for existing appointment
        const existingAppointment = await Appointment.findOne({ where: { patientNumber: patientNumber, date, time } });
        if (existingAppointment) {
            return res.status(400).json({ message: 'An appointment already exists for this patient at this time' });
        }

        // Create the appointment
        const appointment = await Appointment.create({ patientNumber: patientNumber, doctorName, date, time });
        return res.status(201).json({ message: 'Appointment created', appointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll();
        return res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await Appointment.destroy({ where: { id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        return res.json({ message: 'Appointment deleted' });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};