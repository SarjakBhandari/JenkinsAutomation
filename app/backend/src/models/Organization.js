// src/models/Organization.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Ensure this path is correct

const Organization = sequelize.define('Organization', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Optional: Add any associations or hooks here

module.exports = Organization;