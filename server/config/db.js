const mongoose = require('mongoose');

const buildMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const username = process.env.MONGODB_USERNAME || process.env.MONGODB_CLIENT_ID;
  const password = process.env.MONGODB_PASSWORD || process.env.MONGODB_CLIENT_SECRET;
  const host = process.env.MONGODB_HOST || 'dms.zv4ikxc.mongodb.net';
  const dbName = process.env.MONGODB_DB_NAME || 'DMS';
  const authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';

  if (username && password) {
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${dbName}?retryWrites=true&w=majority&authSource=${authSource}`;
  }

  return `mongodb://localhost:27017/smartvault`;
};

// Connect to MongoDB Atlas or a local MongoDB instance.
const connectDB = async () => {
  try {
    const uri = buildMongoUri();
    const conn = await mongoose.connect(uri, {
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
