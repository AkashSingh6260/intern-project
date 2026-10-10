const express = require('express');
const router = express.Router();
const { submitRating, modifyRating } = require('../controllers/ratingController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Normal users can submit and modify ratings
router.post('/', authenticateToken, requireRole('normal_user'), submitRating);
router.put('/', authenticateToken, requireRole('normal_user'), modifyRating);

module.exports = router;
