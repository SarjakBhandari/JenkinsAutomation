const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database/connection.js');
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
  labelNames: ['path'],
});

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const LOG_PATH = path.join(__dirname, 'metrics.log');

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

// Request counter middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});


app.post('/metrics-client', (req, res) => {
  const { event, value, context } = req.body;

  if (event === 'frontend_route_change' && context?.path) {
    frontendRouteCounter.inc({ path: context.path }, value || 1);
  }

  fs.appendFileSync(LOG_PATH, JSON.stringify({ event, value, context, timestamp: new Date().toISOString() }) + '\n');
  res.status(200).send({ status: 'ok' });
});


app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const connectWithRetry = async (retries = 20, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.sync();
      console.log('Connected to DB');
      app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
      return;
    } catch (err) {
      console.error(`DB connect failed (attempt ${i + 1}):`, err.message);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error(' Could not connect to DB after retries');
  process.exit(1);
};

connectWithRetry();
