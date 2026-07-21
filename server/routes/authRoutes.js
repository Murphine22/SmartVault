const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, refreshToken, logout, inviteMember } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Basic validation for the auth endpoints.
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validateRegister, registerUser);
router.post('/invite', protect, inviteMember);
router.post('/login', validateLogin, loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getProfile); // backward-compatible alias

module.exports = router;
