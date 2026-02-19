const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');


const getAdminStats = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    const products = await Product.find({}).populate('vendor', 'name email');
    const orders = await Order.find({}).populate('user', 'name email');

    // Stats Calculation
    const totalRevenue = orders
        .filter(o => o.status === 'Approved')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const vendorCount = users.filter(u => u.role === 'vendor').length;

    res.json({
        success: true,
        data: {
            users,
            products,
            orders,
            totalRevenue,
            vendorCount
        }
    });
});

module.exports = { getAdminStats };