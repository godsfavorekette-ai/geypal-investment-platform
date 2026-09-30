const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// @route POST /api/deposit/initialize
// @desc Initialize Paystack payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { amount, email } = req.body;

    if (!amount || amount < 15000) {
      return res.status(400).json({ success: false, message: 'Minimum deposit is ₦15,000' });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      paymentMethod: 'paystack',
      description: 'Deposit via Paystack',
    });
    await transaction.save();

    // Initialize Paystack payment
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email || req.user.email,
        amount: amount * 100, // Paystack uses kobo
        reference: transaction._id.toString(),
        metadata: {
          userId: req.user._id.toString(),
          fullName: req.user.fullName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      transaction.paystackReference = response.data.data.reference;
      await transaction.save();

      return res.json({
        success: true,
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
          transactionId: transaction._id,
        },
      });
    }

    res.status(400).json({ success: false, message: 'Failed to initialize payment' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/deposit/verify/:reference
// @desc Verify Paystack payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      const transaction = await Transaction.findById(response.data.data.reference);

      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      // Update transaction status
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      await transaction.save();

      // Update user balance
      const user = await User.findById(transaction.userId);
      user.balance += transaction.amount;
      user.investedAmount += transaction.amount;
      await user.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          amount: transaction.amount,
          balance: user.balance,
        },
      });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/deposit/history
// @desc Get deposit history
router.get('/history', auth, async (req, res) => {
  try {
    const deposits = await Transaction.find({
      userId: req.user._id,
      type: 'deposit',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      deposits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
