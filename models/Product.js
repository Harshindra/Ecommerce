const mongoose = require('mongoose');

// 1. Define the Review Schema (Sub-document)
const reviewSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Link to the user who wrote it
        },
    },
    {
        timestamps: true,
    }
);

// 2. Update Product Schema
const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        
        
        reviews: [reviewSchema], 

        // These are calculated automatically when a review is added
        rating: { type: Number, required: true, default: 0 },
        numReviews: { type: Number, required: true, default: 0 },
        
        price: { type: Number, required: true, default: 0 },
        countInStock: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);