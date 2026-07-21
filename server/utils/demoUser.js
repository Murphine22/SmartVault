const mongoose = require('mongoose');
const User = require('../models/User');
const userStore = require('./userStore');

const DEMO_EMAIL = 'elishaejimofor@gmail.com';
const DEMO_PASSWORD = 'Murphine240891';

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createDemoUser = async () => {
  const normalizedEmail = DEMO_EMAIL.toLowerCase();

  if (isDatabaseReady()) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return existing;
    }

    return User.create({
      name: 'Elisha Ejimofor',
      email: normalizedEmail,
      password: DEMO_PASSWORD,
      role: 'admin',
    });
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
