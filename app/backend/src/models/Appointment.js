// src/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Ensure this path is correct

const Appointment = sequelize.define('Appointment', {
    patientNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    doctorName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
});

// Optional: Add any associations or hooks here

module.exports = Appointment;