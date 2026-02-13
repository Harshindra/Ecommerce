const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    createProductReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public Route (Everyone can see products)
router.get('/', getProducts);

// Protected Routes (Only Sellers and Admins)
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);

// review route
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;