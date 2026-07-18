const { createUser, findUserByEmail, findUserById, clearInMemoryUsers } = require('../utils/userStore');

describe('user store fallback', () => {
  beforeEach(() => {
    clearInMemoryUsers();
  });

  it('creates and retrieves a user when MongoDB is unavailable', async () => {
    const user = await createUser({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
      role: 'user',
    });

    expect(user.email).toBe('ada@example.com');
    expect(user.role).toBe('user');
    expect(await user.matchPassword('password123')).toBe(true);

    const found = await findUserByEmail('ada@example.com');
    expect(found._id).toBe(user._id);

    const byId = await findUserById(user._id);
    expect(byId.email).toBe('ada@example.com');
  });
});
