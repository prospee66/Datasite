import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../config/api';
import {
  WalletIcon,
  ShoppingCartIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes] = await Promise.all([
        transactionAPI.getStats(),
        refreshUser(),
      ]);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Wallet Balance',
      value: `GHS ${user?.walletBalance?.toFixed(2) || '0.00'}`,
      icon: WalletIcon,
      color: 'bg-green-500',
      link: '/wallet',
    },
    {
      name: 'Total Purchases',
      value: stats?.summary?.completedTransactions || 0,
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
      link: '/transactions',
    },
    {
      name: 'Amount Spent',
      value: `GHS ${stats?.summary?.completedAmount?.toFixed(2) || '0.00'}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      link: '/transactions',
    },
    {
      name: 'Failed Transactions',
      value: stats?.summary?.failedTransactions || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      link: '/transactions?status=failed',
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge badge-success',
      pending: 'badge badge-warning',
      processing: 'badge badge-info',
      failed: 'badge badge-error',
    };
    return badges[status] || 'badge';
  };

  const getNetworkStyle = (network) => {
    const styles = {
      MTN: 'bg-mtn text-gray-900',
      TELECEL: 'bg-telecel text-white',
      AIRTELTIGO: 'bg-gradient-to-r from-red-600 to-blue-600 text-white',
    };
    return styles[network] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your account.</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:flex gap-3 sm:gap-4">
        <Link to="/buy-data" className="btn btn-primary justify-center py-3 sm:py-2">
          <ShoppingCartIcon className="h-5 w-5 mr-2" />
          Buy Data
        </Link>
        <Link to="/wallet" className="btn btn-outline justify-center py-3 sm:py-2">
          <WalletIcon className="h-5 w-5 mr-2" />
          Top Up
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card p-4 sm:p-6 hover:shadow-lg transition-shadow active:scale-[0.98]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg w-fit mb-2 sm:mb-0`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Recent Transactions */}
        <div className="card">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <Link to="/transactions" className="text-primary-600 text-sm hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((tx) => (
                <div key={tx._id} className="p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getNetworkStyle(tx.recipientNetwork)}`}>
                        {tx.recipientNetwork?.substring(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {tx.bundle?.dataAmount || tx.dataAmount}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{tx.recipientPhone}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">GHS {tx.amount?.toFixed(2)}</p>
                      <span className={getStatusBadge(tx.status)}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <ClockIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <Link to="/buy-data" className="text-primary-600 hover:underline text-sm">
                  Make your first purchase
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Network Breakdown */}
        <div className="card">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Network Usage</h2>
          </div>
          <div className="p-4 sm:p-6">
            {stats?.networkBreakdown?.length > 0 ? (
              <div className="space-y-4">
                {stats.networkBreakdown.map((network) => {
                  const total = stats.networkBreakdown.reduce((acc, n) => acc + n.count, 0);
                  const percentage = ((network.count / total) * 100).toFixed(0);

                  return (
                    <div key={network._id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            network._id === 'MTN' ? 'bg-mtn' :
                            network._id === 'TELECEL' ? 'bg-telecel' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium text-sm sm:text-base">{network._id}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {network.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            network._id === 'MTN' ? 'bg-mtn' :
                            network._id === 'TELECEL' ? 'bg-telecel' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6 sm:py-8">
                <p>No usage data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Card */}
      {user?.referralCode && (
        <div className="mt-8 card bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Invite Friends & Earn!</h3>
              <p className="text-primary-100 text-sm">
                Share your referral code and earn rewards when friends sign up.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2 inline-flex items-center space-x-2">
                <span className="font-mono font-bold">{user.referralCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.referralCode);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
