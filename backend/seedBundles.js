const mongoose = require('mongoose');
const Bundle = require('./models/Bundle');
require('dotenv').config();

const bundles = [
  // MTN Bundles
  { network: 'MTN', name: 'MTN 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: '30 Days', validityDays: 30, costPrice: 4.00, retailPrice: 4.50, category: 'monthly', vtuCode: 'MTN-1GB', isPopular: true, sortOrder: 1 },
  { network: 'MTN', name: 'MTN 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: '30 Days', validityDays: 30, costPrice: 7.50, retailPrice: 8.50, category: 'monthly', vtuCode: 'MTN-2GB', sortOrder: 2 },
  { network: 'MTN', name: 'MTN 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: '30 Days', validityDays: 30, costPrice: 11.00, retailPrice: 12.50, category: 'monthly', vtuCode: 'MTN-3GB', sortOrder: 3 },
  { network: 'MTN', name: 'MTN 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: '30 Days', validityDays: 30, costPrice: 14.50, retailPrice: 16.00, category: 'monthly', vtuCode: 'MTN-4GB', sortOrder: 4 },
  { network: 'MTN', name: 'MTN 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: '30 Days', validityDays: 30, costPrice: 16.00, retailPrice: 18.00, category: 'monthly', vtuCode: 'MTN-5GB', isPopular: true, sortOrder: 5 },
  { network: 'MTN', name: 'MTN 6GB', dataAmount: '6GB', dataAmountMB: 6144, validity: '30 Days', validityDays: 30, costPrice: 22.00, retailPrice: 25.00, category: 'monthly', vtuCode: 'MTN-6GB', sortOrder: 6 },
  { network: 'MTN', name: 'MTN 7GB', dataAmount: '7GB', dataAmountMB: 7168, validity: '30 Days', validityDays: 30, costPrice: 28.00, retailPrice: 32.00, category: 'monthly', vtuCode: 'MTN-7GB', sortOrder: 7 },
  { network: 'MTN', name: 'MTN 8GB', dataAmount: '8GB', dataAmountMB: 8192, validity: '30 Days', validityDays: 30, costPrice: 32.00, retailPrice: 36.00, category: 'monthly', vtuCode: 'MTN-8GB', sortOrder: 8 },
  { network: 'MTN', name: 'MTN 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: '30 Days', validityDays: 30, costPrice: 40.00, retailPrice: 45.00, category: 'monthly', vtuCode: 'MTN-10GB', isPopular: true, sortOrder: 9 },
  { network: 'MTN', name: 'MTN 12GB', dataAmount: '12GB', dataAmountMB: 12288, validity: '30 Days', validityDays: 30, costPrice: 48.00, retailPrice: 55.00, category: 'monthly', vtuCode: 'MTN-12GB', sortOrder: 10 },
  { network: 'MTN', name: 'MTN 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: '30 Days', validityDays: 30, costPrice: 58.00, retailPrice: 65.00, category: 'monthly', vtuCode: 'MTN-15GB', sortOrder: 11 },
  { network: 'MTN', name: 'MTN 20GB', dataAmount: '20GB', dataAmountMB: 20480, validity: '30 Days', validityDays: 30, costPrice: 75.00, retailPrice: 85.00, category: 'monthly', vtuCode: 'MTN-20GB', isPopular: true, sortOrder: 12 },
  { network: 'MTN', name: 'MTN 25GB', dataAmount: '25GB', dataAmountMB: 25600, validity: '30 Days', validityDays: 30, costPrice: 95.00, retailPrice: 105.00, category: 'monthly', vtuCode: 'MTN-25GB', sortOrder: 13 },
  { network: 'MTN', name: 'MTN 30GB', dataAmount: '30GB', dataAmountMB: 30720, validity: '30 Days', validityDays: 30, costPrice: 110.00, retailPrice: 125.00, category: 'monthly', vtuCode: 'MTN-30GB', sortOrder: 14 },
  { network: 'MTN', name: 'MTN 40GB', dataAmount: '40GB', dataAmountMB: 40960, validity: '30 Days', validityDays: 30, costPrice: 145.00, retailPrice: 165.00, category: 'monthly', vtuCode: 'MTN-40GB', sortOrder: 15 },
  { network: 'MTN', name: 'MTN 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: '30 Days', validityDays: 30, costPrice: 180.00, retailPrice: 200.00, category: 'monthly', vtuCode: 'MTN-50GB', sortOrder: 16 },
  { network: 'MTN', name: 'MTN 100GB', dataAmount: '100GB', dataAmountMB: 102400, validity: '30 Days', validityDays: 30, costPrice: 350.00, retailPrice: 395.00, category: 'monthly', vtuCode: 'MTN-100GB', sortOrder: 17 },

  // TELECEL Bundles
  { network: 'TELECEL', name: 'Telecel 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: '30 Days', validityDays: 30, costPrice: 4.00, retailPrice: 5.00, category: 'monthly', vtuCode: 'TEL-1GB', isPopular: true, sortOrder: 1 },
  { network: 'TELECEL', name: 'Telecel 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: '30 Days', validityDays: 30, costPrice: 7.00, retailPrice: 8.00, category: 'monthly', vtuCode: 'TEL-2GB', sortOrder: 2 },
  { network: 'TELECEL', name: 'Telecel 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: '30 Days', validityDays: 30, costPrice: 10.00, retailPrice: 11.50, category: 'monthly', vtuCode: 'TEL-3GB', sortOrder: 3 },
  { network: 'TELECEL', name: 'Telecel 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: '30 Days', validityDays: 30, costPrice: 12.00, retailPrice: 14.00, category: 'monthly', vtuCode: 'TEL-4GB', sortOrder: 4 },
  { network: 'TELECEL', name: 'Telecel 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: '30 Days', validityDays: 30, costPrice: 13.50, retailPrice: 15.00, category: 'monthly', vtuCode: 'TEL-5GB', isPopular: true, sortOrder: 5 },
  { network: 'TELECEL', name: 'Telecel 6GB', dataAmount: '6GB', dataAmountMB: 6144, validity: '30 Days', validityDays: 30, costPrice: 18.00, retailPrice: 20.00, category: 'monthly', vtuCode: 'TEL-6GB', sortOrder: 6 },
  { network: 'TELECEL', name: 'Telecel 8GB', dataAmount: '8GB', dataAmountMB: 8192, validity: '30 Days', validityDays: 30, costPrice: 25.00, retailPrice: 28.00, category: 'monthly', vtuCode: 'TEL-8GB', sortOrder: 7 },
  { network: 'TELECEL', name: 'Telecel 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: '30 Days', validityDays: 30, costPrice: 32.00, retailPrice: 36.00, category: 'monthly', vtuCode: 'TEL-10GB', isPopular: true, sortOrder: 8 },
  { network: 'TELECEL', name: 'Telecel 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: '30 Days', validityDays: 30, costPrice: 40.00, retailPrice: 45.00, category: 'monthly', vtuCode: 'TEL-15GB', sortOrder: 9 },
  { network: 'TELECEL', name: 'Telecel 20GB', dataAmount: '20GB', dataAmountMB: 20480, validity: '30 Days', validityDays: 30, costPrice: 52.00, retailPrice: 58.00, category: 'monthly', vtuCode: 'TEL-20GB', sortOrder: 10 },
  { network: 'TELECEL', name: 'Telecel 30GB', dataAmount: '30GB', dataAmountMB: 30720, validity: '30 Days', validityDays: 30, costPrice: 75.00, retailPrice: 85.00, category: 'monthly', vtuCode: 'TEL-30GB', sortOrder: 11 },
  { network: 'TELECEL', name: 'Telecel 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: '30 Days', validityDays: 30, costPrice: 120.00, retailPrice: 135.00, category: 'monthly', vtuCode: 'TEL-50GB', sortOrder: 12 },

  // AIRTELTIGO Bundles
  { network: 'AIRTELTIGO', name: 'AirtelTigo 1GB', dataAmount: '1GB', dataAmountMB: 1024, validity: '30 Days', validityDays: 30, costPrice: 3.50, retailPrice: 4.50, category: 'monthly', vtuCode: 'AT-1GB', isPopular: true, sortOrder: 1 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 1.5GB', dataAmount: '1.5GB', dataAmountMB: 1536, validity: '30 Days', validityDays: 30, costPrice: 4.50, retailPrice: 5.50, category: 'monthly', vtuCode: 'AT-1.5GB', sortOrder: 2 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 2GB', dataAmount: '2GB', dataAmountMB: 2048, validity: '30 Days', validityDays: 30, costPrice: 6.00, retailPrice: 7.00, category: 'monthly', vtuCode: 'AT-2GB', sortOrder: 3 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 3GB', dataAmount: '3GB', dataAmountMB: 3072, validity: '30 Days', validityDays: 30, costPrice: 9.00, retailPrice: 10.50, category: 'monthly', vtuCode: 'AT-3GB', sortOrder: 4 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 4GB', dataAmount: '4GB', dataAmountMB: 4096, validity: '30 Days', validityDays: 30, costPrice: 12.50, retailPrice: 14.00, category: 'monthly', vtuCode: 'AT-4GB', isPopular: true, sortOrder: 5 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 5GB', dataAmount: '5GB', dataAmountMB: 5120, validity: '30 Days', validityDays: 30, costPrice: 15.00, retailPrice: 17.00, category: 'monthly', vtuCode: 'AT-5GB', sortOrder: 6 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 6GB', dataAmount: '6GB', dataAmountMB: 6144, validity: '30 Days', validityDays: 30, costPrice: 18.00, retailPrice: 20.00, category: 'monthly', vtuCode: 'AT-6GB', sortOrder: 7 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 8GB', dataAmount: '8GB', dataAmountMB: 8192, validity: '30 Days', validityDays: 30, costPrice: 24.00, retailPrice: 27.00, category: 'monthly', vtuCode: 'AT-8GB', sortOrder: 8 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 10GB', dataAmount: '10GB', dataAmountMB: 10240, validity: '30 Days', validityDays: 30, costPrice: 30.00, retailPrice: 34.00, category: 'monthly', vtuCode: 'AT-10GB', sortOrder: 9 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 12GB', dataAmount: '12GB', dataAmountMB: 12288, validity: '30 Days', validityDays: 30, costPrice: 32.00, retailPrice: 35.00, category: 'monthly', vtuCode: 'AT-12GB', isPopular: true, sortOrder: 10 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 15GB', dataAmount: '15GB', dataAmountMB: 15360, validity: '30 Days', validityDays: 30, costPrice: 38.00, retailPrice: 42.00, category: 'monthly', vtuCode: 'AT-15GB', sortOrder: 11 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 20GB', dataAmount: '20GB', dataAmountMB: 20480, validity: '30 Days', validityDays: 30, costPrice: 48.00, retailPrice: 55.00, category: 'monthly', vtuCode: 'AT-20GB', sortOrder: 12 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 30GB', dataAmount: '30GB', dataAmountMB: 30720, validity: '30 Days', validityDays: 30, costPrice: 70.00, retailPrice: 80.00, category: 'monthly', vtuCode: 'AT-30GB', sortOrder: 13 },
  { network: 'AIRTELTIGO', name: 'AirtelTigo 50GB', dataAmount: '50GB', dataAmountMB: 51200, validity: '30 Days', validityDays: 30, costPrice: 110.00, retailPrice: 125.00, category: 'monthly', vtuCode: 'AT-50GB', sortOrder: 14 },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing bundles
    await Bundle.deleteMany({});
    console.log('Cleared existing bundles');

    // Insert new bundles
    await Bundle.insertMany(bundles);
    console.log(`Successfully seeded ${bundles.length} bundles`);

    // Show summary
    const mtnCount = bundles.filter(b => b.network === 'MTN').length;
    const telecelCount = bundles.filter(b => b.network === 'TELECEL').length;
    const airteltigoCount = bundles.filter(b => b.network === 'AIRTELTIGO').length;

    console.log('\nSummary:');
    console.log(`- MTN: ${mtnCount} bundles`);
    console.log(`- TELECEL: ${telecelCount} bundles`);
    console.log(`- AIRTELTIGO: ${airteltigoCount} bundles`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
