// src/server.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection.js'); // Updated database connection
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const organizationRoutes = require('./routes/organizationRoutes.js');
const appointmentRoutes = require('./routes/appointmentRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const doctorRoutes = require('./routes/doctorRoutes.js');
const { verifyToken } = require('./middleware/authMiddleware.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Authentication routes (no token required)
app.use('/api/auth', authRoutes);

// Protected routes (token required)
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/organization', verifyToken, organizationRoutes);
app.use('/api/appointment', verifyToken, appointmentRoutes);
app.use('/api/patient', verifyToken, patientRoutes);
app.use('/api/staff', verifyToken, staffRoutes);
app.use('/api/doctor', verifyToken, doctorRoutes);

// Sync database and start server
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });