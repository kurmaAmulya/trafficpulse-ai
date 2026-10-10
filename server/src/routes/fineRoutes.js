import express from 'express';
import { Fine } from '../models/Fine.js';
import { Vehicle } from '../models/Vehicle.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get fines with role-based scoping
// @route   GET /api/fines
router.get('/', protect, async (req, res) => {
  try {
    const { status, vehicleNumber, search } = req.query;
    const { role, email } = req.user;
    const { connected } = getDBStatus();

    let filter = {};

    if (role === 'owner') {
      filter.ownerEmail = email.toLowerCase();
    } else if (role === 'driver') {
      filter.$or = [
        { linkedDriverEmail: email.toLowerCase() },
        { vehicleNumber: req.user.assignedVehicle?.toUpperCase() }
      ];
    } else if (role === 'citizen') {
      // Find vehicles owned by citizen
      if (connected) {
        const owned = await Vehicle.find({ ownerEmail: email.toLowerCase() });
        filter.vehicleNumber = { $in: owned.map(v => v.registrationNumber) };
      } else {
        const plates = inMemoryStore.vehicles
          .filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase())
          .map(v => v.registrationNumber.toUpperCase());
        filter.vehicleNumber = { $in: plates };
      }
    }

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (vehicleNumber) {
      filter.vehicleNumber = vehicleNumber.toUpperCase();
    }

    if (connected) {
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { fineNumber: regex },
          { vehicleNumber: regex },
          { violationNumber: regex },
          { violationType: regex }
        ];
      }
      const fines = await Fine.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: fines.length, fines });
    }

    // In-memory fallback
    let fines = [...inMemoryStore.fines];

    if (role === 'owner') {
      fines = fines.filter(f => f.ownerEmail?.toLowerCase() === email.toLowerCase());
    } else if (role === 'driver') {
      fines = fines.filter(f =>
        (f.linkedDriverEmail && f.linkedDriverEmail.toLowerCase() === email.toLowerCase()) ||
        (req.user.assignedVehicle && f.vehicleNumber.toUpperCase() === req.user.assignedVehicle.toUpperCase())
      );
    } else if (role === 'citizen') {
      const ownedPlates = inMemoryStore.vehicles
        .filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase())
        .map(v => v.registrationNumber.toUpperCase());
      fines = fines.filter(f => ownedPlates.includes(f.vehicleNumber.toUpperCase()));
    }

    if (status && status !== 'All') {
      fines = fines.filter(f => f.status === status);
    }
    if (vehicleNumber) {
      fines = fines.filter(f => f.vehicleNumber.toUpperCase().includes(vehicleNumber.toUpperCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      fines = fines.filter(f =>
        f.fineNumber.toLowerCase().includes(q) ||
        f.vehicleNumber.toLowerCase().includes(q) ||
        f.violationType.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: fines.length, fines });
  } catch (error) {
    console.error('Fetch fines error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Simulate online fine payment (Instant Hackathon Demo)
// @route   POST /api/fines/:id/pay
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentMethod = 'UPI' } = req.body;
    const { connected } = getDBStatus();
    const txnRef = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (connected) {
      const fine = await Fine.findById(req.params.id);
      if (!fine) return res.status(404).json({ success: false, message: 'Challan record not found.' });

      if (fine.status === 'Paid') {
        return res.status(400).json({ success: false, message: 'This challan is already settled and paid.' });
      }

      fine.status = 'Paid';
      fine.paymentDate = new Date();
      fine.transactionRef = txnRef;
      fine.paymentMethod = paymentMethod;

      await fine.save();
      return res.json({ success: true, message: 'Fine paid successfully!', fine });
    }

    // In-memory update
    const fine = inMemoryStore.fines.find(f => f._id === req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Challan record not found.' });

    if (fine.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This challan is already settled and paid.' });
    }

    fine.status = 'Paid';
    fine.paymentDate = new Date();
    fine.transactionRef = txnRef;
    fine.paymentMethod = paymentMethod;

    res.json({ success: true, message: 'Fine paid successfully! (Demo Settlement)', fine });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
