const mongoose = require('mongoose');
const User = require('../models/User');
const userStore = require('./userStore');

const DEMO_EMAIL = 'elishaejimofor@gmail.com';
const DEMO_PASSWORD = 'Murphine240891';

const isDatabaseReady = () => mongoose.connection.readyState === 1 && !!mongoose.connection.db;

const createDemoUser = async () => {
  const normalizedEmail = DEMO_EMAIL.toLowerCase();

  if (isDatabaseReady()) {
    try {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        if (existing.role !== 'admin') {
          existing.role = 'admin';
          existing.name = 'Elisha Ejimofor';
          existing.password = DEMO_PASSWORD;
          await existing.save();
        }
        return existing;
      }

      return User.create({
        name: 'Elisha Ejimofor',
        email: normalizedEmail,
        password: DEMO_PASSWORD,
        role: 'admin',
      });
    } catch (error) {
      console.warn('MongoDB demo user seeding failed, using in-memory store:', error.message);
    }
  }

  const existing = await userStore.findUserByEmail(normalizedEmail);
  if (existing) {
    return existing;
  }

  return userStore.createUser({
    name: 'Elisha Ejimofor',
    email: normalizedEmail,
    password: DEMO_PASSWORD,
    role: 'admin',
  });
};

module.exports = {
  createDemoUser,
  DEMO_EMAIL,
  DEMO_PASSWORD,
};
