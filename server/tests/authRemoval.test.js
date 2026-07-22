jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
    db: {},
  },
}));

jest.mock('../models/User', () => ({
  findByIdAndDelete: jest.fn(),
}));

const User = require('../models/User');
const authController = require('../controllers/authController');

describe('admin member removal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes a member from MongoDB for admins', async () => {
    const memberId = 'member-id';
    User.findByIdAndDelete.mockResolvedValue({ _id: memberId, email: 'member@example.com' });

    const req = {
      user: { _id: 'admin-id', role: 'admin' },
      params: { id: memberId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await authController.removeMember(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith(memberId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Member removed' }));
  });
});
