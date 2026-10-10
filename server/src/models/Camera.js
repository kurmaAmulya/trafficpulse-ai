import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  cameraId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  locationName: { type: String, required: true },
  zone: { type: String, default: 'Zone A' },
  status: { type: String, enum: ['Active', 'Warning', 'Offline'], default: 'Active' },
  fps: { type: Number, default: 30 },
  resolution: { type: String, default: '1080p 60fps' },
  aiModel: { type: String, default: 'YOLOv11-Traffic-Demo' },
  isDemoSimulation: { type: Boolean, default: true },
  lastPlateDetected: { type: String, default: 'DL-01-AB-1234' },
  speedDetectedKmH: { type: Number, default: 62 },
  recentDetections: [{
    plate: String,
    violation: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now },
    speed: Number
  }]
}, { timestamps: true });

export const Camera = mongoose.model('Camera', cameraSchema);
