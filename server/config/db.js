const mongoose = require('mongoose');

// Connect to MongoDB Atlas or a local MongoDB instance.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartvault', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB unavailable, continuing in authentication fallback mode: ${error.message}`);
    return false;
  }
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isMongoConnected = isMongoConnected;
