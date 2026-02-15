import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletAPI, paymentAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  WalletIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Wallet = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWalletData = async () => {
    try {
      const [txResponse] = await Promise.all([
        walletAPI.getTransactions({ limit: 20 }),
        refreshUser(),
      ]);
      setTransactions(txResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount (minimum GHS 1)');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentAPI.walletTopup(amount);
      if (response.data.success) {
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize top-up');
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (category, type) => {
    if (type === 'credit') {
      return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
    }
    return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      topup: 'Top Up',
      purchase: 'Data Purchase',
      refund: 'Refund',
      referral: 'Referral Bonus',
      bonus: 'Bonus',
    };
    return labels[category] || category;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white p-5 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm sm:text-base mb-1">Wallet Balance</p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              GHS {user?.walletBalance?.toFixed(2) || '0.00'}
            </h2>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
            <WalletIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        </div>
        <button
          onClick={() => setShowTopup(true)}
          className="mt-4 sm:mt-6 w-full sm:w-auto bg-white text-primary-700 px-6 py-3 sm:py-2 rounded-lg font-medium hover:bg-gray-100 active:scale-[0.98] transition-all inline-flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Top Up Wallet
        </button>
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-b-xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Top Up Wallet</h3>

            {/* Quick Amounts */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopupAmount(amount.toString())}
                  className={`py-3 sm:py-2 rounded-lg border text-sm sm:text-base font-medium transition-colors active:scale-[0.98] ${
                    topupAmount === amount.toString()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  GHS {amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  GHS
                </span>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  inputMode="decimal"
                  className="input pl-14 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-4">
              <button
                onClick={() => {
                  setShowTopup(false);
                  setTopupAmount('');
                }}
                className="btn btn-secondary flex-1 py-3 sm:py-2"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={processing || !topupAmount}
                className="btn btn-primary flex-1 py-3 sm:py-2"
              >
                {processing ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="card">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold">Wallet History</h3>
        </div>

        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="spinner mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <ClockIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Top up your wallet to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx._id} className="p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {getCategoryIcon(tx.category, tx.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {getCategoryLabel(tx.category)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`font-semibold text-sm sm:text-base ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}GHS {tx.amount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
