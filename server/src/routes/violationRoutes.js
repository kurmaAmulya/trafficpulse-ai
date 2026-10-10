import express from 'express';
import { Violation } from '../models/Violation.js';
import { Fine } from '../models/Fine.js';
import { Vehicle } from '../models/Vehicle.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const fineRates = {
  'Speeding': 2000,
  'Red Light Jumping': 1000,
  'No Helmet': 1000,
  'Wrong-Way Driving': 5000,
  'Illegal Parking': 1500,
  'Triple Riding': 1000,
  'Using Mobile Phone': 1500,
  'Drunk Driving': 10000,
  'Seatbelt Violation': 1000
};

// @desc    Get violations with filters and role constraints
// @route   GET /api/violations
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, vehicleNumber, myReports, search } = req.query;
    const { role, email } = req.user;
    const { connected } = getDBStatus();

    let filter = {};

    if (myReports === 'true' || role === 'citizen') {
      filter.reportedByEmail = email.toLowerCase();
    } else if (role === 'owner') {
      // Find plates owned by user
      let plates = [];
      if (connected) {
        const owned = await Vehicle.find({ ownerEmail: email.toLowerCase() });
        plates = owned.map(v => v.registrationNumber);
      } else {
        plates = inMemoryStore.vehicles
          .filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase())
          .map(v => v.registrationNumber);
      }
      filter.vehicleNumber = { $in: plates };
    } else if (role === 'driver') {
      let plates = [];
      if (connected) {
        const driven = await Vehicle.find({
          $or: [
            { linkedDriverEmail: email.toLowerCase() },
            { registrationNumber: req.user.assignedVehicle?.toUpperCase() }
          ]
        });
        plates = driven.map(v => v.registrationNumber);
      } else {
        plates = inMemoryStore.vehicles
          .filter(v => 
            (v.linkedDriverEmail && v.linkedDriverEmail.toLowerCase() === email.toLowerCase()) ||
            (req.user.assignedVehicle && v.registrationNumber.toUpperCase() === req.user.assignedVehicle.toUpperCase())
          )
          .map(v => v.registrationNumber);
      }
      filter.vehicleNumber = { $in: plates };
    }

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (type && type !== 'All') {
      filter.violationType = type;
    }
    if (vehicleNumber) {
      filter.vehicleNumber = vehicleNumber.toUpperCase();
    }

    if (connected) {
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { vehicleNumber: regex },
          { violationNumber: regex },
          { location: regex },
          { description: regex }
        ];
      }
      const violations = await Violation.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: violations.length, violations });
    }

    // In-memory filter logic
    let violations = [...inMemoryStore.violations];

    if (myReports === 'true' || role === 'citizen') {
      violations = violations.filter(v => v.reportedByEmail?.toLowerCase() === email.toLowerCase());
    } else if (role === 'owner') {
      const ownedPlates = inMemoryStore.vehicles
        .filter(v => v.ownerEmail.toLowerCase() === email.toLowerCase())
        .map(v => v.registrationNumber.toUpperCase());
      violations = violations.filter(v => ownedPlates.includes(v.vehicleNumber.toUpperCase()));
    } else if (role === 'driver') {
      const driverPlates = inMemoryStore.vehicles
        .filter(v => 
          (v.linkedDriverEmail && v.linkedDriverEmail.toLowerCase() === email.toLowerCase()) ||
          (req.user.assignedVehicle && v.registrationNumber.toUpperCase() === req.user.assignedVehicle.toUpperCase())
        )
        .map(v => v.registrationNumber.toUpperCase());
      violations = violations.filter(v => driverPlates.includes(v.vehicleNumber.toUpperCase()));
    }

    if (status && status !== 'All') {
      violations = violations.filter(v => v.status === status);
    }
    if (type && type !== 'All') {
      violations = violations.filter(v => v.violationType === type);
    }
    if (vehicleNumber) {
      violations = violations.filter(v => v.vehicleNumber.toUpperCase().includes(vehicleNumber.toUpperCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      violations = violations.filter(v =>
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.violationNumber.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: violations.length, violations });
  } catch (error) {
    console.error('Fetch violations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit a new violation report (Citizens, Officers, Radar)
// @route   POST /api/violations
router.post('/', protect, upload.single('evidenceImage'), async (req, res) => {
  try {
    const {
      vehicleNumber,
      violationType,
      location,
      dateTime,
      description,
      detectedBy,
      coordinates
    } = req.body;

    if (!vehicleNumber || !violationType || !location) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle registration number, violation type, and location are required.'
      });
    }

    const cleanPlate = vehicleNumber.trim().toUpperCase();
    let evidenceUrl = '';

    if (req.file) {
      evidenceUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.evidenceUrl) {
      evidenceUrl = req.body.evidenceUrl;
    } else {
      // Fallback clean traffic evidence stock image
      evidenceUrl = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';
    }

    let parsedCoords = { lat: 28.6139, lng: 77.2090 };
    if (coordinates) {
      try {
        parsedCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      } catch (e) {
        // use fallback
      }
    }

    const violationNumber = `VIO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const standardFine = fineRates[violationType] || 1000;
    const { connected } = getDBStatus();

    // Auto-verify if reported by Patrol Officer
    const initialStatus = (req.user.role === 'officer' || req.user.role === 'admin') ? 'Verified' : 'Pending';

    const violationData = {
      violationNumber,
      vehicleNumber: cleanPlate,
      violationType,
      location,
      coordinates: parsedCoords,
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      description: description || '',
      evidenceUrl,
      detectedBy: detectedBy || (req.user.role === 'officer' ? 'Patrol Officer' : 'Citizen Report'),
      status: initialStatus,
      reportedByEmail: req.user.email.toLowerCase(),
      reportedByName: req.user.name,
      reviewedByOfficer: initialStatus === 'Verified' ? req.user.name : '',
      reviewNotes: initialStatus === 'Verified' ? 'Instantly verified by officer report.' : '',
      fineAmount: standardFine,
      createdAt: new Date()
    };

    if (connected) {
      const createdViolation = await Violation.create(violationData);

      // If auto-verified by officer, generate Fine immediately
      if (initialStatus === 'Verified') {
        const vehicle = await Vehicle.findOne({ registrationNumber: cleanPlate });
        await Fine.create({
          fineNumber: `CHL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          violationNumber: createdViolation.violationNumber,
          vehicleNumber: cleanPlate,
          ownerName: vehicle ? vehicle.ownerName : 'Vehicle Owner',
          ownerEmail: vehicle ? vehicle.ownerEmail : 'unknown@citizen.in',
          linkedDriverEmail: vehicle ? vehicle.linkedDriverEmail : '',
          violationType,
          location,
          amount: standardFine,
          dueDate: new Date(Date.now() + 86400000 * 15),
          status: 'Pending'
        });
      }

      return res.status(201).json({ success: true, violation: createdViolation });
    }

    // In-memory store
    const newViolation = {
      _id: `vio_${Date.now()}`,
      ...violationData
    };
    inMemoryStore.violations.unshift(newViolation);

    if (initialStatus === 'Verified') {
      const vehicle = inMemoryStore.vehicles.find(v => v.registrationNumber.toUpperCase() === cleanPlate);
      inMemoryStore.fines.unshift({
        _id: `fin_${Date.now()}`,
        fineNumber: `CHL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        violationNumber: newViolation.violationNumber,
        vehicleNumber: cleanPlate,
        ownerName: vehicle ? vehicle.ownerName : 'Vehicle Owner',
        ownerEmail: vehicle ? vehicle.ownerEmail : 'unknown@citizen.in',
        linkedDriverEmail: vehicle ? vehicle.linkedDriverEmail : '',
        violationType,
        location,
        amount: standardFine,
        dueDate: new Date(Date.now() + 86400000 * 15),
        status: 'Pending',
        paymentDate: null,
        transactionRef: '',
        paymentMethod: ''
      });
    }

    res.status(201).json({ success: true, violation: newViolation });
  } catch (error) {
    console.error('Create violation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update violation status (Officer Review Workflow: Under Review, Verified, Rejected)
// @route   PATCH /api/violations/:id/status
router.patch('/:id/status', protect, authorize('officer', 'admin'), async (req, res) => {
  try {
    const { status, reviewNotes, fineAmount } = req.body;

    if (!['Pending', 'Under Review', 'Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition.' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const violation = await Violation.findById(req.params.id);
      if (!violation) {
        return res.status(404).json({ success: false, message: 'Violation report not found.' });
      }

      violation.status = status;
      violation.reviewedByOfficer = req.user.name;
      if (reviewNotes !== undefined) violation.reviewNotes = reviewNotes;
      if (fineAmount) violation.fineAmount = Number(fineAmount);

      await violation.save();

      // If status transitioned to 'Verified', ensure corresponding Fine is generated
      if (status === 'Verified') {
        const existingFine = await Fine.findOne({ violationNumber: violation.violationNumber });
        if (!existingFine) {
          const vehicle = await Vehicle.findOne({ registrationNumber: violation.vehicleNumber });
          await Fine.create({
            fineNumber: `CHL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            violationNumber: violation.violationNumber,
            vehicleNumber: violation.vehicleNumber,
            ownerName: vehicle ? vehicle.ownerName : 'Registered Owner',
            ownerEmail: vehicle ? vehicle.ownerEmail : 'unknown@citizen.in',
            linkedDriverEmail: vehicle ? vehicle.linkedDriverEmail : '',
            violationType: violation.violationType,
            location: violation.location,
            amount: violation.fineAmount || fineRates[violation.violationType] || 1000,
            dueDate: new Date(Date.now() + 86400000 * 15),
            status: 'Pending'
          });
        }
      }

      return res.json({ success: true, violation });
    }

    // In-memory update
    const violation = inMemoryStore.violations.find(v => v._id === req.params.id);
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation report not found.' });
    }

    violation.status = status;
    violation.reviewedByOfficer = req.user.name;
    if (reviewNotes !== undefined) violation.reviewNotes = reviewNotes;
    if (fineAmount) violation.fineAmount = Number(fineAmount);

    if (status === 'Verified') {
      const existingFine = inMemoryStore.fines.find(f => f.violationNumber === violation.violationNumber);
      if (!existingFine) {
        const vehicle = inMemoryStore.vehicles.find(v => v.registrationNumber.toUpperCase() === violation.vehicleNumber.toUpperCase());
        inMemoryStore.fines.unshift({
          _id: `fin_${Date.now()}`,
          fineNumber: `CHL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          violationNumber: violation.violationNumber,
          vehicleNumber: violation.vehicleNumber,
          ownerName: vehicle ? vehicle.ownerName : 'Registered Owner',
          ownerEmail: vehicle ? vehicle.ownerEmail : 'unknown@citizen.in',
          linkedDriverEmail: vehicle ? vehicle.linkedDriverEmail : '',
          violationType: violation.violationType,
          location: violation.location,
          amount: violation.fineAmount || fineRates[violation.violationType] || 1000,
          dueDate: new Date(Date.now() + 86400000 * 15),
          status: 'Pending',
          paymentDate: null,
          transactionRef: '',
          paymentMethod: ''
        });
      }
    }

    res.json({ success: true, violation });
  } catch (error) {
    console.error('Review violation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
