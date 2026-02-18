const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product'); // NEW
const Order = require('../models/Order');     // NEW
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- AUTH LOGIC ---

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields');
    }
    if (role && role === 'admin') {
        res.status(403);
        throw new Error('Cannot register as admin directly');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password, role: role || 'user' });
    if (user) {
        res.status(201).json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) },
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// --- NEW: ADMIN POWER LOGIC ---

// @desc    Get all stats (Admin Only)
const getAdminStats = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    const products = await Product.find({}).populate('vendor', 'name email');
    const orders = await Order.find({}).populate('user', 'name email');

    // Revenue calculation
    const totalRevenue = orders
        .filter(o => o.status === 'Approved')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
        success: true,
        data: { users, products, orders, totalRevenue }
    });
});

// @desc    Delete User (Admin Only)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete administrative node');
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User Terminated' });
});

module.exports = { registerUser, loginUser, getAdminStats, deleteUser };