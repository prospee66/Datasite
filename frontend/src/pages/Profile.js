import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  UsersIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    phone: '',
    network: 'MTN',
  });
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  // Referrals
  const [referralData, setReferralData] = useState(null);

  useEffect(() => {
    if (activeTab === 'beneficiaries') {
      fetchBeneficiaries();
    } else if (activeTab === 'referrals') {
      fetchReferrals();
    }
  }, [activeTab]);

  const fetchBeneficiaries = async () => {
    try {
      const response = await userAPI.getBeneficiaries();
      setBeneficiaries(response.data.data);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await userAPI.getReferrals();
      setReferralData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(profileForm);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.addBeneficiary(newBeneficiary);
      toast.success('Beneficiary added');
      setNewBeneficiary({ name: '', phone: '', network: 'MTN' });
      setShowAddBeneficiary(false);
      fetchBeneficiaries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBeneficiary = async (phone) => {
    if (!window.confirm('Remove this beneficiary?')) return;

    try {
      await userAPI.removeBeneficiary(phone);
      toast.success('Beneficiary removed');
      fetchBeneficiaries();
    } catch (error) {
      toast.error('Failed to remove beneficiary');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'password', name: 'Password', icon: KeyIcon },
    { id: 'beneficiaries', name: 'Beneficiaries', icon: UsersIcon },
    { id: 'referrals', name: 'Referrals', icon: UsersIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h1>

      <div className="card">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-2 sm:px-6 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-5 sm:space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input pl-10 bg-gray-50 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="input text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="input text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto py-3 sm:py-2">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-5 sm:space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input text-sm sm:text-base"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input text-sm sm:text-base"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto py-3 sm:py-2">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Beneficiaries Tab */}
          {activeTab === 'beneficiaries' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <p className="text-sm sm:text-base text-gray-600">Save frequent recipients for quick purchases</p>
                <button
                  onClick={() => setShowAddBeneficiary(true)}
                  className="btn btn-primary py-2 sm:py-1.5 w-full sm:w-auto justify-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Beneficiary
                </button>
              </div>

              {showAddBeneficiary && (
                <form onSubmit={handleAddBeneficiary} className="card p-4 mb-6 bg-gray-50">
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newBeneficiary.name}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                      className="input text-sm sm:text-base"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={newBeneficiary.phone}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, phone: e.target.value })}
                      className="input text-sm sm:text-base"
                      required
                    />
                    <select
                      value={newBeneficiary.network}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, network: e.target.value })}
                      className="input text-sm sm:text-base"
                    >
                      <option value="MTN">MTN</option>
                      <option value="TELECEL">Telecel</option>
                      <option value="AIRTELTIGO">AirtelTigo</option>
                    </select>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddBeneficiary(false)}
                      className="btn btn-secondary py-2.5 sm:py-1.5"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary py-2.5 sm:py-1.5">
                      Save
                    </button>
                  </div>
                </form>
              )}

              {beneficiaries.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No beneficiaries saved yet</p>
              ) : (
                <div className="space-y-2">
                  {beneficiaries.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg active:bg-gray-100">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{b.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{b.phone} - {b.network}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveBeneficiary(b.phone)}
                        className="text-red-600 hover:text-red-700 p-2 ml-2 flex-shrink-0"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div>
              <div className="card bg-primary-50 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-semibold text-primary-900 text-sm sm:text-base mb-2">Your Referral Code</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-primary-700">
                    {user?.referralCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user?.referralCode);
                      toast.success('Copied!');
                    }}
                    className="btn btn-primary py-2 sm:py-1.5 w-full sm:w-auto justify-center"
                  >
                    Copy Code
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-primary-700 mt-2">
                  Share this code with friends to earn rewards!
                </p>
              </div>

              {referralData && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="card p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                        {referralData.totalReferrals}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Referrals</p>
                    </div>
                    <div className="card p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        GHS {referralData.earnings?.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Earnings</p>
                    </div>
                  </div>

                  {referralData.referrals?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Your Referrals</h4>
                      <div className="space-y-2">
                        {referralData.referrals.map((ref) => (
                          <div key={ref._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm sm:text-base">{ref.firstName} {ref.lastName}</span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(ref.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
