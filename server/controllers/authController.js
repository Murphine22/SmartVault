const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sendInvitationEmail } = require('../utils/mailer');

// Generate a signed JWT that includes the user's identity and role.
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'dev-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate a refresh token for longer-lived sessions.
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret',
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

  if (!isDatabaseReady()) {
    throw new Error('MongoDB is not available. User registration requires database access.');
  }

  return User.create(normalizedUserData);
};

const findUserRecordByEmail = async (email) => {
  if (!isDatabaseReady()) {
    throw new Error('MongoDB is not available. Login requires database access.');
  }

  return await User.findOne({ email });
};

const findUserRecordById = async (id) => {
  if (!isDatabaseReady()) {
    throw new Error('MongoDB is not available. Authenticated requests require database access.');
  }

  return await User.findById(id);
};

const saveRefreshToken = async (user, refreshToken) => {
  if (!isDatabaseReady()) {
    throw new Error('MongoDB is not available. Refresh token save requires database access.');
  }

  user.refreshTokens.push(refreshToken);
  await user.save();
  return user;
};

const clearRefreshToken = async (user, refreshToken) => {
  if (!isDatabaseReady()) {
    throw new Error('MongoDB is not available. Refresh token clear requires database access.');
  }

  user.refreshTokens = user.refreshTokens.filter((storedToken) => storedToken !== refreshToken);
  await user.save();
  return user;
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

  const { name, email, password, role, inviteToken } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const invitedUser = inviteToken ? await User.findOne({ invitationToken: inviteToken, email: normalizedEmail }) : null;
    const userExists = await findUserRecordByEmail(normalizedEmail);

    if (userExists && !invitedUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    let user;
    if (invitedUser) {
      invitedUser.name = name;
      invitedUser.email = normalizedEmail;
      invitedUser.password = password;
      invitedUser.role = role === 'admin' ? 'admin' : 'user';
      invitedUser.isInvited = true;
      invitedUser.invitationAcceptedAt = new Date();
      invitedUser.invitationToken = null;
      if (isDatabaseReady()) {
        await invitedUser.save();
      }
      user = invitedUser;
    } else {
      user = await createUserRecord({
        name,
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'user',
      });
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
    const invitationToken = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const user = await createUserRecord({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role: normalizedRole,
      isInvited: true,
      invitedBy: req.user._id,
      invitationToken,
    });

    if (!user) {
      return res.status(500).json({ success: false, message: 'Failed to create invited member' });
    }

    try {
      await sendInvitationEmail({
        to: normalizedEmail,
        inviteeName: name,
        inviteLink: `${process.env.APP_URL || 'http://localhost:3000'}/register?invite=${invitationToken}`,
        inviterName: req.user?.name || 'An admin',
      });
    } catch (emailError) {
      console.warn('Invitation email failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      user: serializeUser(user),
      temporaryPassword: tempPassword,
      invitationToken,
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

    if (!isDatabaseReady()) {
      return res.status(500).json({ success: false, message: 'Database unavailable' });
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

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
exports.removeMember = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Member id is required' });
    }

    const isSelfRemoval = String(req.user._id) === String(id);
    if (isSelfRemoval) {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin account' });
    }

    if (!isDatabaseReady()) {
      return res.status(500).json({ success: false, message: 'Database unavailable' });
    }

    const removedUser = await User.findByIdAndDelete(id);
    if (!removedUser) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    return res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove member', error: error.message });
  }
};

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
