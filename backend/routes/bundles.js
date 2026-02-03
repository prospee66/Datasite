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
      // MTN Bundles
      { network: 'MTN', name: 'MTN Daily 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: '24 hours', validityDays: 1, costPrice: 4.50, retailPrice: 5.00, category: 'daily', vtuCode: 'MTN-1GB-1D', isPopular: true, sortOrder: 1 },
      { network: 'MTN', name: 'MTN Daily 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: '24 hours', validityDays: 1, costPrice: 8.00, retailPrice: 9.00, category: 'daily', vtuCode: 'MTN-2GB-1D', sortOrder: 2 },
      { network: 'MTN', name: 'MTN Weekly 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: '7 days', validityDays: 7, costPrice: 11.00, retailPrice: 12.00, category: 'weekly', vtuCode: 'MTN-3GB-7D', sortOrder: 3 },
      { network: 'MTN', name: 'MTN Weekly 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: '7 days', validityDays: 7, costPrice: 16.00, retailPrice: 18.00, category: 'weekly', vtuCode: 'MTN-5GB-7D', isPopular: true, sortOrder: 4 },
      { network: 'MTN', name: 'MTN Monthly 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: '30 days', validityDays: 30, costPrice: 28.00, retailPrice: 30.00, category: 'monthly', vtuCode: 'MTN-10GB-30D', sortOrder: 5 },
      { network: 'MTN', name: 'MTN Monthly 20GB', dataAmount: '20GB', dataAmountMB: 20480, validity: '30 days', validityDays: 30, costPrice: 45.00, retailPrice: 50.00, category: 'monthly', vtuCode: 'MTN-20GB-30D', isPopular: true, sortOrder: 6 },
      { network: 'MTN', name: 'MTN Monthly 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: '30 days', validityDays: 30, costPrice: 90.00, retailPrice: 100.00, category: 'monthly', vtuCode: 'MTN-50GB-30D', sortOrder: 7 },

      // Telecel (Vodafone) Bundles
      { network: 'TELECEL', name: 'Telecel Daily 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: '24 hours', validityDays: 1, costPrice: 4.50, retailPrice: 5.00, category: 'daily', vtuCode: 'VOD-1GB-1D', sortOrder: 1 },
      { network: 'TELECEL', name: 'Telecel Weekly 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: '7 days', validityDays: 7, costPrice: 11.00, retailPrice: 12.00, category: 'weekly', vtuCode: 'VOD-3GB-7D', sortOrder: 2 },
      { network: 'TELECEL', name: 'Telecel Weekly 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: '7 days', validityDays: 7, costPrice: 14.00, retailPrice: 15.00, category: 'weekly', vtuCode: 'VOD-5GB-7D', isPopular: true, sortOrder: 3 },
      { network: 'TELECEL', name: 'Telecel Monthly 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: '30 days', validityDays: 30, costPrice: 28.00, retailPrice: 30.00, category: 'monthly', vtuCode: 'VOD-10GB-30D', sortOrder: 4 },
      { network: 'TELECEL', name: 'Telecel Monthly 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: '30 days', validityDays: 30, costPrice: 40.00, retailPrice: 45.00, category: 'monthly', vtuCode: 'VOD-15GB-30D', isPopular: true, sortOrder: 5 },

      // AirtelTigo Bundles
      { network: 'AIRTELTIGO', name: 'AirtelTigo Daily 1.5GB', dataAmount: '1.5GB', dataAmountMB: 1536, validity: '24 hours', validityDays: 1, costPrice: 4.00, retailPrice: 5.00, category: 'daily', vtuCode: 'AT-1.5GB-1D', sortOrder: 1 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo Weekly 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: '7 days', validityDays: 7, costPrice: 7.00, retailPrice: 8.00, category: 'weekly', vtuCode: 'AT-2GB-7D', sortOrder: 2 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo Weekly 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: '7 days', validityDays: 7, costPrice: 12.00, retailPrice: 14.00, category: 'weekly', vtuCode: 'AT-4GB-7D', isPopular: true, sortOrder: 3 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo Monthly 6GB', dataAmount: '6GB', dataAmountMB: 6144, validity: '30 days', validityDays: 30, costPrice: 18.00, retailPrice: 20.00, category: 'monthly', vtuCode: 'AT-6GB-30D', sortOrder: 4 },
      { network: 'AIRTELTIGO', name: 'AirtelTigo Monthly 12GB', dataAmount: '12GB', dataAmountMB: 12288, validity: '30 days', validityDays: 30, costPrice: 32.00, retailPrice: 35.00, category: 'monthly', vtuCode: 'AT-12GB-30D', isPopular: true, sortOrder: 5 }
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
