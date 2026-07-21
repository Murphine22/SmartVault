const connectDB = require('../config/db');
const { createDemoUser } = require('./demoUser');

const initializeServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    return false;
  }

  await createDemoUser();
  return true;
};

module.exports = {
  initializeServer,
};
