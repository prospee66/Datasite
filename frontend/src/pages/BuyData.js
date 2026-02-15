import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bundleAPI, paymentAPI, walletAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  WalletIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const BuyData = () => {
  const { user, refreshUser } = useAuth();
  const [bundles, setBundles] = useState({ MTN: [], TELECEL: [], AIRTELTIGO: [] });
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSelfPurchase, setIsSelfPurchase] = useState(true);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  useEffect(() => {
    fetchBundles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBundles = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await bundleAPI.getAll();
      const grouped = response.data.grouped || {};
      setBundles(grouped);
      if (Object.keys(grouped).length === 0 && retryCount < 2) {
        // Empty response, retry after a short delay (server may be waking up)
        setTimeout(() => fetchBundles(retryCount + 1), 3000);
        return;
      }
    } catch (error) {
      console.error('Bundle fetch error:', error);
      if (retryCount < 2) {
        // Retry on failure (Render free tier cold start can take 30-60s)
        setTimeout(() => fetchBundles(retryCount + 1), 5000);
        return;
      }
      toast.error('Failed to load data bundles. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const networks = [
    { id: 'MTN', name: 'MTN', color: 'from-yellow-400 to-yellow-500', textColor: 'text-gray-900', bgColor: 'bg-yellow-400' },
    { id: 'TELECEL', name: 'Telecel', color: 'from-red-500 to-red-600', textColor: 'text-white', bgColor: 'bg-red-500' },
    { id: 'AIRTELTIGO', name: 'AirtelTigo', color: 'from-red-500 via-purple-500 to-blue-500', textColor: 'text-white', bgColor: 'bg-purple-500' },
  ];

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const networkBundles = bundles[selectedNetwork] || [];

  // Get unique data amounts for the size selector
  const dataSizes = [...new Set(networkBundles.map(b => b.dataAmount))];

  // Get price range
  const prices = networkBundles.map(b => b.retailPrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+233|0)[0-9]{9}$/.test(cleaned) || /^[0-9]{10}$/.test(cleaned);
  };

  const handleBundleSelect = (bundle) => {
    setSelectedBundle(bundle);
  };

  const handleDataSizeSelect = (dataAmount) => {
    const bundle = networkBundles.find(b => b.dataAmount === dataAmount);
    if (bundle) {
      setSelectedBundle(bundle);
    }
  };

  const getPhoneToUse = () => {
    if (isSelfPurchase) {
      return recipientPhone || user?.phone || '';
    }
    return recipientPhone;
  };

  const handlePurchase = () => {
    if (!selectedBundle) {
      toast.error('Please select a data bundle');
      return;
    }

    const phoneToUse = getPhoneToUse();

    if (!phoneToUse || !validatePhone(phoneToUse)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setShowPaymentOptions(true);
  };

  const handlePaystackPayment = async () => {
    setProcessing(true);
    const phoneToUse = getPhoneToUse();

    try {
      const response = await paymentAPI.initialize({
        bundleId: selectedBundle._id,
        recipientPhone: phoneToUse.replace(/\s/g, ''),
        paymentMethod,
      });

      if (response.data.success) {
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (user.walletBalance < selectedBundle.retailPrice) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setProcessing(true);
    const phoneToUse = getPhoneToUse();

    try {
      const response = await walletAPI.purchase({
        bundleId: selectedBundle._id,
        recipientPhone: phoneToUse.replace(/\s/g, ''),
      });

      if (response.data.success) {
        toast.success('Data delivered successfully!');
        await refreshUser();
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else {
      handlePaystackPayment();
    }
  };

  const resetForm = () => {
    setSelectedBundle(null);
    setRecipientPhone('');
    setPaymentMethod('card');
    setShowPaymentOptions(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-primary-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Loading data bundles...</span>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="flex space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 w-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 w-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Buy Data Bundle</h1>
        <p className="text-gray-600">Select your network and data package</p>
      </div>

      {/* Network Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => {
                setSelectedNetwork(network.id);
                setSelectedBundle(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedNetwork === network.id
                  ? `bg-gradient-to-r ${network.color} ${network.textColor} shadow-lg scale-105`
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedNetwork === network.id ? 'bg-white/20' : network.bgColor
              }`}>
                <span className={`text-sm font-bold ${selectedNetwork === network.id ? '' : network.textColor}`}>
                  {network.name[0]}
                </span>
              </div>
              <span>{network.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/50 overflow-hidden">
        {/* Network Header */}
        <div className={`bg-gradient-to-r ${currentNetwork?.color} p-4 sm:p-6`}>
          <h2 className={`text-xl sm:text-2xl font-bold ${currentNetwork?.textColor}`}>
            {currentNetwork?.name}
          </h2>
          {prices.length > 0 && (
            <p className={`text-lg ${currentNetwork?.textColor} opacity-90 mt-1`}>
              GHS {minPrice.toFixed(2)} – GHS {maxPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Data Size Selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Data Size</h3>
            {dataSizes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No bundles available for {currentNetwork?.name}</p>
                <button
                  onClick={() => fetchBundles(0)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {dataSizes.map((size) => {
                // eslint-disable-next-line no-unused-vars
                const bundle = networkBundles.find(b => b.dataAmount === size);
                const isSelected = selectedBundle?.dataAmount === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleDataSizeSelect(size)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* Selected Bundle Details */}
          {selectedBundle && (
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{selectedBundle.dataAmount}</p>
                  <p className="text-sm text-gray-600">{selectedBundle.validity}</p>
                </div>
                <p className="text-2xl font-bold text-primary-600">
                  GHS {selectedBundle.retailPrice.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Purchase Type Toggle */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsSelfPurchase(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelfPurchase
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                <HeartSolidIcon className={`h-4 w-4 ${isSelfPurchase ? 'text-primary-600' : 'text-gray-400'}`} />
                For Myself
              </button>
              <button
                onClick={() => setIsSelfPurchase(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !isSelfPurchase
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                <ArrowPathIcon className={`h-4 w-4 ${!isSelfPurchase ? 'text-primary-600' : 'text-gray-400'}`} />
                For Someone Else
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {isSelfPurchase ? 'Your Number' : 'Receiver\'s Number'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={isSelfPurchase ? (recipientPhone || user?.phone || '') : recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder={isSelfPurchase ? 'Enter your number E.g. 0241234567' : 'Enter Receiver\'s number E.g. 0599135523'}
                className="input pl-12 text-lg"
                maxLength={10}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Please provide 10 digits only</p>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedBundle}
            className={`w-full btn btn-lg ${
              selectedBundle
                ? `bg-gradient-to-r ${currentNetwork?.color} ${currentNetwork?.textColor} shadow-lg hover:shadow-xl`
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedBundle ? `Purchase - GHS ${selectedBundle.retailPrice.toFixed(2)}` : 'Select a Data Bundle'}
          </button>
        </div>
      </div>

      {/* All Bundles Grid */}
      {networkBundles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">All {currentNetwork?.name} Bundles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {networkBundles.map((bundle) => (
              <button
                key={bundle._id}
                onClick={() => handleBundleSelect(bundle)}
                className={`p-4 rounded-xl text-left transition-all duration-200 ${
                  selectedBundle?._id === bundle._id
                    ? 'bg-primary-50 border-2 border-primary-500 shadow-lg'
                    : 'bg-white border-2 border-gray-100 hover:border-primary-200 hover:shadow-md'
                }`}
              >
                {bundle.isPopular && (
                  <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full mb-2">
                    Popular
                  </span>
                )}
                <p className="text-lg font-bold text-gray-900">{bundle.dataAmount}</p>
                <p className="text-xs text-gray-500 mb-2">{bundle.validity}</p>
                <p className="text-lg font-bold text-primary-600">
                  GHS {bundle.retailPrice.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up sm:mx-4">
            <div className="p-6 pb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Choose Payment Method</h3>
                <button
                  onClick={() => setShowPaymentOptions(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Bundle</span>
                  <span className="font-semibold">{selectedBundle?.dataAmount} {selectedBundle?.network}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Recipient</span>
                  <span className="font-semibold">{getPhoneToUse()}</span>
                </div>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    GHS {selectedBundle?.retailPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                {/* Wallet */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">Wallet Balance</p>
                    <p className="text-sm text-gray-500">GHS {user?.walletBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                  {paymentMethod === 'wallet' && (
                    <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                  )}
                </label>

                {/* Card */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-primary-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">Card Payment</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                  )}
                </label>

                {/* Mobile Money */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-yellow-500/30">
                    <DevicePhoneMobileIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-500">MTN MoMo, Telecel Cash</p>
                  </div>
                  {paymentMethod === 'mobile_money' && (
                    <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                  )}
                </label>
              </div>

              {/* Wallet insufficient warning */}
              {paymentMethod === 'wallet' && user?.walletBalance < selectedBundle?.retailPrice && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  Insufficient balance. You need GHS {(selectedBundle.retailPrice - user.walletBalance).toFixed(2)} more.
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processing || (paymentMethod === 'wallet' && user?.walletBalance < selectedBundle?.retailPrice)}
                className="w-full btn btn-primary btn-lg"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay GHS ${selectedBundle?.retailPrice.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyData;
