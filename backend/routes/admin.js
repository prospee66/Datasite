const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bundle = require('../models/Bundle');
const WalletTransaction = require('../models/WalletTransaction');
const vtuService = require('../services/vtu');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Get counts
    const [
      totalUsers,
      totalTransactions,
      todayTransactions,
      monthTransactions,
      revenueStats,
      recentTransactions,
      topNetworks
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Transaction.countDocuments({ createdAt: { $gte: thisMonth } }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            todayRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', today] },
                  '$amount',
                  0
                ]
              }
            },
            monthRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', thisMonth] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]),
      Transaction.find()
        .populate('user', 'firstName lastName email')
        .populate('bundle', 'name dataAmount network')
        .sort({ createdAt: -1 })
        .limit(10),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$recipientNetwork',
            count: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Get status breakdown
    const statusBreakdown = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Check VTU balance
    const vtuBalance = await vtuService.checkBalance();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          thisMonth: monthTransactions,
          statusBreakdown: statusBreakdown.reduce((acc, s) => {
            acc[s._id] = s.count;
            return acc;
          }, {})
        },
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          todayRevenue: 0,
          monthRevenue: 0
        },
        topNetworks,
        recentTransactions,
        vtuBalance: vtuBalance.success ? vtuBalance.balance : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
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

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private/Admin
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's transaction stats
    const transactionStats = await Transaction.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        transactionStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (activate/deactivate)
// @access  Private/Admin
router.put('/users/:id', async (req, res, next) => {
  try {
    const { isActive, role, walletBalance } = req.body;

    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updates.role = role;
    if (typeof walletBalance === 'number' && walletBalance >= 0) {
      updates.walletBalance = walletBalance;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', async (req, res, next) => {
  try {
    const {
      status,
      network,
      paymentStatus,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (network) query.recipientNetwork = network.toUpperCase();
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { transactionRef: new RegExp(search, 'i') },
        { recipientPhone: new RegExp(search, 'i') }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('user', 'firstName lastName email phone')
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

// @route   POST /api/admin/transactions/:id/retry
// @desc    Retry failed transaction
// @access  Private/Admin
router.post('/transactions/:id/retry', async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bundle');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.paymentStatus !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Cannot retry - payment was not successful'
      });
    }

    if (transaction.deliveryStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Data already delivered'
      });
    }

    // Retry delivery
    const deliveryResult = await vtuService.purchaseData({
      network: transaction.recipientNetwork,
      phone: transaction.recipientPhone,
      vtuCode: transaction.bundle.vtuCode,
      transactionRef: `${transaction.transactionRef}-R${transaction.retryCount + 1}`
    });

    transaction.retryCount += 1;

    if (deliveryResult.success) {
      transaction.status = 'completed';
      transaction.deliveryStatus = 'delivered';
      transaction.deliveredAt = new Date();
      transaction.vtuResponse = deliveryResult.data;
    } else {
      transaction.vtuResponse = deliveryResult;
      transaction.errorMessage = deliveryResult.message;
    }

    await transaction.save();

    res.json({
      success: deliveryResult.success,
      message: deliveryResult.success
        ? 'Data delivered successfully!'
        : deliveryResult.message,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/transactions/:id/refund
// @desc    Refund transaction
// @access  Private/Admin
router.post('/transactions/:id/refund', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already refunded'
      });
    }

    // Refund to wallet
    const user = await User.findById(transaction.user);
    const balanceBefore = user.walletBalance;
    user.walletBalance += transaction.amount;
    await user.save();

    // Create refund record
    await WalletTransaction.create({
      user: user._id,
      type: 'credit',
      amount: transaction.amount,
      balanceBefore,
      balanceAfter: user.walletBalance,
      description: `Admin refund: ${reason || 'No reason provided'}`,
      reference: `REFUND-${transaction.transactionRef}`,
      category: 'refund',
      relatedTransaction: transaction._id,
      status: 'completed'
    });

    // Update transaction
    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    transaction.refundReason = reason;
    await transaction.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount: transaction.amount,
        newBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue report
// @access  Private/Admin
router.get('/reports/revenue', async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const match = { status: 'completed' };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const report = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateFormat,
          transactions: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/bundles/all
// @desc    Get all bundles including inactive
// @access  Private/Admin
router.get('/bundles/all', async (req, res, next) => {
  try {
    const bundles = await Bundle.find()
      .sort({ network: 1, sortOrder: 1 });

    res.json({
      success: true,
      data: bundles
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create admin user (super admin only - first admin)
// @access  Public (only if no admin exists)
router.post('/create-admin', async (req, res, next) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. Use the admin panel to create more admins.'
      });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    const admin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: 'admin',
      isEmailVerified: true
    });

    const token = admin.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
