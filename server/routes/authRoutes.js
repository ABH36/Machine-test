const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAdminStats, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin Only (Protected)
router.get('/admin/stats', protect, admin, getAdminStats);
router.delete('/admin/user/:id', protect, admin, deleteUser);

module.exports = router;