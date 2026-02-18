const express = require('express');
const router = express.Router();
const { 
    addOrderItems, 
    getMyOrders, 
    getVendorOrders,
    updateOrderStatus 
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Sabhi routes protected hain
router.post('/', protect, addOrderItems);
router.get('/my', protect, getMyOrders);
router.get('/vendor', protect, getVendorOrders);
router.put('/:id/status', protect, updateOrderStatus); // Line 8: Fixed!

module.exports = router;