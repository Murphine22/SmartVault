jest.mock('../config/db', () => jest.fn());

const connectDB = require('../config/db');
const { initializeServer } = require('../utils/bootstrap');

describe('server bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects to MongoDB before starting', async () => {
    connectDB.mockResolvedValue(true);

    const connected = await initializeServer();

    expect(connectDB).toHaveBeenCalled();
    expect(connected).toBe(true);
  });

  it('returns false when MongoDB is unavailable', async () => {
    connectDB.mockResolvedValue(false);

    const connected = await initializeServer();

    expect(connected).toBe(false);
  });
});
