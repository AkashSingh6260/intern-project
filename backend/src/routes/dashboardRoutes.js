const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getStoreOwnerDashboard,
} = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// System Administrator dashboard stats
router.get('/admin', authenticateToken, requireRole('admin'), getAdminStats);

// Store Owner dashboard stats and reviews list
router.get('/store-owner', authenticateToken, requireRole('store_owner'), getStoreOwnerDashboard);

module.exports = router;
