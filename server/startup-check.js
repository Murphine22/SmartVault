const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smartvault';
console.log('SmartVault startup check');
console.log('Using MongoDB URI:', uri.replace(/:[^:@\/]+@/, ':****@'));

const run = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('MongoDB connection failed.');
    process.exit(1);
  }

  console.log('MongoDB connection successful.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error('Startup check error:', error?.message || error);
  process.exit(1);
});
