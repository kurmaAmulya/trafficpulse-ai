import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  fineNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  violationNumber: { type: String, required: true },
  vehicleNumber: { type: String, required: true, uppercase: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true },
  linkedDriverEmail: { type: String, default: '', lowercase: true },
  violationType: { type: String, required: true },
  location: { type: String, default: '' },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Disputed'], 
    default: 'Pending' 
  },
  paymentDate: { type: Date },
  transactionRef: { type: String, default: '' },
  paymentMethod: { type: String, default: '' }
}, { timestamps: true });

export const Fine = mongoose.model('Fine', fineSchema);
