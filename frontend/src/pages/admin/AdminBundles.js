import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../config/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const AdminBundles = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    network: 'MTN',
    name: '',
    dataAmount: '',
    dataAmountMB: '',
    validity: '',
    validityDays: '',
    costPrice: '',
    retailPrice: '',
    category: 'daily',
    vtuCode: '',
    isPopular: false,
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await adminAPI.getAllBundles();
      setBundles(response.data.data);
    } catch (error) {
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBundles = async () => {
    if (!window.confirm('This will add default bundles. Continue?')) return;

    try {
      await adminAPI.seedBundles();
      toast.success('Bundles seeded successfully!');
      fetchBundles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to seed bundles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBundle) {
        await adminAPI.updateBundle(editingBundle._id, formData);
        toast.success('Bundle updated successfully');
      } else {
        await adminAPI.createBundle(formData);
        toast.success('Bundle created successfully');
      }
      setShowForm(false);
      setEditingBundle(null);
      resetForm();
      fetchBundles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bundle');
    }
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setFormData({
      network: bundle.network,
      name: bundle.name,
      dataAmount: bundle.dataAmount,
      dataAmountMB: bundle.dataAmountMB,
      validity: bundle.validity,
      validityDays: bundle.validityDays,
      costPrice: bundle.costPrice,
      retailPrice: bundle.retailPrice,
      category: bundle.category,
      vtuCode: bundle.vtuCode,
      isPopular: bundle.isPopular,
    });
    setShowForm(true);
  };

  const handleDelete = async (bundleId) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;

    try {
      await adminAPI.deleteBundle(bundleId);
      toast.success('Bundle deleted');
      fetchBundles();
    } catch (error) {
      toast.error('Failed to delete bundle');
    }
  };

  const resetForm = () => {
    setFormData({
      network: 'MTN',
      name: '',
      dataAmount: '',
      dataAmountMB: '',
      validity: '',
      validityDays: '',
      costPrice: '',
      retailPrice: '',
      category: 'daily',
      vtuCode: '',
      isPopular: false,
    });
  };

  const getNetworkStyle = (network) => {
    const styles = {
      MTN: 'bg-mtn text-gray-900',
      TELECEL: 'bg-telecel text-white',
      AIRTELTIGO: 'bg-gradient-to-r from-red-600 to-blue-600 text-white',
    };
    return styles[network] || 'bg-gray-500 text-white';
  };

  const groupedBundles = bundles.reduce((acc, bundle) => {
    if (!acc[bundle.network]) acc[bundle.network] = [];
    acc[bundle.network].push(bundle);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bundle Management</h1>
        <div className="flex space-x-2">
          {bundles.length === 0 && (
            <button onClick={handleSeedBundles} className="btn btn-secondary">
              Seed Default Bundles
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setEditingBundle(null);
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Bundle
          </button>
        </div>
      </div>

      {/* Bundle Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBundle(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="MTN">MTN</option>
                    <option value="TELECEL">Telecel</option>
                    <option value="AIRTELTIGO">AirtelTigo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., MTN Daily 1GB"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Amount</label>
                  <input
                    type="text"
                    value={formData.dataAmount}
                    onChange={(e) => setFormData({ ...formData, dataAmount: e.target.value })}
                    className="input"
                    placeholder="e.g., 1GB"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data (MB)</label>
                  <input
                    type="number"
                    value={formData.dataAmountMB}
                    onChange={(e) => setFormData({ ...formData, dataAmountMB: e.target.value })}
                    className="input"
                    placeholder="e.g., 1024"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
                  <input
                    type="text"
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                    className="input"
                    placeholder="e.g., 24 hours"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                    className="input"
                    placeholder="e.g., 1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="input"
                    placeholder="e.g., 4.50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                    className="input"
                    placeholder="e.g., 5.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VTU Code</label>
                <input
                  type="text"
                  value={formData.vtuCode}
                  onChange={(e) => setFormData({ ...formData, vtuCode: e.target.value })}
                  className="input"
                  placeholder="e.g., MTN-1GB-1D"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700">
                  Mark as Popular
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBundle(null);
                    resetForm();
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingBundle ? 'Update Bundle' : 'Create Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bundles List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="spinner mx-auto"></div>
        </div>
      ) : bundles.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <p>No bundles found. Click "Seed Default Bundles" to add starter bundles.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBundles).map(([network, networkBundles]) => (
            <div key={network}>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium mr-2 ${getNetworkStyle(network)}`}>
                  {network}
                </span>
                <span className="text-gray-500">({networkBundles.length} bundles)</span>
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {networkBundles.map((bundle) => (
                      <tr key={bundle._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="font-medium">{bundle.name}</span>
                            {bundle.isPopular && (
                              <span className="ml-2 badge badge-success">Popular</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{bundle.dataAmount}</td>
                        <td className="px-4 py-3">{bundle.validity}</td>
                        <td className="px-4 py-3">GHS {bundle.costPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3 font-medium">GHS {bundle.retailPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-green-600">
                          GHS {(bundle.retailPrice - bundle.costPrice)?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {bundle.isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-error">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(bundle)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(bundle._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBundles;
