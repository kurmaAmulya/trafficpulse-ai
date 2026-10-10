import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  makeModel: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Car', 'Motorcycle', 'Truck', 'Bus', 'Auto-Rickshaw', 'EV'], 
    default: 'Car' 
  },
  color: { type: String, default: 'White' },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true },
  ownerPhone: { type: String, default: '' },
  linkedDriverName: { type: String, default: '' },
  linkedDriverEmail: { type: String, default: '', lowercase: true },
  registrationDate: { type: Date, default: Date.now },
  insuranceExpiry: { type: Date },
  pollutionCertExpiry: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Blacklisted', 'Stolen'], 
    default: 'Active' 
  }
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
