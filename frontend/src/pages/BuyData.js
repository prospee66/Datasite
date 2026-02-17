import React, { useState, useEffect } from 'react';
import { bundleAPI, paymentAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const BuyData = () => {
  const [bundles, setBundles] = useState({ MTN: [], TELECEL: [], AIRTELTIGO: [] });
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
        setTimeout(() => fetchBundles(retryCount + 1), 3000);
        return;
      }
    } catch (error) {
      console.error('Bundle fetch error:', error);
      if (retryCount < 2) {
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

  const dataSizes = [...new Set(networkBundles.map(b => b.dataAmount))];

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

  const handlePurchase = () => {
    if (!selectedBundle) {
      toast.error('Please select a data bundle');
      return;
    }

    if (!recipientPhone || !validatePhone(recipientPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setShowPaymentOptions(true);
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const response = await paymentAPI.initializeGuest({
        bundleId: selectedBundle._id,
        recipientPhone: recipientPhone.replace(/\s/g, ''),
        customerEmail: customerEmail.trim(),
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="Enter phone number E.g. 0241234567"
                className="input pl-12 text-lg"
                maxLength={10}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Please provide 10 digits only</p>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input pl-12 text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">For payment receipt and order tracking</p>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
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

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Bundle</span>
                  <span className="font-semibold">{selectedBundle?.dataAmount} {selectedBundle?.network}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Recipient</span>
                  <span className="font-semibold">{recipientPhone}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-sm">{customerEmail}</span>
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
              <div className="space-y-3">
                {/* Card */}
                <label
                  className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-primary-500 rounded-lg flex items-center justify-center mr-3">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 text-sm">Card Payment</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </label>

                {/* Mobile Money */}
                <label
                  className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
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
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 text-sm">Mobile Money</p>
                    <p className="text-xs text-gray-500">MTN MoMo, Telecel Cash</p>
                  </div>
                  {paymentMethod === 'mobile_money' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </label>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={handlePayment}
                disabled={processing}
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
