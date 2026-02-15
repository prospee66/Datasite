const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Bundle = require('../models/Bundle');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const paystackService = require('../services/paystack');
const vtuService = require('../services/vtu');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/initialize
// @desc    Initialize payment for data purchase
// @access  Private
router.post('/initialize', protect, async (req, res, next) => {
  try {
    const { bundleId, recipientPhone, paymentMethod } = req.body;

    // Validate input
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

    // Detect network from phone
    const detectedNetwork = vtuService.detectNetwork(recipientPhone);
    if (detectedNetwork && detectedNetwork !== bundle.network) {
      return res.status(400).json({
        success: false,
        message: `This phone number appears to be ${detectedNetwork}. Please select a ${detectedNetwork} bundle.`
      });
    }

    // Generate transaction reference
    const transactionRef = Transaction.generateRef();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      bundle: bundle._id,
      recipientPhone,
      recipientNetwork: bundle.network,
      amount: bundle.retailPrice,
      dataAmount: bundle.dataAmount,
      transactionRef,
      paymentMethod: paymentMethod || 'card',
      status: 'pending',
      paymentStatus: 'pending',
      deliveryStatus: 'pending'
    });

    // Initialize Paystack payment
    const paymentResult = await paystackService.initializeTransaction({
      email: req.user.email,
      amount: bundle.retailPrice,
      reference: transactionRef,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      channels: paymentMethod === 'mobile_money' ? ['mobile_money'] : ['card', 'mobile_money'],
      userId: req.user._id.toString(),
      transactionType: 'data_purchase',
      bundleId: bundle._id.toString(),
      recipientPhone
    });

    if (!paymentResult.success) {
      // Update transaction status
      transaction.status = 'failed';
      transaction.paymentStatus = 'failed';
      transaction.errorMessage = paymentResult.message;
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: paymentResult.message
      });
    }

    // Update transaction with Paystack reference
    transaction.paystackReference = paymentResult.data.reference;
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorizationUrl: paymentResult.data.authorization_url,
        accessCode: paymentResult.data.access_code,
        reference: paymentResult.data.reference,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payments/verify/:reference
