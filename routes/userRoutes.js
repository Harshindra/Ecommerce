const express = require('express');
const router = express.Router();
const { registerUser, loginUser,getUserProfile } = require('../controllers/authController');


// middlewares
const { protect ,authorize } = require('../middleware/auth');


// user routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// protected route
router.get('/profile', protect, getUserProfile);

module.exports = router;