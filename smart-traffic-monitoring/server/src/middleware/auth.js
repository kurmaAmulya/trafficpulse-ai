import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getDBStatus } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackathon_smart_traffic_jwt_secret_key_2026_super_secure');
      
      const { connected } = getDBStatus();
      let user;

      if (connected) {
        user = await User.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        user = inMemoryStore.users.find(u => u._id === decoded.id || u.email === decoded.email);
        if (user) {
          const { password, ...rest } = user;
          user = rest;
        }
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or authorization revoked.' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Authorization token required.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your current role is '${req.user?.role || 'Guest'}'.`
      });
    }
    next();
  };
};
