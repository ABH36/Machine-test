const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Humne jo pehle banayi thi

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'marketplace_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

module.exports = upload;