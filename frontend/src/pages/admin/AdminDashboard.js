import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../config/api';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = data ? [
    {
      name: 'Total Users',
      value: data.users?.total || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      name: 'Total Revenue',
      value: `GHS ${data.revenue?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Today\'s Revenue',
      value: `GHS ${data.revenue?.todayRevenue?.toFixed(2) || '0.00'}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Transactions',
      value: data.transactions?.total || 0,
      icon: ShoppingCartIcon,
      color: 'bg-orange-500',
      link: '/admin/transactions',
    },
    {
      name: 'Today\'s Transactions',
      value: data.transactions?.today || 0,
      icon: ShoppingCartIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'VTU Balance',
      value: data.vtuBalance !== null ? `GHS ${data.vtuBalance?.toFixed(2)}` : 'N/A',
      icon: WalletIcon,
      color: data.vtuBalance < 1000 ? 'bg-red-500' : 'bg-teal-500',
    },
  ] : [];

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
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`card p-6 ${stat.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={() => stat.link && (window.location.href = stat.link)}
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low VTU Balance Warning */}
      {data?.vtuBalance !== null && data?.vtuBalance < 1000 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <p className="font-medium text-red-800">Low VTU Balance Warning</p>
            <p className="text-sm text-red-600">
              Your VTU balance is running low. Please top up to continue delivering data.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Transaction Status Breakdown */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Transaction Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(data?.transactions?.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={getStatusBadge(status)}>{status}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Network Performance</h2>
          </div>
          <div className="p-6">
            {data?.topNetworks?.length > 0 ? (
              <div className="space-y-4">
                {data.topNetworks.map((network) => (
                  <div key={network._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getNetworkStyle(network._id)}`}>
                        {network._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{network.count} transactions</p>
                      <p className="text-sm text-gray-500">GHS {network.revenue?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No data yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card lg:col-span-2">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-primary-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bundle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recentTransactions?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{tx.user?.firstName} {tx.user?.lastName}</p>
                      <p className="text-sm text-gray-500">{tx.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getNetworkStyle(tx.bundle?.network)}`}>
                          {tx.bundle?.network}
                        </span>
                        <span>{tx.bundle?.dataAmount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{tx.recipientPhone}</td>
                    <td className="px-6 py-4 font-medium">GHS {tx.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(tx.status)}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
