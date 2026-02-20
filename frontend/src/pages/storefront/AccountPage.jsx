import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice.js';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '../../hooks/useCustomer.js';
import { PageLoading, InlineLoading } from '../../components/ui/Loading.jsx';

function ProfileForm({ profile, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-surface-700">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-surface-700">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-surface-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={profile?.email || ''}
          disabled
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl bg-surface-50 sm:text-sm"
        />
        <p className="mt-1 text-xs text-surface-500">Email cannot be changed</p>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-surface-700">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center bg-surface-900 hover:bg-surface-800 text-white rounded-xl font-semibold py-2 px-4 text-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        {success && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  );
}

function PasswordForm({ onSave, isSaving }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await onSave(formData.currentPassword, formData.newPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-surface-700">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData((p) => ({ ...p, currentPassword: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-surface-700">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          required
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center bg-surface-900 hover:bg-surface-800 text-white rounded-xl font-semibold py-2 px-4 text-sm disabled:opacity-50"
        >
          {isSaving ? 'Changing...' : 'Change password'}
        </button>
        {success && <span className="text-sm text-green-600">Password changed!</span>}
      </div>
    </form>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting }) {
  return (
    <div className={`border-2 rounded-2xl p-5 ${address.isDefault ? 'border-primary-300 bg-primary-50' : 'border-surface-200'}`}>
      {address.isDefault && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mb-2">
          Default
        </span>
      )}
      <p className="font-medium text-surface-900">
        {address.firstName} {address.lastName}
      </p>
      <p className="text-sm text-surface-600">{address.address1}</p>
      {address.address2 && <p className="text-sm text-surface-600">{address.address2}</p>}
      <p className="text-sm text-surface-600">
        {address.city}, {address.state} {address.postalCode}
      </p>
      <p className="text-sm text-surface-600">{address.country}</p>
      {address.phone && <p className="text-sm text-surface-600">{address.phone}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(address)}
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Edit
        </button>
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Set default
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AddressForm({ address, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'United States',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface-50 p-4 rounded-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700">First name</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Last name</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700">Address</label>
        <input
          type="text"
          required
          value={formData.address1}
          onChange={(e) => setFormData((p) => ({ ...p, address1: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700">Apartment, suite, etc.</label>
        <input
          type="text"
          value={formData.address2}
          onChange={(e) => setFormData((p) => ({ ...p, address2: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700">City</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">State</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">ZIP</label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
            className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          className="mt-1 block w-full border-2 border-surface-200 rounded-xl focus:border-surface-900 focus:ring-0 sm:text-sm"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData((p) => ({ ...p, isDefault: e.target.checked }))}
          className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-surface-700">
          Set as default address
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center bg-surface-900 hover:bg-surface-800 text-white rounded-xl font-semibold py-2 px-4 text-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-xl border-2 border-surface-200 bg-white py-2 px-4 text-sm font-medium text-surface-700 hover:bg-surface-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSaveAddress = async (addressData) => {
    if (editingAddress) {
      await updateAddress.mutateAsync({
        addressId: editingAddress.id,
        updates: addressData,
      });
      setEditingAddress(null);
    } else {
      await addAddress.mutateAsync(addressData);
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress.mutateAsync(addressId);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-4">Please log in</h2>
        <Link to="/login" className="text-primary-600 hover:text-primary-500">
          Go to login
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading profile: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">My Account</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-surface-500 hover:text-surface-700"
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      {profile?.stats && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5">
            <p className="text-sm text-surface-500">Total Orders</p>
            <p className="text-2xl font-bold text-surface-900">{profile.stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5">
            <p className="text-sm text-surface-500">Total Spent</p>
            <p className="text-2xl font-bold text-surface-900">
              ${(profile.stats.totalSpent / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-surface-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['profile', 'addresses', 'password'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-surface-900 text-surface-900'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
        {activeTab === 'profile' && (
          <ProfileForm
            profile={profile}
            onSave={(data) => updateProfile.mutateAsync(data)}
            isSaving={updateProfile.isPending}
          />
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {showAddressForm || editingAddress ? (
              <AddressForm
                address={editingAddress}
                onSave={handleSaveAddress}
                onCancel={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                }}
                isSaving={addAddress.isPending || updateAddress.isPending}
              />
            ) : (
              <>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center px-4 py-2 border-2 border-dashed border-surface-300 rounded-xl text-sm font-medium text-surface-700 bg-white hover:bg-surface-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add new address
                </button>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile?.addresses?.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={setEditingAddress}
                      onDelete={handleDeleteAddress}
                      onSetDefault={(id) => setDefaultAddress.mutateAsync(id)}
                      isDeleting={deleteAddress.isPending}
                    />
                  ))}
                </div>
                {(!profile?.addresses || profile.addresses.length === 0) && (
                  <p className="text-surface-500 text-center py-8">No addresses saved yet</p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <PasswordForm
            onSave={(currentPassword, newPassword) =>
              changePassword.mutateAsync({ currentPassword, newPassword })
            }
            isSaving={changePassword.isPending}
          />
        )}
      </div>

      {/* Order History Link */}
      <div className="mt-6">
        <Link
          to="/account/orders"
          className="inline-flex items-center text-primary-600 hover:text-primary-500"
        >
          View order history
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
