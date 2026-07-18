const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const validateRegister = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const validateLogin = [
	body('email').isEmail().withMessage('Valid email is required'),
	body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getProfile);

module.exports = router;
