const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || 'elishaejimofor@gmail.com';
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Murphine240891';
const DEMO_USER_NAME = process.env.DEMO_USER_NAME || 'Elisha Ejimofor';
const DEMO_USER_ROLE = process.env.DEMO_USER_ROLE || 'admin';

const getDemoCredentials = () => ({
  email: DEMO_USER_EMAIL.toLowerCase(),
  password: DEMO_USER_PASSWORD,
  name: DEMO_USER_NAME,
  role: DEMO_USER_ROLE,
});

const ensureDatabaseConnected = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected; demo user seeding requires an active database connection.');
  }
};

const seedDemoUser = async () => {
  ensureDatabaseConnected();

  const { email, password, name, role } = getDemoCredentials();
  const existing = await User.findOne({ email });

  if (existing) {
    const passwordMatches = await existing.matchPassword(password);
    if (passwordMatches && existing.authProvider === 'local') {
      console.log(`Demo user already exists and password is valid: ${email}`);
      return existing;
    }

    existing.password = password;
    existing.authProvider = 'local';
    existing.role = role === 'admin' ? 'admin' : 'user';
    existing.name = name;
    await existing.save();

    console.log(`Demo user updated with provided credentials: ${email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'user',
    authProvider: 'local',
  });

  await user.save();
  console.log(`Demo user created: ${email}`);
  return user;
};

module.exports = {
  seedDemoUser,
  getDemoCredentials,
};
