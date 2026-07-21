const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const userStore = require('../utils/userStore');
const { validationResult } = require('express-validator');

// Generate a signed JWT that includes the user's identity and role.
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate a refresh token for longer-lived sessions.
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const isDatabaseReady = () => mongoose.connection.readyState === 1 && !!mongoose.connection.db;

const createUserRecord = async (userData) => {
  const normalizedUserData = {
    ...userData,
    email: userData.email?.toLowerCase(),
    role: userData.role === 'admin' ? 'admin' : 'user',
  };

  if (isDatabaseReady()) {
    try {
      const createdUser = await User.create(normalizedUserData);
      return createdUser;
    } catch (error) {
      console.warn('MongoDB user creation failed, using in-memory store:', error.message);
    }
  }

  return userStore.createUser(normalizedUserData);
};

const findUserRecordByEmail = async (email) => {
  if (isDatabaseReady()) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.warn('MongoDB user lookup failed, using in-memory store:', error.message);
    }
  }

  return userStore.findUserByEmail(email);
};

const findUserRecordById = async (id) => {
  if (isDatabaseReady()) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.warn('MongoDB user lookup failed, using in-memory store:', error.message);
    }
  }

  return userStore.findUserById(id);
};

const saveRefreshToken = async (user, refreshToken) => {
  if (isDatabaseReady()) {
    try {
      user.refreshTokens.push(refreshToken);
      await user.save();
      return user;
    } catch (error) {
      console.warn('MongoDB refresh token save failed, using in-memory fallback:', error.message);
    }
  }

  return userStore.addRefreshToken(user._id, refreshToken);
};

const clearRefreshToken = async (user, refreshToken) => {
  if (isDatabaseReady()) {
    try {
      user.refreshTokens = user.refreshTokens.filter((storedToken) => storedToken !== refreshToken);
      await user.save();
      return user;
    } catch (error) {
      console.warn('MongoDB refresh token clear failed, using in-memory fallback:', error.message);
    }
  }

  return userStore.removeRefreshToken(user._id, refreshToken);
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// Register a new user and return a JWT.
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const userExists = await findUserRecordByEmail(normalizedEmail);
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const user = await createUserRecord({
      name,
      email: normalizedEmail,
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken(user, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { name, email, role = 'viewer' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserRecordByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const tempPassword = `${name.replace(/\s+/g, '').toLowerCase()}123!`;
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    const user = await createUserRecord({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role: normalizedRole,
    });

    if (!user) {
      return res.status(500).json({ success: false, message: 'Failed to create invited member' });
    }

    return res.status(201).json({
      success: true,
      user: serializeUser(user),
      temporaryPassword: tempPassword,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to invite member', error: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    let users = [];
    if (isDatabaseReady()) {
      try {
        users = await User.find({}).select('-password').sort({ createdAt: -1 });
      } catch (error) {
        console.warn('MongoDB user list failed, using in-memory store:', error.message);
        users = await userStore.listUsers();
      }
    } else {
      users = await userStore.listUsers();
    }

    return res.status(200).json({
      success: true,
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load users', error: error.message });
  }
};

// Log in an existing user and return a JWT.
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await findUserRecordByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken(user, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Get the authenticated user's profile.
exports.getProfile = async (req, res) => {
  try {
    const user = await findUserRecordById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = { ...user.toObject ? user.toObject() : user };
    delete safeUser.password;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load profile', error: error.message });
  }
};

// Update the authenticated user's profile.
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await findUserRecordById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) {
      const existingUser = await findUserRecordByEmail(email.toLowerCase());
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }
    if (password) {
      user.password = password;
    }

    if (isDatabaseReady()) {
      await user.save();
    }

    return res.status(200).json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// Refresh the access token using an httpOnly refresh cookie.
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await findUserRecordById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user);
    return res.status(200).json({ success: true, token: accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token', error: error.message });
  }
};

// Clear the refresh token from the cookie and user record.
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await findUserRecordById(decoded.userId || decoded.id);
      if (user) {
        await clearRefreshToken(user, token);
      }
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};
