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
const client = require('prom-client');
client.collectDefaultMetrics();

const frontendRouteCounter = new client.Counter({
  name: 'frontend_route_change_total',
  help: 'Total route changes in frontend',
  labelNames: ['path']
});


const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
})

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
// Metrics endpoint for Prometheus

app.post('/metrics-client', (req, res) => {
  const { metric, value, labels } = req.body;

  if (metric === 'frontend_route_change') {
    frontendRouteCounter.inc(labels, value);
  }

  res.sendStatus(200);
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Request counter middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  next();
});


sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });