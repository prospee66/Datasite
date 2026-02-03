const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Transaction = require('../models/Transaction');
const Bundle = require('../models/Bundle');
const vtuService = require('../services/vtu');
const { protect } = require('../middleware/auth');

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');

    res.json({
      success: true,
      data: {
        balance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get wallet transaction history
// @access  Private
router.get('/transactions', protect, async (req, res, next) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id, status: 'completed' };

    if (type) query.type = type;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WalletTransaction.countDocuments(query)
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

// @route   POST /api/wallet/purchase
// @desc    Purchase data using wallet balance
// @access  Private
router.post('/purchase', protect, async (req, res, next) => {
  try {
    const { bundleId, recipientPhone } = req.body;

    if (!bundleId || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Bundle ID and recipient phone are required'
      });
    }

    // Get bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle || !bundle.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found or unavailable'
      });
    }

    // Get fresh user data
    const user = await User.findById(req.user._id);

    // Check balance
    if (user.walletBalance < bundle.retailPrice) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
        data: {
          required: bundle.retailPrice,
          available: user.walletBalance,
          shortfall: bundle.retailPrice - user.walletBalance
        }
      });
    }

    // Detect and validate network
    const detectedNetwork = vtuService.detectNetwork(recipientPhone);
    if (detectedNetwork && detectedNetwork !== bundle.network) {
      return res.status(400).json({
        success: false,
        message: `This phone number appears to be ${detectedNetwork}. Please select a ${detectedNetwork} bundle.`
      });
    }

    // Generate reference
    const transactionRef = Transaction.generateRef();

    // Deduct from wallet first
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore - bundle.retailPrice;

    user.walletBalance = balanceAfter;
    await user.save();

    // Create transaction
    const transaction = await Transaction.create({
      user: user._id,
      bundle: bundle._id,
      recipientPhone,
      recipientNetwork: bundle.network,
      amount: bundle.retailPrice,
      dataAmount: bundle.dataAmount,
      transactionRef,
      paymentMethod: 'wallet',
      status: 'processing',
      paymentStatus: 'success',
      deliveryStatus: 'pending'
    });

    // Create wallet debit record
    await WalletTransaction.create({
      user: user._id,
      type: 'debit',
      amount: bundle.retailPrice,
      balanceBefore,
      balanceAfter,
      description: `Data purchase: ${bundle.dataAmount} ${bundle.network} to ${recipientPhone}`,
      reference: transactionRef,
      category: 'purchase',
      relatedTransaction: transaction._id,
      status: 'completed'
    });

    // Deliver data
    const deliveryResult = await vtuService.purchaseData({
      network: bundle.network,
      phone: recipientPhone,
      vtuCode: bundle.vtuCode,
      transactionRef
    });

    if (deliveryResult.success) {
      transaction.status = 'completed';
      transaction.deliveryStatus = 'delivered';
      transaction.deliveredAt = new Date();
      transaction.vtuResponse = deliveryResult.data;
      await transaction.save();

      res.json({
        success: true,
        message: 'Data delivered successfully!',
        data: {
          transactionRef,
          recipientPhone,
          dataAmount: bundle.dataAmount,
          network: bundle.network,
          amount: bundle.retailPrice,
          newBalance: balanceAfter
        }
      });
    } else {
      // Failed delivery - initiate refund
      transaction.status = 'failed';
      transaction.deliveryStatus = 'failed';
      transaction.errorMessage = deliveryResult.message;
      transaction.vtuResponse = deliveryResult;
      await transaction.save();

      // Refund to wallet
      user.walletBalance = balanceBefore;
      await user.save();

      // Create refund record
      await WalletTransaction.create({
        user: user._id,
        type: 'credit',
        amount: bundle.retailPrice,
        balanceBefore: balanceAfter,
        balanceAfter: balanceBefore,
        description: `Refund: Failed delivery for ${recipientPhone}`,
        reference: `REF-${transactionRef}`,
        category: 'refund',
        relatedTransaction: transaction._id,
        status: 'completed'
      });

      res.status(400).json({
        success: false,
        message: 'Data delivery failed. Amount has been refunded to your wallet.',
        data: {
          transactionRef,
          error: deliveryResult.message
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
