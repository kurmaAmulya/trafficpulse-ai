import express from 'express';
import { Camera } from '../models/Camera.js';
import { Violation } from '../models/Violation.js';
import { Fine } from '../models/Fine.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all CCTV cameras and live demo states
// @route   GET /api/cameras
router.get('/', protect, async (req, res) => {
  try {
    const { connected } = getDBStatus();
    if (connected) {
      const cameras = await Camera.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: cameras.length, cameras });
    }

    res.json({ success: true, count: inMemoryStore.cameras.length, cameras: inMemoryStore.cameras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Simulate real-time CCTV AI detection event (DEMO ONLY)
// @route   POST /api/cameras/trigger-detection
router.post('/trigger-detection', protect, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { cameraId, vehicleNumber, violationType, speed } = req.body;
    const { connected } = getDBStatus();

    const plate = (vehicleNumber || 'DL-01-AB-1234').toUpperCase();
    const type = violationType || 'Speeding';
    const detectedSpeed = speed || Math.floor(75 + Math.random() * 25);
    const violationNumber = `VIO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const detectionRecord = {
      plate,
      violation: `${type} (${detectedSpeed} km/h)`,
      confidence: Number((94 + Math.random() * 5).toFixed(1)),
      timestamp: new Date(),
      speed: detectedSpeed
    };

    // Create corresponding violation in system
    const violationData = {
      violationNumber,
      vehicleNumber: plate,
      violationType: type,
      location: 'Janpath - Connaught Place Outer Circle, New Delhi',
      coordinates: { lat: 28.6256, lng: 77.2185 },
      dateTime: new Date(),
      description: `[SIMULATED AI DETECTION - DEMO] Camera captured ${plate} exceeding speed limit at ${detectedSpeed} km/h (Limit: 50 km/h). Optical plate OCR confidence: ${detectionRecord.confidence}%.`,
      evidenceUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      detectedBy: 'CCTV AI Camera',
      status: 'Pending',
      reportedByEmail: 'cctv.ai@traffic.gov',
      reportedByName: 'Smart CCTV Camera CAM-ND-01 (Simulated)',
      fineAmount: 2000,
      createdAt: new Date()
    };

    if (connected) {
      await Violation.create(violationData);
      const cam = await Camera.findOne({ cameraId: cameraId || 'CAM-ND-01' });
      if (cam) {
        cam.lastPlateDetected = plate;
        cam.speedDetectedKmH = detectedSpeed;
        cam.recentDetections.unshift(detectionRecord);
        if (cam.recentDetections.length > 10) cam.recentDetections.pop();
        await cam.save();
      }
    } else {
      inMemoryStore.violations.unshift({ _id: `vio_${Date.now()}`, ...violationData });
      const cam = inMemoryStore.cameras.find(c => c.cameraId === (cameraId || 'CAM-ND-01'));
      if (cam) {
        cam.lastPlateDetected = plate;
        cam.speedDetectedKmH = detectedSpeed;
        cam.recentDetections.unshift(detectionRecord);
        if (cam.recentDetections.length > 10) cam.recentDetections.pop();
      }
    }

    res.json({
      success: true,
      message: 'Simulated AI camera detection successfully processed and queued for officer review!',
      detection: detectionRecord,
      violationNumber
    });
  } catch (error) {
    console.error('Trigger camera detection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
