import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../config/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    network: '',
    search: '',
  });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters.status, filters.network]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTransactions({
        page: pagination.page,
        limit: 20,
        ...filters,
      });
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (transactionId) => {
    setActionLoading(transactionId);
    try {
      const response = await adminAPI.retryTransaction(transactionId);
      if (response.data.success) {
        toast.success('Data delivered successfully!');
      } else {
        toast.error(response.data.message || 'Retry failed');
      }
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Retry failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (transactionId) => {
    const reason = window.prompt('Enter refund reason:');
    if (!reason) return;

    setActionLoading(transactionId);
    try {
      await adminAPI.refundTransaction(transactionId, reason);
      toast.success('Refund processed successfully');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge badge-success',
      pending: 'badge badge-warning',
      processing: 'badge badge-info',
      failed: 'badge badge-error',
      refunded: 'bg-purple-100 text-purple-800',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction Management</h1>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && fetchTransactions()}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input w-auto"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filters.network}
            onChange={(e) => setFilters({ ...filters, network: e.target.value })}
            className="input w-auto"
          >
            <option value="">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="TELECEL">Telecel</option>
            <option value="AIRTELTIGO">AirtelTigo</option>
          </select>
          <button onClick={fetchTransactions} className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bundle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600">{tx.transactionRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{tx.user?.firstName} {tx.user?.lastName}</p>
                      <p className="text-xs text-gray-500">{tx.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getNetworkStyle(tx.recipientNetwork)}`}>
                          {tx.recipientNetwork}
                        </span>
                        <span className="text-sm">{tx.dataAmount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.recipientPhone}</td>
                    <td className="px-4 py-3 text-sm font-medium">GHS {tx.amount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${tx.paymentStatus === 'success' ? 'badge-success' : 'badge-warning'}`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        {tx.paymentStatus === 'success' && tx.deliveryStatus !== 'delivered' && (
                          <button
                            onClick={() => handleRetry(tx._id)}
                            disabled={actionLoading === tx._id}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Retry Delivery"
                          >
                            <ArrowPathIcon className={`h-4 w-4 ${actionLoading === tx._id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        {tx.status !== 'refunded' && tx.paymentStatus === 'success' && (
                          <button
                            onClick={() => handleRefund(tx._id)}
                            disabled={actionLoading === tx._id}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Refund"
                          >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total} transactions)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
