const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUserDetails,
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// System Administrator only routes
router.use(authenticateToken, requireRole('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserDetails);

module.exports = router;
