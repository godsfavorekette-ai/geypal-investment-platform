const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const WITHDRAWAL_AMOUNTS = [10000, 40000, 100000, 500000, 1000000, 5000000];

// @route POST /api/withdraw/request
// @desc Request withdrawal
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, accountName, accountNumber, bankName } = req.body;

    // Validate amount
    if (!WITHDRAWAL_AMOUNTS.includes(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount',
        validAmounts: WITHDRAWAL_AMOUNTS,
      });
    }

    // Check balance
    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        balance: user.balance,
      });
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      bankDetails: { accountName, accountNumber, bankName },
      description: 'Bank withdrawal request',
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      data: {
        transactionId: transaction._id,
        amount,
        status: 'pending',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/withdraw/history
// @desc Get withdrawal history
router.get('/history', auth, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      userId: req.user._id,
      type: 'withdrawal',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/withdraw/amounts
// @desc Get available withdrawal amounts
router.get('/amounts', auth, (req, res) => {
  res.json({
    success: true,
    amounts: WITHDRAWAL_AMOUNTS,
  });
});

module.exports = router;
