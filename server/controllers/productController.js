const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');

// ... getProducts, getProductById, getVendorProducts SAME RAHENGE ...
// (Unko change mat karna, bas niche wale functions update karo)

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('vendor', 'name email');
    res.json({ success: true, data: products });
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email');
    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const getVendorProducts = asyncHandler(async (req, res) => {
    if (req.user.role !== 'vendor') {
        res.status(403);
        throw new Error('Access denied.');
    }
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 }); // Sort by newest
    res.json({ success: true, data: products });
});

// @desc    Create a product
const createProduct = asyncHandler(async (req, res) => {
    if (req.user.role !== 'vendor') {
        res.status(403);
        throw new Error('Only vendors can create products');
    }

    const { name, price, description, image, stock, category } = req.body; // Accept Category

    if (!name || !price || !description) {
        res.status(400);
        throw new Error('Please provide name, price, and description');
    }

    const product = new Product({
        name, 
        price, 
        description, 
        image: image || "", 
        stock: stock || 0,
        category: category || 'General', // Save Category
        vendor: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
});

// @desc    Update a product (NEW FUNCTION)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, stock, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Security Check
        if (product.vendor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this product');
        }

        // Update fields
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.stock = stock !== undefined ? stock : product.stock; // Handle 0 stock correctly
        product.category = category || product.category;

        const updatedProduct = await product.save();
        res.json({ success: true, data: updatedProduct });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        await product.deleteOne();
        res.json({ success: true, message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById,
    getVendorProducts,
    createProduct,
    updateProduct, // Export New Function
    deleteProduct,
};