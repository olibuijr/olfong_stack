import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertCircle,
  Shield,
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RotateCcw
} from 'lucide-react';
import { updateProfile, logout } from '../store/slices/authSlice';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../store/slices/addressSlice';
import { fetchUserOrders, setFilters } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { orders, pagination, filters, isLoading: ordersLoading } = useSelector((state) => state.orders);
  const { addresses, isLoading: addressesLoading } = useSelector((state) => state.addresses);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: ''
    }
  });

  const { register: registerAddress, handleSubmit: handleAddressSubmit, formState: { errors: addressErrors }, reset: resetAddress } = useForm({
    defaultValues: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Iceland',
      isDefault: false
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch user's orders when visiting profile
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders(filters));
    }
  }, [dispatch, isAuthenticated, filters]);

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (editingAddress) {
      resetAddress({
        street: editingAddress.street || '',
        city: editingAddress.city || '',
        postalCode: editingAddress.postalCode || '',
        country: editingAddress.country || 'Iceland',
        isDefault: editingAddress.isDefault || false
      });
    } else {
      resetAddress({
        street: '',
        city: '',
        postalCode: '',
        country: 'Iceland',
        isDefault: false
      });
    }
  }, [editingAddress, resetAddress]);

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success(t('profile.updateSuccess'));
      setShowProfileForm(false);
    } catch (error) {
      toast.error(error.message || t('profile.updateError'));
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      if (editingAddress) {
        await dispatch(updateAddress({ id: editingAddress.id, ...data })).unwrap();
        toast.success(t('addresses.edit'));
      } else {
        await dispatch(createAddress(data)).unwrap();
        toast.success(t('addresses.add'));
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm(t('addresses.delete') + '?')) {
      try {
        await dispatch(deleteAddress(addressId)).unwrap();
        toast.success(t('common.success'));
      } catch (error) {
      toast.error(error.message || t('common.error'));
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success(t('auth.logout'));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CONFIRMED':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'PREPARING':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => t(`orders.statuses.${status}`);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status === filters.status ? '' : status }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('profile.title')}
            </h1>
            <div className="card p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('navigation.language') === 'is' 
                  ? 'Skráðu þig inn' 
                  : 'Please log in'}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('navigation.language') === 'is' 
                  ? 'Þú verður að skrá þig inn til að skoða prófílinn þinn.' 
                  : 'You must be logged in to view your profile.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (addressesLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('profile.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('profilePage.manageInfo')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 mt-4 sm:mt-0 whitespace-nowrap flex-shrink-0"
              >
                {t('profilePage.logout')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Profile Information */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center min-w-0 flex-1">
                  <User className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{t('profilePage.personalInformation')}</span>
                </h2>
                <button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="btn btn-outline btn-sm whitespace-nowrap ml-2 flex-shrink-0 flex items-center"
                >
                  {showProfileForm ? (
                    <>
                      <X className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{t('common.cancel')}</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{t('common.edit')}</span>
                    </>
                  )}
                </button>
              </div>

              {showProfileForm ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profilePage.fullName')}
                    </label>
                    <input
                      {...registerProfile('fullName')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('profilePage.fullName')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profilePage.email')}
                    </label>
                    <input
                      type="email"
                      {...registerProfile('email', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('profilePage.email')}
                    />
                    {profileErrors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {t('profilePage.email')} {t('common.error')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profilePage.phone')}
                    </label>
                    <input
                      type="tel"
                      {...registerProfile('phone')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('profilePage.phone')}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProfileForm(false)}
                      className="btn btn-outline flex-1 whitespace-nowrap flex items-center"
                    >
                      <span>{t('common.cancel')}</span>
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 whitespace-nowrap flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{t('common.save')}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profilePage.name')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.fullName || t('profilePage.notSpecified')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profilePage.email')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.email || t('profilePage.notSpecified')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profilePage.phone')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.phone || t('profilePage.notSpecified')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('profilePage.role')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.role === 'ADMIN' && 'Admin'}
                        {user?.role === 'DELIVERY' && t('delivery.deliveryPerson')}
                        {user?.role === 'CUSTOMER' && 'Customer'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center min-w-0 flex-1">
                  <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{t('profilePage.addresses')}</span>
                </h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="btn btn-primary btn-sm whitespace-nowrap ml-2 flex-shrink-0 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{t('profilePage.newAddress')}</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profilePage.noAddresses')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {address.street}
                            </h3>
                              {address.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                                {t('profilePage.default')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                            {address.city}, {address.postalCode}<br />
                            {address.country}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders embedded */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {t('orders.title')}
                </h2>
              </div>

              {/* Status Filter Dropdown */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('ordersPage.filterByStatus')}:
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="input w-auto min-w-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('ordersPage.allOrders')}</option>
                    <option value="PENDING">{t('ordersPage.pending')}</option>
                    <option value="CONFIRMED">{t('ordersPage.confirmed')}</option>
                    <option value="OUT_FOR_DELIVERY">{t('ordersPage.outForDelivery')}</option>
                    <option value="DELIVERED">{t('ordersPage.delivered')}</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('ordersPage.noOrders')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                              {t('orderDetailPage.order')} #{order.orderNumber}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="min-w-0">
                              <span className="font-medium block">{t('ordersPage.date')}</span>
                              <span className="truncate block">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium block">{t('ordersPage.total')}</span>
                              <span className="truncate block">{order.totalAmount.toLocaleString()} {t('common.currency')}</span>
                            </div>
                            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                              <span className="font-medium block">{t('ordersPage.delivery')}</span>
                              <span className="truncate block">{order.deliveryMethod === 'PICKUP' ? t('ordersPage.pickup') : t('ordersPage.homeDelivery')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => dispatch(fetchUserOrders({ ...filters, page: pagination.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="btn btn-outline btn-sm whitespace-nowrap"
                    >
                      {t('ordersPage.previous')}
                    </button>
                    <span className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {t('ordersPage.page')} {pagination.page} {t('ordersPage.of')} {pagination.pages}
                    </span>
                    <button
                      onClick={() => dispatch(fetchUserOrders({ ...filters, page: pagination.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="btn btn-outline btn-sm whitespace-nowrap"
                    >
                      {t('ordersPage.next')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingAddress ? t('profilePage.editAddress') : t('profilePage.newAddressTitle')}
                </h2>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profilePage.street')} *
                  </label>
                  <input
                    {...registerAddress('street', { required: true })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('profilePage.street')}
                  />
                  {addressErrors.street && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {t('profilePage.streetRequired')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profilePage.city')} *
                    </label>
                    <input
                      {...registerAddress('city', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('profilePage.city')}
                    />
                    {addressErrors.city && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {t('profilePage.cityRequired')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profilePage.postalCode')} *
                    </label>
                    <input
                      {...registerAddress('postalCode', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('profilePage.postalCode')}
                    />
                    {addressErrors.postalCode && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {t('profilePage.postalCodeRequired')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profilePage.country')} *
                  </label>
                  <input
                    {...registerAddress('country', { required: true })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('profilePage.country')}
                  />
                  {addressErrors.country && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {t('navigation.language') === 'is' ? 'Land er nauðsynlegt' : 'Country is required'}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...registerAddress('isDefault')}
                    className="rounded"
                  />
                    <label className="text-sm text-gray-700 dark:text-gray-300">{t('profilePage.setAsDefaultAddress')}</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className="btn btn-outline flex-1 whitespace-nowrap flex items-center"
                  >
                    <span>{t('common.cancel')}</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 whitespace-nowrap flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{editingAddress ? t('adminProductsPage.update') : t('adminProductsPage.create')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


