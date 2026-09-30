const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  vipLevel: {
    type: Number,
    required: true,
  },
  principal: {
    type: Number,
    required: true,
  },
  expectedProfit: {
    type: Number,
    required: true,
  },
  profitRate: {
    type: Number,
    default: 1.5, // 150%
  },
  leaseDays: {
    type: Number,
    default: 10,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  profitPaid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate end date before saving
planSchema.pre('save', function (next) {
  if (!this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.leaseDays);
    this.endDate = endDate;
  }
  next();
});

// Calculate expected profit
planSchema.pre('save', function (next) {
  this.expectedProfit = this.principal * this.profitRate;
  next();
});

// Index for faster queries
planSchema.index({ userId: 1, status: 1 });
planSchema.index({ endDate: 1 });

module.exports = mongoose.model('Plan', planSchema);
