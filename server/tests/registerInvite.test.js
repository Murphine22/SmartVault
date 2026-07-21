const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const { registerUser } = require('../controllers/authController');

describe('registerUser invite flow', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'smartvault-register-test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('completes onboarding for an invited user instead of creating a duplicate record', async () => {
    const invitedUser = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'temp123!',
      isInvited: true,
      invitationToken: 'invite-token-123',
      invitedBy: new mongoose.Types.ObjectId(),
    });

    const req = {
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'newPassword123!',
        inviteToken: 'invite-token-123',
      },
    };
    const res = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registerUser(req, res);

    const completedUser = await User.findOne({ email: 'jane@example.com' });
    expect(completedUser).toBeTruthy();
    expect(completedUser.invitationToken).toBeNull();
    expect(completedUser.invitationAcceptedAt).toBeTruthy();
    expect(completedUser._id.toString()).toBe(invitedUser._id.toString());
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
