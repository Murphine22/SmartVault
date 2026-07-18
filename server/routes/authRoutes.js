const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getProfile);

module.exports = router;
