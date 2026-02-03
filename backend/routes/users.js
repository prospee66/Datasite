const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // Check if phone already exists
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/beneficiaries
// @desc    Get user's beneficiaries
// @access  Private
router.get('/beneficiaries', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('beneficiaries');

    res.json({
      success: true,
      data: user.beneficiaries || []
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/beneficiaries
// @desc    Add beneficiary
// @access  Private
router.post('/beneficiaries', protect, async (req, res, next) => {
  try {
    const { name, phone, network } = req.body;

    if (!name || !phone || !network) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and network are required'
      });
    }

    // Check if already exists
    const user = await User.findById(req.user._id);
    const exists = user.beneficiaries.some(b => b.phone === phone);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Beneficiary with this phone number already exists'
      });
    }

    // Max 10 beneficiaries
    if (user.beneficiaries.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 beneficiaries allowed'
      });
    }

    user.beneficiaries.push({ name, phone, network: network.toUpperCase() });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Beneficiary added successfully',
      data: user.beneficiaries
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/beneficiaries/:phone
// @desc    Remove beneficiary
// @access  Private
router.delete('/beneficiaries/:phone', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.beneficiaries = user.beneficiaries.filter(
      b => b.phone !== req.params.phone
    );

    await user.save();

    res.json({
      success: true,
      message: 'Beneficiary removed successfully',
      data: user.beneficiaries
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/referrals
// @desc    Get user's referral stats
// @access  Private
router.get('/referrals', protect, async (req, res, next) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('firstName lastName createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        totalReferrals: referrals.length,
        earnings: req.user.referralEarnings,
        referrals
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
