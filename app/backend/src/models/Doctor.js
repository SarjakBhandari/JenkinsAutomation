// src/models/Doctor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Ensure this path is correct

const Doctor = sequelize.define('Doctor', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Optional: Add any associations or hooks here

module.exports = Doctor;