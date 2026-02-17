const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/transactions/lookup/phone/:phone
// @desc    Lookup transactions by phone number (public)
// @access  Public
router.get('/lookup/phone/:phone', async (req, res, next) => {
  try {
    const phone = req.params.phone.trim();

    const transactions = await Transaction.find({
      $or: [
        { recipientPhone: phone },
        { customerPhone: phone }
      ]
    })
      .select('transactionRef recipientPhone recipientNetwork dataAmount amount status paymentStatus deliveryStatus createdAt deliveredAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/lookup/reference/:ref
// @desc    Lookup transaction by reference (public)
// @access  Public
router.get('/lookup/reference/:ref', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      $or: [
        { transactionRef: req.params.ref },
        { paystackReference: req.params.ref }
      ]
    }).select('transactionRef recipientPhone recipientNetwork dataAmount amount status paymentStatus deliveryStatus createdAt deliveredAt');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, network, page = 1, limit = 20, startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (network) {
      query.recipientNetwork = network.toUpperCase();
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('bundle', 'name dataAmount network retailPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/stats
// @desc    Get user's transaction statistics
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .populate('bundle', 'name dataAmount network')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get network breakdown
    const networkStats = await Transaction.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: '$recipientNetwork',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          completedTransactions: 0,
          completedAmount: 0,
          failedTransactions: 0
        },
        recentTransactions,
        networkBreakdown: networkStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('bundle');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/ref/:reference
// @desc    Get transaction by reference
// @access  Private
router.get('/ref/:reference', protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      transactionRef: req.params.reference,
      user: req.user._id
    }).populate('bundle');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
