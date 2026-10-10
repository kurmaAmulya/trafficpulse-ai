import { initialUsers, initialVehicles, initialViolations, initialFines, initialCameras } from '../seed/seedData.js';
import bcrypt from 'bcryptjs';

// Deep clone helper
const clone = (data) => JSON.parse(JSON.stringify(data));

class Store {
  constructor() {
    this.users = [];
    this.vehicles = [];
    this.violations = [];
    this.fines = [];
    this.cameras = [];
    this.init();
  }

  async init() {
    // Hash default passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    this.users = initialUsers.map(u => ({ ...u, password: hashedPass }));
    this.vehicles = clone(initialVehicles);
    this.violations = clone(initialViolations);
    this.fines = clone(initialFines);
    this.cameras = clone(initialCameras);
    console.log('[Store] In-Memory traffic registry initialized with sample seed data.');
  }

  reset() {
    this.init();
  }
}

export const inMemoryStore = new Store();
