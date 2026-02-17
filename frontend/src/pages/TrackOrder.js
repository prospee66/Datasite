import React, { useState } from 'react';
import { transactionAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const TrackOrder = () => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let response;
      if (searchType === 'phone') {
        response = await transactionAPI.lookupByPhone(searchValue.trim());
      } else {
        response = await transactionAPI.lookupByReference(searchValue.trim());
      }

      if (response.data.success) {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        setTransactions(data);

        if (data.length === 0) {
          toast('No transactions found', { icon: 'ℹ️' });
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setTransactions([]);
        toast('No transactions found', { icon: 'ℹ️' });
      } else {
        toast.error(error.response?.data?.message || 'Search failed');
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (tx) => {
    if (tx.deliveryStatus === 'delivered') return 'Delivered';
    if (tx.status === 'completed') return 'Completed';
    if (tx.status === 'failed') return 'Failed';
    if (tx.paymentStatus === 'pending') return 'Payment Pending';
    if (tx.status === 'processing') return 'Processing';
    return 'Pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-600">
          Enter your phone number or transaction reference to check your order status
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/50 p-6 mb-8">
        <form onSubmit={handleSearch}>
          {/* Search Type Toggle */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => { setSearchType('phone'); setSearchValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                searchType === 'phone'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DevicePhoneMobileIcon className="h-5 w-5" />
              Phone Number
            </button>
            <button
              type="button"
              onClick={() => { setSearchType('reference'); setSearchValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                searchType === 'reference'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Reference
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <input
              type={searchType === 'phone' ? 'tel' : 'text'}
              value={searchValue}
              onChange={(e) => {
                if (searchType === 'phone') {
                  setSearchValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                } else {
                  setSearchValue(e.target.value);
                }
              }}
              placeholder={
                searchType === 'phone'
                  ? 'E.g. 0241234567'
                  : 'E.g. OE-XXXXX-XXXXX'
              }
              className="input flex-1 text-lg"
              maxLength={searchType === 'phone' ? 10 : undefined}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 sm:px-8"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No transactions found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different phone number or reference</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                Found {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </h2>

              {transactions.map((tx) => (
                <div key={tx._id || tx.transactionRef} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/50 p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reference</p>
                      <p className="font-mono font-semibold text-sm">{tx.transactionRef}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-semibold">{tx.dataAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Network</p>
                      <p className="font-semibold">{tx.recipientNetwork}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recipient</p>
                      <p className="font-semibold">{tx.recipientPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-semibold">GHS {tx.amount?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <p className="text-xs text-gray-500">
                      Purchased on {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    {tx.deliveredAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Delivered on {new Date(tx.deliveredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
