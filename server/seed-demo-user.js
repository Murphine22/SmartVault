const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { seedDemoUser, getDemoCredentials } = require('./utils/demoUserSeed');

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smartvault';

const run = async () => {
  try {
    const credentials = getDemoCredentials();
    console.log('Demo seed config:');
    console.log('  email:', credentials.email);
    console.log('  name:', credentials.name);
    console.log('  role:', credentials.role);
    console.log('  db uri:', uri.replace(/:[^:@\\]+@/, ':****@'));

    const connected = await connectDB();
    if (!connected) {
      throw new Error('MongoDB connection failed. Seed script cannot continue.');
    }

    await seedDemoUser();
    console.log('Demo user seed completed successfully.');
  } catch (error) {
    console.error('Demo user seed failed:', error.message || error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
