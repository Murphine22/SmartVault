jest.mock('../config/db', () => jest.fn());
jest.mock('../utils/demoUser', () => ({
  createDemoUser: jest.fn(),
}));

const connectDB = require('../config/db');
const { createDemoUser } = require('../utils/demoUser');
const { initializeServer } = require('../utils/bootstrap');

describe('server bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects to MongoDB before seeding the demo user', async () => {
    const order = [];

    connectDB.mockImplementation(async () => {
      order.push('connect');
      return true;
    });

    createDemoUser.mockImplementation(async () => {
      order.push('seed');
      return true;
    });

    await initializeServer();

    expect(order).toEqual(['connect', 'seed']);
  });
});
