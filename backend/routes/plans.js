const express = require('express');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const PLAN_TIERS = Array.from({ length: 20 }, (_, index) => ({
  vipLevel: index + 1,
  amount: 15000 + index * 10000,
  leaseDays: 10,
  profitRate: 1.5, // 150%
}));

// @route GET /api/plans/available
// @desc Get available plans
router.get('/available', auth, (req, res) => {
  try {
    const plans = PLAN_TIERS.map((plan) => ({
      vipLevel: plan.vipLevel,
      principal: plan.amount,
      expectedProfit: Math.round(plan.amount * plan.profitRate),
      leaseDays: plan.leaseDays,
      profitRate: plan.profitRate * 100,
    }));

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/plans/invest
// @desc Invest in a plan
router.post('/invest', auth, async (req, res) => {
  try {
    const { vipLevel } = req.body;

    if (!vipLevel || vipLevel < 1 || vipLevel > 20) {
      return res.status(400).json({ success: false, message: 'Invalid VIP level' });
    }

    const planTier = PLAN_TIERS[vipLevel - 1];
    const user = await User.findById(req.user._id);

    // Check if user has enough balance
    if (user.balance < planTier.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this plan',
      });
    }

    // Create plan investment
    const plan = new Plan({
      userId: req.user._id,
      planName: `VIP ${vipLevel} Lease`,
      vipLevel,
      principal: planTier.amount,
      profitRate: planTier.profitRate,
      leaseDays: planTier.leaseDays,
    });
    await plan.save();

    // Deduct from balance
    user.balance -= planTier.amount;
    user.investedAmount += planTier.amount;
    user.currentPlan = `VIP ${vipLevel} Lease`;
    await user.save();

    res.json({
      success: true,
      message: 'Investment successful',
      data: {
        planId: plan._id,
        planName: plan.planName,
        principal: plan.principal,
        expectedProfit: plan.expectedProfit,
        endDate: plan.endDate,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/plans/my-plans
// @desc Get user's active plans
router.get('/my-plans', auth, async (req, res) => {
  try {
    const plans = await Plan.find({
      userId: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/plans/:planId
// @desc Get plan details
router.get('/:planId', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (plan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
