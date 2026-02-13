const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware'); // Your Cloudinary Multer

// Public Routes
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Protected Routes (Product Management)
router.route('/')
    .post(
        protect, 
        authorize('seller'), 
        upload.single('image'), 
        createProduct
    );

router.route('/:id')
    .put(
        protect, 
        authorize('seller'), 
        upload.single('image'), 
        updateProduct
    )
    .delete(
        protect, 
        authorize('seller', 'admin'), 
        deleteProduct
    );

// Protected Routes (Reviews)
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;