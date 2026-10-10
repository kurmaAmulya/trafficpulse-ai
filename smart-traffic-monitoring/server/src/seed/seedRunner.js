import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vehicle } from '../models/Vehicle.js';
import { Violation } from '../models/Violation.js';
import { Fine } from '../models/Fine.js';
import { Camera } from '../models/Camera.js';
import { initialUsers, initialVehicles, initialViolations, initialFines, initialCameras } from './seedData.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seeder] Seeding MongoDB with initial hackathon demonstration data...');
      
      // Hash passwords for MongoDB users
      const usersWithHash = await Promise.all(initialUsers.map(async (u) => {
        const { _id, ...rest } = u;
        const salt = await bcrypt.genSalt(10);
        rest.password = await bcrypt.hash(rest.password, salt);
        return rest;
      }));

      await User.insertMany(usersWithHash);

      const cleanVehicles = initialVehicles.map(({ _id, ...v }) => v);
      await Vehicle.insertMany(cleanVehicles);

      const cleanViolations = initialViolations.map(({ _id, ...v }) => v);
      await Violation.insertMany(cleanViolations);

      const cleanFines = initialFines.map(({ _id, ...f }) => f);
      await Fine.insertMany(cleanFines);

      const cleanCameras = initialCameras.map(({ _id, ...c }) => c);
      await Camera.insertMany(cleanCameras);

      console.log('[Seeder] MongoDB successfully seeded with users, vehicles, violations, fines, and cameras!');
    } else {
      console.log(`[Seeder] MongoDB already initialized with ${userCount} users.`);
    }
  } catch (error) {
    console.warn('[Seeder] Notice during database seeding:', error.message);
  }
};
