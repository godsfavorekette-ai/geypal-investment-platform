const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route GET /api/user/profile
// @desc Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/user/profile
// @desc Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/user/bank-details
// @desc Update bank details
router.put('/bank-details', auth, async (req, res) => {
  try {
    const { accountName, accountNumber, bankName } = req.body;

    if (!accountName || !accountNumber || !bankName) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findById(req.user._id);
    user.bankDetails = { accountName, accountNumber, bankName };
    await user.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/user/dashboard
// @desc Get dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = req.user;
    const Transaction = require('../models/Transaction');
    const Plan = require('../models/Plan');

    const recentTransactions = await Transaction.find({ userId: user._id })
      .limit(5)
      .sort({ createdAt: -1 });

    const activePlans = await Plan.find({ userId: user._id, status: 'active' });

    res.json({
      success: true,
      data: {
        profile: user.getPublicProfile(),
        balance: user.balance,
        investedAmount: user.investedAmount,
        profit: user.profit,
        recentTransactions,
        activePlans: activePlans.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
