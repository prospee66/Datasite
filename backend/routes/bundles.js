const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/bundles
// @desc    Get all active bundles
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { network, category, minPrice, maxPrice } = req.query;

    // Build query
    const query = { isActive: true };

    if (network) {
      query.network = network.toUpperCase();
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (minPrice || maxPrice) {
      query.retailPrice = {};
      if (minPrice) query.retailPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.retailPrice.$lte = parseFloat(maxPrice);
    }

    const bundles = await Bundle.find(query)
      .sort({ network: 1, sortOrder: 1, retailPrice: 1 });

    // Group by network
    const grouped = bundles.reduce((acc, bundle) => {
      if (!acc[bundle.network]) {
        acc[bundle.network] = [];
      }
      acc[bundle.network].push(bundle);
      return acc;
    }, {});

    res.json({
      success: true,
      count: bundles.length,
      data: bundles,
      grouped
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bundles/network/:network
// @desc    Get bundles by network
// @access  Public
router.get('/network/:network', async (req, res, next) => {
  try {
    const network = req.params.network.toUpperCase();

    if (!['MTN', 'TELECEL', 'AIRTELTIGO'].includes(network)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid network. Must be MTN, TELECEL, or AIRTELTIGO'
      });
    }

    const bundles = await Bundle.find({ network, isActive: true })
      .sort({ sortOrder: 1, retailPrice: 1 });

    res.json({
      success: true,
      count: bundles.length,
      data: bundles
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bundles/:id
// @desc    Get single bundle
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    res.json({
      success: true,
      data: bundle
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bundles
// @desc    Create new bundle (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const bundle = await Bundle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Bundle created successfully',
      data: bundle
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bundles/:id
// @desc    Update bundle (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    res.json({
      success: true,
      message: 'Bundle updated successfully',
      data: bundle
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bundles/:id
// @desc    Delete bundle (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Soft delete - just mark as inactive
    bundle.isActive = false;
    await bundle.save();

    res.json({
      success: true,
      message: 'Bundle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bundles/seed
// @desc    Seed initial bundles (Admin only)
// @access  Private/Admin
router.post('/seed', protect, authorize('admin'), async (req, res, next) => {
  try {
    const bundlesData = [
      // MTN Bundles (12 packages)
      { network: 'MTN', name: 'MTN 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: 'Non-Expiry', validityDays: 0, costPrice: 4.50, retailPrice: 6.00, category: 'monthly', vtuCode: 'MTN-1GB', isPopular: true, sortOrder: 1 },
      { network: 'MTN', name: 'MTN 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: 'Non-Expiry', validityDays: 0, costPrice: 9.00, retailPrice: 12.00, category: 'monthly', vtuCode: 'MTN-2GB', sortOrder: 2 },
      { network: 'MTN', name: 'MTN 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: 'Non-Expiry', validityDays: 0, costPrice: 13.00, retailPrice: 17.00, category: 'monthly', vtuCode: 'MTN-3GB', sortOrder: 3 },
      { network: 'MTN', name: 'MTN 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: 'Non-Expiry', validityDays: 0, costPrice: 17.00, retailPrice: 22.00, category: 'monthly', vtuCode: 'MTN-4GB', sortOrder: 4 },
      { network: 'MTN', name: 'MTN 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: 'Non-Expiry', validityDays: 0, costPrice: 20.00, retailPrice: 26.00, category: 'monthly', vtuCode: 'MTN-5GB', isPopular: true, sortOrder: 5 },
      { network: 'MTN', name: 'MTN 8GB', dataAmount: '8GB', dataAmountMB: 8192, validity: 'Non-Expiry', validityDays: 0, costPrice: 30.00, retailPrice: 38.00, category: 'monthly', vtuCode: 'MTN-8GB', sortOrder: 6 },
      { network: 'MTN', name: 'MTN 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: 'Non-Expiry', validityDays: 0, costPrice: 35.00, retailPrice: 44.00, category: 'monthly', vtuCode: 'MTN-10GB', isPopular: true, sortOrder: 7 },
      { network: 'MTN', name: 'MTN 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: 'Non-Expiry', validityDays: 0, costPrice: 55.00, retailPrice: 70.00, category: 'monthly', vtuCode: 'MTN-15GB', sortOrder: 8 },
      { network: 'MTN', name: 'MTN 25GB', dataAmount: '25GB', dataAmountMB: 25600, validity: 'Non-Expiry', validityDays: 0, costPrice: 88.00, retailPrice: 110.00, category: 'monthly', vtuCode: 'MTN-25GB', sortOrder: 9 },
      { network: 'MTN', name: 'MTN 30GB', dataAmount: '30GB', dataAmountMB: 30720, validity: 'Non-Expiry', validityDays: 0, costPrice: 110.00, retailPrice: 137.00, category: 'monthly', vtuCode: 'MTN-30GB', sortOrder: 10 },
      { network: 'MTN', name: 'MTN 40GB', dataAmount: '40GB', dataAmountMB: 40960, validity: 'Non-Expiry', validityDays: 0, costPrice: 142.00, retailPrice: 178.00, category: 'monthly', vtuCode: 'MTN-40GB', sortOrder: 11 },
      { network: 'MTN', name: 'MTN 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: 'Non-Expiry', validityDays: 0, costPrice: 164.00, retailPrice: 205.00, category: 'monthly', vtuCode: 'MTN-50GB', isPopular: true, sortOrder: 12 },

      // AirtelTigo Bundles (11 packages)
      { network: 'AIRTELTIGO', name: 'AirtelTigo 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: 'Non-Expiry', validityDays: 0, costPrice: 4.50, retailPrice: 6.00, category: 'monthly', vtuCode: 'AT-1GB', isPopular: true, sortOrder: 1 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: 'Non-Expiry', validityDays: 0, costPrice: 7.50, retailPrice: 10.00, category: 'monthly', vtuCode: 'AT-2GB', sortOrder: 2 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: 'Non-Expiry', validityDays: 0, costPrice: 11.00, retailPrice: 15.00, category: 'monthly', vtuCode: 'AT-3GB', sortOrder: 3 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: 'Non-Expiry', validityDays: 0, costPrice: 14.00, retailPrice: 18.00, category: 'monthly', vtuCode: 'AT-4GB', sortOrder: 4 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: 'Non-Expiry', validityDays: 0, costPrice: 18.00, retailPrice: 23.00, category: 'monthly', vtuCode: 'AT-5GB', isPopular: true, sortOrder: 5 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 8GB', dataAmount: '8GB', dataAmountMB: 8192, validity: 'Non-Expiry', validityDays: 0, costPrice: 25.00, retailPrice: 32.00, category: 'monthly', vtuCode: 'AT-8GB', sortOrder: 6 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: 'Non-Expiry', validityDays: 0, costPrice: 33.00, retailPrice: 42.00, category: 'monthly', vtuCode: 'AT-10GB', isPopular: true, sortOrder: 7 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: 'Non-Expiry', validityDays: 0, costPrice: 52.00, retailPrice: 65.00, category: 'monthly', vtuCode: 'AT-15GB', sortOrder: 8 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 25GB', dataAmount: '25GB', dataAmountMB: 25600, validity: 'Non-Expiry', validityDays: 0, costPrice: 80.00, retailPrice: 100.00, category: 'monthly', vtuCode: 'AT-25GB', sortOrder: 9 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 30GB', dataAmount: '30GB', dataAmountMB: 30720, validity: 'Non-Expiry', validityDays: 0, costPrice: 128.00, retailPrice: 160.00, category: 'monthly', vtuCode: 'AT-30GB', sortOrder: 10 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: 'Non-Expiry', validityDays: 0, costPrice: 160.00, retailPrice: 200.00, category: 'monthly', vtuCode: 'AT-50GB', isPopular: true, sortOrder: 11 },

      // Telecel Bundles (4 packages)
      { network: 'TELECEL', name: 'Telecel 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: 'Non-Expiry', validityDays: 0, costPrice: 22.00, retailPrice: 28.00, category: 'monthly', vtuCode: 'TEL-5GB', isPopular: true, sortOrder: 1 },
      { network: 'TELECEL', name: 'Telecel 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: 'Non-Expiry', validityDays: 0, costPrice: 35.00, retailPrice: 44.00, category: 'monthly', vtuCode: 'TEL-10GB', isPopular: true, sortOrder: 2 },
      { network: 'TELECEL', name: 'Telecel 20GB', dataAmount: '20GB', dataAmountMB: 20480, validity: 'Non-Expiry', validityDays: 0, costPrice: 61.00, retailPrice: 76.00, category: 'monthly', vtuCode: 'TEL-20GB', sortOrder: 3 },
      { network: 'TELECEL', name: 'Telecel 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: 'Non-Expiry', validityDays: 0, costPrice: 154.00, retailPrice: 193.00, category: 'monthly', vtuCode: 'TEL-50GB', isPopular: true, sortOrder: 4 }
    ];

    // Clear existing bundles (optional)
    // await Bundle.deleteMany({});

    // Insert bundles
    const bundles = await Bundle.insertMany(bundlesData);

    res.status(201).json({
      success: true,
      message: `${bundles.length} bundles seeded successfully`,
      data: bundles
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some bundles already exist. Delete them first or use update.'
      });
    }
    next(error);
  }
});

module.exports = router;
