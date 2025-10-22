import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Truck,
  RefreshCw,
  ArrowLeft,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ShippingSettings = () => {
  const { t, currentLanguage } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingShippingData, setEditingShippingData] = useState({});

  useEffect(() => {
    loadShippingOptions();
  }, []);

  const loadShippingOptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shipping/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShippingOptions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading shipping options:', error);
      toast.error('Failed to load shipping options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingToggle = async (shippingId, isEnabled) => {
    try {
      const response = await fetch(`/api/shipping/${shippingId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isEnabled })
      });

      if (response.ok) {
        setShippingOptions(prev =>
          prev.map(option =>
            option.id === shippingId
              ? { ...option, isEnabled }
              : option
          )
        );
        toast.success(`Shipping option ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to toggle shipping option');
      }
    } catch (error) {
      console.error('Error toggling shipping option:', error);
      toast.error('Failed to toggle shipping option');
    }
  };

  const handleShippingDelete = async (shippingId) => {
    if (!window.confirm(t('adminSettings', 'confirmDeleteShipping'))) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping/${shippingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setShippingOptions(prev => prev.filter(option => option.id !== shippingId));
        toast.success('Shipping option deleted successfully');
      } else {
        throw new Error('Failed to delete shipping option');
      }
    } catch (error) {
      console.error('Error deleting shipping option:', error);
      toast.error('Failed to delete shipping option');
    }
  };

  const handleShippingCreate = async (createData) => {
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const data = await response.json();
        setShippingOptions(prev => [...prev, data.data]);
        setShowShippingModal(false);
        setEditingShippingData({});
        toast.success('Shipping option created successfully');
      } else {
        throw new Error('Failed to create shipping option');
      }
    } catch (error) {
      console.error('Error creating shipping option:', error);
      toast.error('Failed to create shipping option');
    }
  };

  const handleShippingUpdate = async (shippingId, updateData) => {
    try {
      const response = await fetch(`/api/shipping/${shippingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setShippingOptions(prev =>
          prev.map(option =>
            option.id === shippingId
              ? data.data
              : option
          )
        );
        setShowShippingModal(false);
        setEditingShippingData({});
        toast.success('Shipping option updated successfully');
      } else {
        throw new Error('Failed to update shipping option');
      }
    } catch (error) {
      console.error('Error updating shipping option:', error);
      toast.error('Failed to update shipping option');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="text-red-400 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700">You do not have permission to view this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  const renderShippingModal = () => {
    if (!showShippingModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingShippingData.id ? t('adminSettings', 'editShippingOption') : t('adminSettings', 'addShippingOption')}
              </h3>
              <button
                onClick={() => {
                  setShowShippingModal(false);
                  setEditingShippingData({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());

              // Convert fee to number
              data.fee = parseFloat(data.fee) || 0;
              data.estimatedDays = parseInt(data.estimatedDays) || 1;
              data.sortOrder = parseInt(data.sortOrder) || 0;

              if (editingShippingData.id) {
                handleShippingUpdate(editingShippingData.id, data);
              } else {
                handleShippingCreate(data);
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'nameEnglish')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingShippingData.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'nameIcelandic')}
                    </label>
                    <input
                      type="text"
                      name="nameIs"
                      defaultValue={editingShippingData.nameIs || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings', 'type')}
                  </label>
                  <select
                    name="type"
                    defaultValue={editingShippingData.type || 'DELIVERY'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="DELIVERY">{t('adminSettings', 'delivery')}</option>
                    <option value="PICKUP">{t('adminSettings', 'pickup')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'price')} (ISK)
                    </label>
                    <input
                      type="number"
                      name="fee"
                      defaultValue={editingShippingData.fee || 0}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'estimatedDays')}
                    </label>
                    <input
                      type="number"
                      name="estimatedDays"
                      defaultValue={editingShippingData.estimatedDays || 1}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminSettings', 'sortOrder')}
                    </label>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={editingShippingData.sortOrder || 0}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings', 'descriptionEnglish')}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingShippingData.description || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminSettings', 'descriptionIcelandic')}
                  </label>
                  <textarea
                    name="descriptionIs"
                    defaultValue={editingShippingData.descriptionIs || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowShippingModal(false);
                    setEditingShippingData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                >
                  {t('adminSettings', 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingShippingData.id ? t('adminSettings', 'update') : t('adminSettings', 'create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/settings"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings', 'shipping')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{t('adminSettings', 'shippingDescription')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">{t('adminSettings', 'shippingConfiguration')}</p>
                <p>{t('adminSettings', 'shippingDescription')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div></div>
            <button
              onClick={() => {
                setEditingShippingData({});
                setShowShippingModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('adminSettings', 'addShippingOption')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shippingOptions.map((option) => (
              <div key={option.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                     <div className="min-w-0 flex-1">
                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                         {currentLanguage === 'is' ? option.nameIs : option.name}
                       </h3>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {currentLanguage === 'is' ? option.name : option.nameIs}
                       </p>
                     </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleShippingDelete(option.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title={t('adminSettings', 'delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.isEnabled}
                        onChange={(e) => handleShippingToggle(option.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Description */}
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                   {currentLanguage === 'is' ? option.descriptionIs : option.description}
                 </p>
                 <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 leading-relaxed italic">
                   {currentLanguage === 'is' ? option.description : option.descriptionIs}
                 </p>

                {/* Price and Type */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${option.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.isEnabled ? t('adminSettings', 'enabled') : t('adminSettings', 'disabled')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {option.fee} ISK
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {option.type}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingShippingData(option);
                      setShowShippingModal(true);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                  >
                    {t('adminSettings', 'edit')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {shippingOptions.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('adminSettings', 'noShippingOptions')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('adminSettings', 'noShippingOptionsDescription')}</p>
              <button
                onClick={() => {
                  setEditingShippingData({});
                  setShowShippingModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('adminSettings', 'addFirstShippingOption')}
              </button>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5">⚠️</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">{t('adminSettings', 'shippingNotes')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('adminSettings', 'shippingNote1')}</li>
                  <li>{t('adminSettings', 'shippingNote2')}</li>
                  <li>{t('adminSettings', 'shippingNote3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Modal */}
      {renderShippingModal()}
      </div>
    </AdminLayout>
  );
};

export default ShippingSettings;