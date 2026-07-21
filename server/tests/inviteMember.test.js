const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../utils/mailer', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue(true),
}));

const { sendInvitationEmail } = require('../utils/mailer');
const User = require('../models/User');
const { inviteMember } = require('../controllers/authController');

describe('inviteMember', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'smartvault-test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  it('persists invited members in MongoDB and sends an invitation email', async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId(), name: 'Admin User', role: 'admin' },
      body: { name: 'Jane Doe', email: 'jane@example.com', role: 'viewer' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await inviteMember(req, res);

    const savedUser = await User.findOne({ email: 'jane@example.com' });

    expect(savedUser).toBeTruthy();
    expect(savedUser.role).toBe('user');
    expect(savedUser.isInvited).toBe(true);
    expect(savedUser.invitationToken).toBeTruthy();
    expect(savedUser.invitedBy?.toString()).toBe(req.user._id.toString());
    expect(sendInvitationEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'jane@example.com',
      inviteeName: 'Jane Doe',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
