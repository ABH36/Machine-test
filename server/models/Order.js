const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            vendor: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            }
        }
    ],
    totalAmount: { type: Number, required: true, default: 0.0 },
    status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
}, // Pending, Completed
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);