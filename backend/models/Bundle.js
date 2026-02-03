const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true,
    enum: ['MTN', 'TELECEL', 'AIRTELTIGO'],
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dataAmount: {
    type: String,
    required: true // e.g., "1GB", "2GB", "500MB"
  },
  dataAmountMB: {
    type: Number,
    required: true // Amount in MB for sorting/filtering
  },
  validity: {
    type: String,
    required: true // e.g., "24 hours", "7 days", "30 days"
  },
  validityDays: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  retailPrice: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    default: 'daily'
  },
  description: {
    type: String,
    trim: true
  },
  vtuCode: {
    type: String, // Code used for VTU API
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
bundleSchema.index({ network: 1, isActive: 1 });
bundleSchema.index({ category: 1 });
bundleSchema.index({ retailPrice: 1 });

// Calculate profit margin
bundleSchema.virtual('profitMargin').get(function() {
  return ((this.retailPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
});

bundleSchema.set('toJSON', { virtuals: true });
bundleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bundle', bundleSchema);
