const mongoose = require('mongoose');
const User = require('../models/User');
const userStore = require('./userStore');

const DEMO_EMAIL = 'elishaejimofor@gmail.com';
const DEMO_PASSWORD = 'Murphine22';

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createDemoUser = async () => {
  const normalizedEmail = DEMO_EMAIL.toLowerCase();

  if (isDatabaseReady()) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return existing;
    }

    return User.create({
      name: 'Demo User',
      email: normalizedEmail,
      password: DEMO_PASSWORD,
      role: 'user',
    });
  }

  const existing = await userStore.findUserByEmail(normalizedEmail);
  if (existing) {
    return existing;
  }

  return userStore.createUser({
    name: 'Demo User',
    email: normalizedEmail,
    password: DEMO_PASSWORD,
    role: 'user',
  });
};

module.exports = {
  createDemoUser,
  DEMO_EMAIL,
  DEMO_PASSWORD,
};
