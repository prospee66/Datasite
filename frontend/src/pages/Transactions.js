import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../config/api';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    network: '',
    search: '',
  });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, filters.network]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.network && { network: filters.network }),
      };
      const response = await transactionAPI.getAll(params);
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { class: 'badge-success', label: 'Completed' },
      pending: { class: 'badge-warning', label: 'Pending' },
      processing: { class: 'badge-info', label: 'Processing' },
      failed: { class: 'badge-error', label: 'Failed' },
      refunded: { class: 'bg-purple-100 text-purple-800', label: 'Refunded' },
    };
    const badge = badges[status] || { class: 'badge', label: status };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const getNetworkBadge = (network) => {
    const styles = {
      MTN: 'bg-mtn text-gray-900',
      TELECEL: 'bg-telecel text-white',
      AIRTELTIGO: 'bg-gradient-to-r from-red-600 to-blue-600 text-white',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[network] || 'bg-gray-200'}`}>
        {network}
      </span>
    );
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={fetchTransactions}
          className="btn btn-secondary py-2 px-3 sm:px-4"
        >
          <ArrowPathIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input text-sm sm:text-base sm:w-auto"
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
              className="input text-sm sm:text-base sm:w-auto"
            >
              <option value="">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="TELECEL">Telecel</option>
              <option value="AIRTELTIGO">AirtelTigo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DocumentArrowDownIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bundle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">{tx.transactionRef}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getNetworkBadge(tx.recipientNetwork)}
                          <span className="font-medium">{tx.dataAmount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{tx.recipientPhone}</td>
                      <td className="px-6 py-4 font-medium">GHS {tx.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx._id} className="p-3 sm:p-4 active:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getNetworkBadge(tx.recipientNetwork)}
                      <span className="font-medium text-sm">{tx.dataAmount}</span>
                    </div>
                    {getStatusBadge(tx.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {tx.recipientPhone}
                    </div>
                    <span className="font-semibold text-sm">GHS {tx.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span className="font-mono truncate max-w-[120px]">{tx.transactionRef}</span>
                    <span>{formatDate(tx.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex space-x-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="btn btn-secondary flex-1 sm:flex-none py-3 sm:py-2"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="btn btn-secondary flex-1 sm:flex-none py-3 sm:py-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
