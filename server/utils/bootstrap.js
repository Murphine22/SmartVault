const connectDB = require('../config/db');

const initializeServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    return false;
  }

  return true;
};

module.exports = {
  initializeServer,
};
