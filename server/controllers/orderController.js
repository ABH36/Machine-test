const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = asyncHandler(async (req, res) => {
    const { orderItems, totalAmount } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // 1. Validate Stock & Deduct
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.name}`);
        }
        if (product.stock < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}`);
        }
        product.stock = product.stock - item.qty;
        await product.save();
    }

    // 2. Create Order (Status defaults to 'Pending' for B2B approval)
    const order = new Order({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        status: 'Pending', // Updated: Now requires vendor approval
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, data: createdOrder });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
});

// @desc    Get orders for a specific vendor
const getVendorOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

    const vendorOrders = orders.map(order => {
        const vendorItems = order.items.filter(
            item => item.vendor.toString() === req.user._id.toString()
        );
        
        if (vendorItems.length > 0) {
            return {
                _id: order._id,
                customer: order.user,
                items: vendorItems,
                totalAmount: vendorItems.reduce((acc, item) => acc + (item.price * item.qty), 0),
                status: order.status,
                createdAt: order.createdAt
            };
        }
        return null;
    }).filter(order => order !== null);

    res.json({ success: true, data: vendorOrders });
});

module.exports = { 
    addOrderItems, 
    getMyOrders, 
    getVendorOrders,
    updateOrderStatus 
};