const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['topup', 'purchase', 'refund', 'referral', 'bonus', 'withdrawal'],
    required: true
  },
  paystackReference: String,
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes (reference already indexed via unique: true)
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ category: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
