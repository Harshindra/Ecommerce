const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const User = require("../models/User");
const dotenv = require("dotenv");
const sendEmail = require("../utils/sendEmail");

dotenv.config();
// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins

  const user = await User.create({
    name,
    email,
    password,
    role,
    otp,
    otpExpires,
    isVerified: false, // Not verified yet
  });

  if (user) {
    // Send OTP Email
    try {
      await sendEmail({
        email: user.email,
        subject: "Your OTP for Account Verification",
        message: `Hi ${user.name},\n\nYour OTP is ${otp}. It expires in 10 minutes.\n\nThanks, Team.`,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        message: "OTP sent to your email. Please verify.",
      });
    } catch (error) {
      // If email fails, delete the user so they can try again
      await User.deleteOne({ _id: user._id });
      res.status(500);
      throw new Error("Email could not be sent. Please try again.");
    }
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email
    await sendEmail({
      email: user.email,
      subject: "Welcome!",
      message: `Hi ${user.name},\n\nYour account is successfully verified!`,
    });

    // Send Token (Login successful)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid or Expired OTP");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email }).select("+password"); // We need password to compare

    // 2. Check password using the method we defined in the Model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and save to DB
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create Reset URL
  // NOTE: In production, this should point to your Frontend URL (e.g., localhost:3000)
  const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

  const message = `You have requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error("Email could not be sent");
  }
};

const resetPassword = async (req, res) => {
  // Get token from URL and hash it to match DB
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Check if not expired
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid Token");
  }

  // Set new password
  user.password = req.body.password;

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); // This triggers the pre-save hook to hash the new password

  res.status(201).json({
    success: true,
    data: "Password Reset Success",
    token: generateToken(user._id), // Log them in automatically
  });
};

const getUserProfile = async (req, res) => {
  // req.user was set by the 'protect' middleware!
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
};
