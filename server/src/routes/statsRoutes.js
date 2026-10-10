import express from 'express';
import { Vehicle } from '../models/Vehicle.js';
import { Violation } from '../models/Violation.js';
import { Fine } from '../models/Fine.js';
import { Camera } from '../models/Camera.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get dashboard metrics tailored by role
// @route   GET /api/stats/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const { role, email } = req.user;
    const { connected } = getDBStatus();

    let allVehicles = [];
    let allViolations = [];
    let allFines = [];
    let allCameras = [];

    if (connected) {
      allVehicles = await Vehicle.find();
      allViolations = await Violation.find();
      allFines = await Fine.find();
      allCameras = await Camera.find();
    } else {
      allVehicles = inMemoryStore.vehicles;
      allViolations = inMemoryStore.violations;
      allFines = inMemoryStore.fines;
      allCameras = inMemoryStore.cameras;
    }

    if (role === 'admin' || role === 'officer') {
      const totalVehicles = allVehicles.length;
      const totalViolations = allViolations.length;
      const pendingReviews = allViolations.filter(v => v.status === 'Pending' || v.status === 'Under Review').length;
      const verifiedViolations = allViolations.filter(v => v.status === 'Verified').length;
      const rejectedViolations = allViolations.filter(v => v.status === 'Rejected').length;

      const totalFinesIssued = allFines.reduce((sum, f) => sum + f.amount, 0);
      const totalFinesCollected = allFines.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
      const totalFinesPending = allFines.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);

      // Violation types breakdown
      const typeCounts = {};
      allViolations.forEach(v => {
        typeCounts[v.violationType] = (typeCounts[v.violationType] || 0) + 1;
      });
      const typeBreakdown = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

      // Status breakdown
      const statusBreakdown = [
        { name: 'Pending', count: allViolations.filter(v => v.status === 'Pending').length, color: '#f59e0b' },
        { name: 'Under Review', count: allViolations.filter(v => v.status === 'Under Review').length, color: '#3b82f6' },
        { name: 'Verified', count: verifiedViolations, color: '#10b981' },
        { name: 'Rejected', count: rejectedViolations, color: '#ef4444' }
      ];

      return res.json({
        success: true,
        role,
        dbStatus: getDBStatus(),
        metrics: {
          totalVehicles,
          totalViolations,
          pendingReviews,
          verifiedViolations,
          totalFinesIssued,
          totalFinesCollected,
          totalFinesPending,
          activeCameras: allCameras.filter(c => c.status === 'Active').length
        },
        typeBreakdown,
        statusBreakdown,
        recentViolations: allViolations.slice(0, 5),
        recentFines: allFines.slice(0, 5)
      });
    }

    if (role === 'owner') {
      const myVehicles = allVehicles.filter(v => v.ownerEmail?.toLowerCase() === email.toLowerCase());
      const myPlates = myVehicles.map(v => v.registrationNumber.toUpperCase());
      const myViolations = allViolations.filter(v => myPlates.includes(v.vehicleNumber.toUpperCase()));
      const myFines = allFines.filter(f => myPlates.includes(f.vehicleNumber.toUpperCase()) || f.ownerEmail?.toLowerCase() === email.toLowerCase());

      const pendingFines = myFines.filter(f => f.status === 'Pending');
      const paidFines = myFines.filter(f => f.status === 'Paid');

      return res.json({
        success: true,
        role,
        dbStatus: getDBStatus(),
        metrics: {
          myVehiclesCount: myVehicles.length,
          myViolationsCount: myViolations.length,
          pendingFinesCount: pendingFines.length,
          pendingFinesAmount: pendingFines.reduce((sum, f) => sum + f.amount, 0),
          paidFinesAmount: paidFines.reduce((sum, f) => sum + f.amount, 0)
        },
        myVehicles,
        recentViolations: myViolations.slice(0, 5),
        recentFines: myFines.slice(0, 5)
      });
    }

    if (role === 'driver') {
      const drivenVehicles = allVehicles.filter(v =>
        (v.linkedDriverEmail && v.linkedDriverEmail.toLowerCase() === email.toLowerCase()) ||
        (req.user.assignedVehicle && v.registrationNumber.toUpperCase() === req.user.assignedVehicle.toUpperCase())
      );
      const drivenPlates = drivenVehicles.map(v => v.registrationNumber.toUpperCase());
      const myViolations = allViolations.filter(v => drivenPlates.includes(v.vehicleNumber.toUpperCase()));
      const myFines = allFines.filter(f => drivenPlates.includes(f.vehicleNumber.toUpperCase()));

      return res.json({
        success: true,
        role,
        dbStatus: getDBStatus(),
        metrics: {
          assignedVehiclesCount: drivenVehicles.length,
          recordedViolationsCount: myViolations.length,
          activeFinesCount: myFines.filter(f => f.status === 'Pending').length
        },
        assignedVehicles: drivenVehicles,
        recentViolations: myViolations.slice(0, 5),
        recentFines: myFines.slice(0, 5)
      });
    }

    // Role: citizen
    const myReports = allViolations.filter(v => v.reportedByEmail?.toLowerCase() === email.toLowerCase());
    const verifiedReports = myReports.filter(v => v.status === 'Verified');
    const pendingReports = myReports.filter(v => v.status === 'Pending' || v.status === 'Under Review');

    return res.json({
      success: true,
      role,
      dbStatus: getDBStatus(),
      metrics: {
        totalReported: myReports.length,
        verifiedReports: verifiedReports.length,
        pendingReports: pendingReports.length,
        civicPoints: verifiedReports.length * 50
      },
      recentReports: myReports.slice(0, 5)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
