import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabaseIfEmpty } from './seed/seedRunner.js';

import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import cameraRoutes from './routes/cameraRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded evidence static files
app.use('/uploads', express.static(path.resolve('uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/stats', statsRoutes);

// System Health & DB Mode indicator
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Smart Traffic Monitoring API',
    database: getDBStatus()
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Traffic Monitoring and Violation Management API is operational.',
    documentation: '/api/health'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Boot server and connect DB
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedDatabaseIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Traffic Management Server running on port ${PORT}`);
    console.log(` Database Mode: ${getDBStatus().mode}`);
    console.log(` Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();
