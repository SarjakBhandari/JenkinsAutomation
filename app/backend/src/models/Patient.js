// src/models/Patient.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Ensure this path is correct

const Patient = sequelize.define('Patient', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    disease: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Optional: Add any associations or hooks here

module.exports = Patient;