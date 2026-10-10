import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'hackathon_smart_traffic_jwt_secret_key_2026_super_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, badgeNumber, assignedVehicle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'citizen',
        phone: phone || '',
        badgeNumber: badgeNumber || '',
        assignedVehicle: assignedVehicle || ''
      });

      return res.status(201).json({
        success: true,
        token: generateToken(user),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          badgeNumber: user.badgeNumber,
          assignedVehicle: user.assignedVehicle
        }
      });
    } else {
      // In-memory
      const existing = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'citizen',
        phone: phone || '',
        badgeNumber: badgeNumber || '',
        assignedVehicle: assignedVehicle || ''
      };
      inMemoryStore.users.push(newUser);

      return res.status(201).json({
        success: true,
        token: generateToken(newUser),
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          badgeNumber: newUser.badgeNumber,
          assignedVehicle: newUser.assignedVehicle
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          token: generateToken(user),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            badgeNumber: user.badgeNumber,
            assignedVehicle: user.assignedVehicle,
            avatar: user.avatar
          }
        });
      }
    }

    // Check in-memory store
    const user = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch || password === 'password123') { // Hackathon demo fallback
        return res.json({
          success: true,
          token: generateToken(user),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            badgeNumber: user.badgeNumber,
            assignedVehicle: user.assignedVehicle,
            avatar: user.avatar
          }
        });
      }
    }

    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// @desc    Get pre-configured demo profiles for 1-click role switcher
// @route   GET /api/auth/demo-users
router.get('/demo-users', (req, res) => {
  const sanitized = inMemoryStore.users.map(({ password, ...u }) => ({
    ...u,
    loginEmail: u.email,
    defaultPassword: 'password123'
  }));

  res.json({
    success: true,
    demoUsers: sanitized
  });
});

export default router;
