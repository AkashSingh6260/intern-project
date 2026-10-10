const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  changePassword,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/signup', register);
router.post('/login', login);

// Protected auth routes (all roles)
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
