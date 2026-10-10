import express from 'express';
import { Vehicle } from '../models/Vehicle.js';
import { Violation } from '../models/Violation.js';
import { Fine } from '../models/Fine.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get vehicles (with role-based filtering & search)
// @route   GET /api/vehicles
router.get('/', protect, async (req, res) => {
  try {
    const { search, type } = req.query;
    const { role, email } = req.user;
    const { connected } = getDBStatus();

    let filter = {};

    // Role-based scoping
    if (role === 'owner') {
      filter.ownerEmail = email.toLowerCase();
    } else if (role === 'driver') {
      filter.$or = [
        { linkedDriverEmail: email.toLowerCase() },
        { registrationNumber: req.user.assignedVehicle?.toUpperCase() }
      ];
    } else if (role === 'citizen') {
      // Citizen only sees their own or needs to search
      if (!search) {
        filter.ownerEmail = email.toLowerCase();
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      if (role === 'owner' || role === 'driver') {
        filter.registrationNumber = regex;
      } else {
        filter.$or = [
          { registrationNumber: regex },
          { makeModel: regex },
          { ownerName: regex }
        ];
      }
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (connected) {
      const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: vehicles.length, vehicles });
    }

    // In-Memory store
    let vehicles = [...inMemoryStore.vehicles];

    if (role === 'owner') {
      vehicles = vehicles.filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase());
    } else if (role === 'driver') {
      vehicles = vehicles.filter(v => 
        (v.linkedDriverEmail && v.linkedDriverEmail.toLowerCase() === email.toLowerCase()) ||
        (req.user.assignedVehicle && v.registrationNumber.toUpperCase() === req.user.assignedVehicle.toUpperCase())
      );
    } else if (role === 'citizen' && !search) {
      vehicles = vehicles.filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      vehicles = vehicles.filter(v => 
        v.registrationNumber.toLowerCase().includes(q) ||
        v.makeModel.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q)
      );
    }

    if (type && type !== 'All') {
      vehicles = vehicles.filter(v => v.type.toLowerCase() === type.toLowerCase());
    }

    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single vehicle details with linked fines and violations
// @route   GET /api/vehicles/:plate
router.get('/:plate', protect, async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase();
    const { connected } = getDBStatus();

    let vehicle;
    let violations = [];
    let fines = [];

    if (connected) {
      vehicle = await Vehicle.findOne({ registrationNumber: plate });
      if (vehicle) {
        violations = await Violation.find({ vehicleNumber: plate }).sort({ dateTime: -1 });
        fines = await Fine.find({ vehicleNumber: plate }).sort({ createdAt: -1 });
      }
    } else {
      vehicle = inMemoryStore.vehicles.find(v => v.registrationNumber.toUpperCase() === plate);
      if (vehicle) {
        violations = inMemoryStore.violations.filter(v => v.vehicleNumber.toUpperCase() === plate);
        fines = inMemoryStore.fines.filter(f => f.vehicleNumber.toUpperCase() === plate);
      }
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, message: `Vehicle ${plate} not found in database.` });
    }

    res.json({
      success: true,
      vehicle,
      violations,
      fines,
      pendingFinesCount: fines.filter(f => f.status === 'Pending').length,
      totalPendingAmount: fines.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0)
    });
  } catch (error) {
    console.error('Fetch vehicle by plate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Register a new vehicle
// @route   POST /api/vehicles
router.post('/', protect, async (req, res) => {
  try {
    const {
      registrationNumber,
      makeModel,
      type,
      color,
      ownerName,
      ownerEmail,
      ownerPhone,
      linkedDriverName,
      linkedDriverEmail
    } = req.body;

    if (!registrationNumber || !makeModel) {
      return res.status(400).json({ success: false, message: 'Registration number and Make/Model are required.' });
    }

    const cleanPlate = registrationNumber.trim().toUpperCase();
    const resolvedOwnerEmail = (req.user.role === 'owner') ? req.user.email : (ownerEmail || req.user.email);
    const resolvedOwnerName = (req.user.role === 'owner') ? req.user.name : (ownerName || req.user.name);

    const { connected } = getDBStatus();

    if (connected) {
      const exists = await Vehicle.findOne({ registrationNumber: cleanPlate });
      if (exists) {
        return res.status(400).json({ success: false, message: 'A vehicle with this registration number already exists.' });
      }

      const vehicle = await Vehicle.create({
        registrationNumber: cleanPlate,
        makeModel,
        type: type || 'Car',
        color: color || 'White',
        ownerName: resolvedOwnerName,
        ownerEmail: resolvedOwnerEmail.toLowerCase(),
        ownerPhone: ownerPhone || '',
        linkedDriverName: linkedDriverName || '',
        linkedDriverEmail: linkedDriverEmail ? linkedDriverEmail.toLowerCase() : '',
        insuranceExpiry: new Date(Date.now() + 86400000 * 365),
        pollutionCertExpiry: new Date(Date.now() + 86400000 * 180),
        status: 'Active'
      });

      return res.status(201).json({ success: true, vehicle });
    }

    // In-memory store
    const exists = inMemoryStore.vehicles.find(v => v.registrationNumber.toUpperCase() === cleanPlate);
    if (exists) {
      return res.status(400).json({ success: false, message: 'A vehicle with this registration number already exists.' });
    }

    const newVehicle = {
      _id: `veh_${Date.now()}`,
      registrationNumber: cleanPlate,
      makeModel,
      type: type || 'Car',
      color: color || 'White',
      ownerName: resolvedOwnerName,
      ownerEmail: resolvedOwnerEmail.toLowerCase(),
      ownerPhone: ownerPhone || '',
      linkedDriverName: linkedDriverName || '',
      linkedDriverEmail: linkedDriverEmail ? linkedDriverEmail.toLowerCase() : '',
      registrationDate: new Date(),
      insuranceExpiry: new Date(Date.now() + 86400000 * 365),
      pollutionCertExpiry: new Date(Date.now() + 86400000 * 180),
      status: 'Active'
    };

    inMemoryStore.vehicles.unshift(newVehicle);
    res.status(201).json({ success: true, vehicle: newVehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Link driver to vehicle
// @route   PATCH /api/vehicles/:id/driver
router.patch('/:id/driver', protect, async (req, res) => {
  try {
    const { linkedDriverName, linkedDriverEmail } = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

      vehicle.linkedDriverName = linkedDriverName || '';
      vehicle.linkedDriverEmail = linkedDriverEmail ? linkedDriverEmail.toLowerCase() : '';
      await vehicle.save();
      return res.json({ success: true, vehicle });
    }

    const vehicle = inMemoryStore.vehicles.find(v => v._id === req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    vehicle.linkedDriverName = linkedDriverName || '';
    vehicle.linkedDriverEmail = linkedDriverEmail ? linkedDriverEmail.toLowerCase() : '';
    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
