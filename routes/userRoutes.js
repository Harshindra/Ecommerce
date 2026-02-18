const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// middlewares
const { protect, authorize } = require("../middleware/auth");

// user routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

// protected route
router.get("/profile", protect, getUserProfile);

module.exports = router;
