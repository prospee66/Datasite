const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bundle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true
  },
  recipientPhone: {
    type: String,
    required: [true, 'Recipient phone number is required'],
    match: [/^(\+233|0)[0-9]{9}$/, 'Please provide a valid Ghana phone number']
  },
  recipientNetwork: {
    type: String,
    required: true,
    enum: ['MTN', 'TELECEL', 'AIRTELTIGO']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dataAmount: {
    type: String,
    required: true
  },
  transactionRef: {
    type: String,
    required: true,
    unique: true
  },
  paystackReference: {
    type: String,
    sparse: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile_money', 'wallet'],
    required: true
  },
  paymentChannel: {
    type: String // e.g., 'mtn_mobile_money', 'vodafone_cash', 'card'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'failed'],
    default: 'pending'
  },
  vtuResponse: {
    type: mongoose.Schema.Types.Mixed // Store VTU API response
  },
  paystackResponse: {
    type: mongoose.Schema.Types.Mixed // Store Paystack response
  },
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  deliveredAt: Date,
  refundedAt: Date,
  refundReason: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries (transactionRef already indexed via unique: true)
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ paystackReference: 1 }, { sparse: true });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Generate transaction reference
transactionSchema.statics.generateRef = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `OE-${timestamp}-${random}`.toUpperCase();
};

module.exports = mongoose.model('Transaction', transactionSchema);
