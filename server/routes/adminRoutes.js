const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { deleteUser } = require('../controllers/authController'); // Already built earlier

router.get('/stats', protect, getAdminStats);
router.delete('/user/:id', protect, deleteUser);

module.exports = router;