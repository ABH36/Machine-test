const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

// Route: POST /api/upload
router.post('/', protect, upload.single('image'), (req, res) => {
    if (req.file && req.file.path) {
        res.status(200).json({
            success: true,
            url: req.file.path // Yeh Cloudinary ka final URL hai
        });
    } else {
        res.status(400);
        throw new Error('Image upload failed');
    }
});

module.exports = router;