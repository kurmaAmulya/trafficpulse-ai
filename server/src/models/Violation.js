import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  violationNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  vehicleNumber: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true 
  },
  violationType: { 
    type: String, 
    required: true,
    enum: [
      'Speeding',
      'Red Light Jumping',
      'No Helmet',
      'Wrong-Way Driving',
      'Illegal Parking',
      'Triple Riding',
      'Using Mobile Phone',
      'Drunk Driving',
      'Seatbelt Violation'
    ]
  },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  dateTime: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  evidenceUrl: { type: String, default: '' },
  detectedBy: { 
    type: String, 
    enum: ['Citizen Report', 'CCTV AI Camera', 'Speed Radar', 'Patrol Officer'], 
    default: 'Citizen Report' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Verified', 'Rejected'], 
    default: 'Pending' 
  },
  reportedByEmail: { type: String, default: '' },
  reportedByName: { type: String, default: '' },
  reviewedByOfficer: { type: String, default: '' },
  reviewNotes: { type: String, default: '' },
  fineAmount: { type: Number, default: 1000 }
}, { timestamps: true });

export const Violation = mongoose.model('Violation', violationSchema);