// @desc    Verify payment and deliver data
// @access  Private
router.get('/verify/:reference', protect, async (req, res, next) => {
  try {
    const { reference } = req.params;

    // Find transaction
    const transaction = await Transaction.findOne({
      $or: [
        { transactionRef: reference },
        { paystackReference: reference }
      ]
    }).populate('bundle');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if already processed
    if (transaction.paymentStatus === 'success' && transaction.deliveryStatus === 'delivered') {
      return res.json({
        success: true,
        message: 'Transaction already completed',
        data: transaction
      });
    }

    // Verify with Paystack
    const verifyResult = await paystackService.verifyTransaction(reference);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }

    const paymentData = verifyResult.data;

    // Update transaction with payment details
    transaction.paystackResponse = paymentData;
    transaction.paymentChannel = paymentData.channel;

    if (paymentData.status === 'success') {
      transaction.paymentStatus = 'success';

      // Deliver data via VTU
      const deliveryResult = await vtuService.purchaseData({
        network: transaction.recipientNetwork,
        phone: transaction.recipientPhone,
        vtuCode: transaction.bundle.vtuCode,
        transactionRef: transaction.transactionRef
      });

      if (deliveryResult.success) {
        transaction.status = 'completed';
        transaction.deliveryStatus = 'delivered';
        transaction.deliveredAt = new Date();
        transaction.vtuResponse = deliveryResult.data;
      } else {
        transaction.status = 'processing';
        transaction.deliveryStatus = 'failed';
        transaction.errorMessage = deliveryResult.message;
        transaction.vtuResponse = deliveryResult;
        // TODO: Queue for retry or manual processing
      }
    } else {
      transaction.paymentStatus = 'failed';
      transaction.status = 'failed';
      transaction.errorMessage = `Payment ${paymentData.status}`;
    }

    await transaction.save();

    res.json({
      success: transaction.status === 'completed',
      message: transaction.status === 'completed'
        ? 'Data delivered successfully!'
        : transaction.errorMessage || 'Transaction processing',
      data: {
        status: transaction.status,
        paymentStatus: transaction.paymentStatus,
        deliveryStatus: transaction.deliveryStatus,
        recipientPhone: transaction.recipientPhone,
        dataAmount: transaction.dataAmount,
        network: transaction.recipientNetwork
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Paystack webhooks
// @access  Public (Paystack)
router.post('/webhook', async (req, res) => {
  try {
    // req.body is a raw Buffer from express.raw() middleware
    const rawBody = req.body;
    const signature = req.headers['x-paystack-signature'];

    // Verify signature using raw body
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Invalid signature');
    }

    // Parse the raw body as JSON
    const event = JSON.parse(rawBody);
    console.log('Paystack webhook received:', event.event);

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;

      case 'transfer.success':
        // Handle transfer success if needed
        break;

      case 'transfer.failed':
        // Handle transfer failure if needed
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Handle successful payment
async function handleSuccessfulPayment(data) {
  try {
    const transaction = await Transaction.findOne({
      $or: [
        { transactionRef: data.reference },
        { paystackReference: data.reference }
      ]
    }).populate('bundle');

    if (!transaction) {
      console.error('Transaction not found for webhook:', data.reference);
      return;
    }

    // Skip if already processed
    if (transaction.paymentStatus === 'success' && transaction.deliveryStatus === 'delivered') {
      return;
    }

    transaction.paymentStatus = 'success';
    transaction.paystackResponse = data;
    transaction.paymentChannel = data.channel;

    // Deliver data
    const deliveryResult = await vtuService.purchaseData({
      network: transaction.recipientNetwork,
      phone: transaction.recipientPhone,
      vtuCode: transaction.bundle.vtuCode,
      transactionRef: transaction.transactionRef
    });

    if (deliveryResult.success) {
      transaction.status = 'completed';
      transaction.deliveryStatus = 'delivered';
      transaction.deliveredAt = new Date();
      transaction.vtuResponse = deliveryResult.data;
    } else {
      transaction.status = 'processing';
      transaction.deliveryStatus = 'failed';
      transaction.errorMessage = deliveryResult.message;
      transaction.vtuResponse = deliveryResult;
    }

    await transaction.save();
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(data) {
  try {
    const transaction = await Transaction.findOne({
      $or: [
        { transactionRef: data.reference },
        { paystackReference: data.reference }
      ]
    });

    if (transaction) {
      transaction.paymentStatus = 'failed';
      transaction.status = 'failed';
      transaction.paystackResponse = data;
      transaction.errorMessage = data.gateway_response || 'Payment failed';
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// @route   POST /api/payments/wallet/topup
// @desc    Initialize wallet top-up
// @access  Private
router.post('/wallet/topup', protect, async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum top-up amount is GHS 1'
      });
    }

    const reference = `TOPUP-${Date.now()}-${Math.random().toString(36).substring(7)}`.toUpperCase();

    const paymentResult = await paystackService.initializeTransaction({
      email: req.user.email,
      amount: amount,
      reference: reference,
      callbackUrl: `${process.env.FRONTEND_URL}/wallet/callback`,
      channels: ['card', 'mobile_money'],
      userId: req.user._id.toString(),
      transactionType: 'wallet_topup'
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message
      });
    }

    // Create pending wallet transaction
    await WalletTransaction.create({
      user: req.user._id,
      type: 'credit',
      amount: amount,
      balanceBefore: req.user.walletBalance,
      balanceAfter: req.user.walletBalance, // Will update on success
      description: 'Wallet top-up via Paystack',
      reference: reference,
      category: 'topup',
      paystackReference: paymentResult.data.reference,
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Top-up initialized',
      data: {
        authorizationUrl: paymentResult.data.authorization_url,
        reference: paymentResult.data.reference
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payments/wallet/verify/:reference
// @desc    Verify wallet top-up
// @access  Private
router.get('/wallet/verify/:reference', protect, async (req, res, next) => {
  try {
    const { reference } = req.params;

    const walletTx = await WalletTransaction.findOne({
      $or: [{ reference }, { paystackReference: reference }],
      user: req.user._id
    });

    if (!walletTx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (walletTx.status === 'completed') {
      return res.json({
        success: true,
        message: 'Top-up already completed',
        data: { newBalance: req.user.walletBalance }
      });
    }

    // Verify with Paystack
    const verifyResult = await paystackService.verifyTransaction(reference);

    if (!verifyResult.success || verifyResult.data.status !== 'success') {
      walletTx.status = 'failed';
      await walletTx.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Credit wallet
    const user = await User.findById(req.user._id);
    const newBalance = user.walletBalance + walletTx.amount;

    user.walletBalance = newBalance;
    await user.save();

    walletTx.balanceAfter = newBalance;
    walletTx.status = 'completed';
    await walletTx.save();

    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: { newBalance }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
