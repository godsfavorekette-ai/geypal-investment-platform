const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route POST /api/auth/signup
// @desc Register a new user
router.post(
  '/signup',
  [
    body('fullName', 'Full name is required').trim().notEmpty(),
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { fullName, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create new user
      user = new User({ fullName, email, password });
      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: user.getPublicProfile(),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route POST /api/auth/signin
// @desc Sign in user
router.post(
  '/signin',
  [
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password is required').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordMatch = await user.matchPassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Signed in successfully',
        token,
        user: user.getPublicProfile(),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
