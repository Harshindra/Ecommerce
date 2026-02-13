const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const products = await Product.find({});
    res.json(products);
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller/Admin
const createProduct = async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } =
        req.body;
    const product = new Product({
        name: name,
        price: price,
        user: req.user._id, // The logged-in seller's ID
        image: image,
        brand: brand,
        category: category,
        countInStock: countInStock,
        description: description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } =
        req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Check if the user owns this product before updating
        if (product.user.toString() !== req.user._id.toString())

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};


const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // 1. Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        // 2. Create review object
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        // 3. Add to reviews array
        product.reviews.push(review);

        // 4. Update total number of reviews
        product.numReviews = product.reviews.length;

        // 5. Calculate new average rating
        // (Sum of all ratings) / (Total reviews)
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};
module.exports = { getProducts, createProduct, updateProduct,createProductReview };