// src/models/Staff.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Ensure this path is correct

const Staff = sequelize.define('Staff', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Staff;