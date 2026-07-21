const { createDemoUser, DEMO_EMAIL, DEMO_PASSWORD } = require('../utils/demoUser');
const { clearInMemoryUsers } = require('../utils/userStore');

describe('demo user seeding', () => {
  beforeEach(() => {
    clearInMemoryUsers();
  });

  it('creates a demo account that can sign in as an admin', async () => {
    const user = await createDemoUser();

    expect(user.email).toBe(DEMO_EMAIL);
    expect(user.role).toBe('admin');
    expect(await user.matchPassword(DEMO_PASSWORD)).toBe(true);
  });
});
