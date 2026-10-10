const express = require('express');
const router = express.Router();
const { getAllStores, createStore } = require('../controllers/storeController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Get all stores (authenticated users: normal_user, admin, store_owner)
router.get('/', authenticateToken, getAllStores);

// Create new store (admin only)
router.post('/', authenticateToken, requireRole('admin'), createStore);

module.exports = router;
