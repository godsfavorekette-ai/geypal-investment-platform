const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'profit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'bank_transfer', 'system'],
    default: null,
  },
  reference: String,
  paystackReference: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
