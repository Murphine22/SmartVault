const { createUser, clearInMemoryUsers, listUsers } = require('../utils/userStore');
const authController = require('../controllers/authController');

describe('admin member removal', () => {
  beforeEach(() => {
    clearInMemoryUsers();
  });

  it('lets admins remove a member from the in-memory store', async () => {
    const admin = await createUser({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });
    const member = await createUser({ name: 'Member', email: 'member@example.com', password: 'password123', role: 'user' });

    const req = {
      user: { _id: admin._id, role: 'admin' },
      params: { id: member._id },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await authController.removeMember(req, res);

    const users = await listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('admin@example.com');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
