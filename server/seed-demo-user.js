const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || 'elishaejimofor@gmail.com';
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Murphine240891';
const DEMO_USER_NAME = process.env.DEMO_USER_NAME || 'Elisha Ejimofor';
const DEMO_USER_ROLE = process.env.DEMO_USER_ROLE || 'admin';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smartvault';

const connect = async () => {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for demo seeding.');
};

const createDemoUser = async () => {
  const normalizedEmail = DEMO_USER_EMAIL.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    console.log(`Demo user already exists: ${normalizedEmail}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
  const user = new User({
    name: DEMO_USER_NAME,
    email: normalizedEmail,
    password: hashedPassword,
    role: DEMO_USER_ROLE,
    authProvider: 'local',
  });

  await user.save();
  console.log(`Demo user created: ${normalizedEmail}`);
  return user;
};

const run = async () => {
  try {
    console.log('Demo seed config:');
    console.log('  email:', DEMO_USER_EMAIL);
    console.log('  name:', DEMO_USER_NAME);
    console.log('  role:', DEMO_USER_ROLE);
    console.log('  db uri:', uri.replace(/:[^:@\\]+@/, ':****@'));

    await connect();
    await createDemoUser();
  } catch (error) {
    console.error('Demo user seed failed:', error.message || error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
