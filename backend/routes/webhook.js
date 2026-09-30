const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

const router = express.Router();

// Verify webhook signature
const verifyWebhookSignature = (req, secret) => {
  const signature = req.headers['x-paystack-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  return hash === signature;
};

// @route POST /api/webhook/paystack
// @desc Handle Paystack webhook
router.post('/paystack', async (req, res) => {
  try {
    // Verify signature (optional but recommended)
    // const isValid = verifyWebhookSignature(req, process.env.PAYSTACK_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return res.status(400).json({ success: false, message: 'Invalid signature' });
    // }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const { reference, metadata } = data;

      // Find and update transaction
      const transaction = await Transaction.findById(reference);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      transaction.status = 'completed';
      transaction.completedAt = new Date();
      await transaction.save();

      // Update user balance
      const user = await User.findById(transaction.userId);
      user.balance += transaction.amount;
      user.investedAmount += transaction.amount;
      await user.save();

      console.log(`\n✅ Deposit confirmed: ${transaction.amount} NGN for user ${user.fullName}\n`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
