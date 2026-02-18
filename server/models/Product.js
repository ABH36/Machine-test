const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, default: 'General' }, // NEW FIELD ADDED
    image: { type: String, default: "" },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);