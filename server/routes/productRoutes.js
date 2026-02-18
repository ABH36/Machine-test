const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getVendorProducts,
    createProduct,
    updateProduct, // Import
    deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getProducts);

// Vendor Routes (Order matters!)
router.get('/vendor/all', protect, getVendorProducts);

// Actions
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct); // NEW ROUTE
router.delete('/:id', protect, deleteProduct);

// Dynamic Route (Must be last)
router.get('/:id', getProductById);

module.exports = router;