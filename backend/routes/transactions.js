const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route GET /api/transactions
// @desc Get all user transactions
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, limit = 50, page = 1 } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/transactions/:id
// @desc Get single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
