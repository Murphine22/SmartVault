const bcrypt = require('bcryptjs');

const users = [];

const createUser = async ({ name, email, password, role = 'user' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    _id: `${Date.now()}-${users.length + 1}`,
    name,
    email: email.toLowerCase(),
    role,
    password: hashedPassword,
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    matchPassword: async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
  };

  users.push(user);
  return user;
};

const findUserByEmail = async (email) => {
  return users.find((u) => u.email === email.toLowerCase()) || null;
};

const findUserById = async (id) => {
  return users.find((u) => u._id === id) || null;
};

const updateUserProfile = async (id, updates) => {
  const user = await findUserById(id);
  if (!user) return null;

  Object.assign(user, updates, { updatedAt: new Date() });
  return user;
};

const listUsers = async () => {
  return users.map((user) => ({ ...user }));
};

const addRefreshToken = async (id, token) => {
  const user = await findUserById(id);
  if (!user) return null;
  user.refreshTokens = [...user.refreshTokens, token];
  return user;
};

const removeRefreshToken = async (id, token) => {
  const user = await findUserById(id);
  if (!user) return null;
  user.refreshTokens = user.refreshTokens.filter((storedToken) => storedToken !== token);
  return user;
};

const clearInMemoryUsers = () => {
  users.length = 0;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  listUsers,
  addRefreshToken,
  removeRefreshToken,
  clearInMemoryUsers,
};
