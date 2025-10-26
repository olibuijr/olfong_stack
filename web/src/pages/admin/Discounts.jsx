import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Package, DollarSign, AlertCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import DiscountModal from '../../components/admin/DiscountModal';
import {
  fetchProductsWithDiscounts,
  fetchAllProducts,
  setProductDiscount,
  removeProductDiscount,
  bulkRemoveDiscounts
} from '../../store/slices/discountSlice';

const getDiscountStatus = (product) => {
  const now = new Date();

  if (!product.hasDiscount) return 'inactive';

  if (product.discountStartDate && new Date(product.discountStartDate) > now) {
    return 'scheduled';
  }

  if (product.discountEndDate && new Date(product.discountEndDate) < now) {
    return 'expired';
  }

  if (product.discountEndDate) {
    const daysLeft = (new Date(product.discountEndDate) - now) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 7) return 'expiring';
  }

  return 'active';
};

const getDaysText = (product) => {
  const status = getDiscountStatus(product);
  const now = new Date();

  if (status === 'scheduled') {
    const daysUntil = Math.ceil(
      (new Date(product.discountStartDate) - now) / (1000 * 60 * 60 * 24)
    );
    return `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
  }

  if (status === 'active' || status === 'expiring') {
    const daysLeft = Math.ceil(
      (new Date(product.discountEndDate) - now) / (1000 * 60 * 60 * 24)
    );
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
  }

  return '';
};

export default function Discounts() {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { productsWithDiscounts, allProducts, isLoading, operationLoading } = useSelector(
    (state) => state.discounts
  );

  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingPercentageId, setEditingPercentageId] = useState(null);
  const [editingPercentageValue, setEditingPercentageValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load data on mount
  useEffect(() => {
    dispatch(fetchProductsWithDiscounts());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Compute filtered discounts
  const filteredDiscounts = productsWithDiscounts.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.nameIs && product.nameIs.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = getDiscountStatus(product);
    const matchesStatus = !statusFilter || status === statusFilter;

    const matchesCategory = !categoryFilter || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort by status then by name
  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    const statusOrder = { active: 0, expiring: 1, scheduled: 2, expired: 3 };
    const statusA = getDiscountStatus(a);
    const statusB = getDiscountStatus(b);

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    return a.name.localeCompare(b.name);
  });

  // Pagination
  const totalPages = Math.ceil(sortedDiscounts.length / itemsPerPage);
  const paginatedDiscounts = sortedDiscounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary metrics
  const totalProducts = productsWithDiscounts.length;
  const totalSaved = productsWithDiscounts.reduce(
    (sum, p) => sum + (p.originalPrice * (p.discountPercentage / 100) || 0),
    0
  );
  const avgDiscount =
    totalProducts > 0
      ? (
          productsWithDiscounts.reduce((sum, p) => sum + (p.discountPercentage || 0), 0) /
          totalProducts
        ).toFixed(1)
      : 0;
  const expiringCount = productsWithDiscounts.filter((p) => {
    const status = getDiscountStatus(p);
    return status === 'expiring';
  }).length;

  const expiredCount = productsWithDiscounts.filter((p) => {
    const status = getDiscountStatus(p);
    return status === 'expired';
  }).length;

  // Get unique categories
  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];

  const handleCreateDiscount = () => {
    setEditingDiscount(null);
    setShowModal(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setShowModal(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      await dispatch(
        setProductDiscount({
          productId: editingDiscount?.id || formData.productId,
          originalPrice: formData.originalPrice,
          discountPercentage: formData.discountPercentage,
          discountStartDate: formData.discountStartDate || null,
          discountEndDate: formData.discountEndDate || null,
          discountReason: formData.discountReason,
          discountReasonIs: formData.discountReasonIs
        })
      ).unwrap();

      setShowModal(false);
      setEditingDiscount(null);
      toast.success(editingDiscount ? t('common.updated') : t('common.created'));
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
  };

  const handleRemoveDiscount = async (productId) => {
    if (
      !window.confirm(
        t('discounts.confirm.removeDiscount') ||
          'Are you sure you want to remove this discount? This cannot be undone.'
      )
    )
      return;

    try {
      await dispatch(removeProductDiscount(productId)).unwrap();
      toast.success(t('common.deleted'));
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleExtendDiscount = async (productId, days) => {
    const product = productsWithDiscounts.find((p) => p.id === productId);
    if (!product) return;

    try {
      const newEndDate = new Date(product.discountEndDate);
      newEndDate.setDate(newEndDate.getDate() + days);

      await dispatch(
        setProductDiscount({
          productId,
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          discountStartDate: product.discountStartDate,
          discountEndDate: newEndDate.toISOString().split('T')[0],
          discountReason: product.discountReason,
          discountReasonIs: product.discountReasonIs
        })
      ).unwrap();

      toast.success(t('discounts.messages.extendedSuccessfully'));
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleBulkRemove = async () => {
    if (!window.confirm(`Remove discount from ${selectedProducts.length} products?`)) return;

    try {
      await dispatch(bulkRemoveDiscounts(selectedProducts)).unwrap();
      toast.success(`Removed discounts from ${selectedProducts.length} products`);
      setSelectedProducts([]);
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleBulkExtend = async (days) => {
    try {
      const promises = selectedProducts.map((productId) => {
        const product = productsWithDiscounts.find((p) => p.id === productId);
        if (!product || !product.discountEndDate) return null;

        const newEndDate = new Date(product.discountEndDate);
        newEndDate.setDate(newEndDate.getDate() + days);

        return dispatch(
          setProductDiscount({
            productId,
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage,
            discountStartDate: product.discountStartDate,
            discountEndDate: newEndDate.toISOString().split('T')[0],
            discountReason: product.discountReason,
            discountReasonIs: product.discountReasonIs
          })
        );
      });

      await Promise.all(promises.filter(Boolean));
      toast.success(`Extended ${selectedProducts.length} discounts`);
      setSelectedProducts([]);
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleInlinePercentageEdit = async (productId, newPercentage) => {
    if (newPercentage < 0 || newPercentage > 100) {
      toast.error(t('discounts.messages.invalidDiscount'));
      return;
    }

    const product = productsWithDiscounts.find((p) => p.id === productId);
    if (!product) return;

    try {
      await dispatch(
        setProductDiscount({
          productId,
          originalPrice: product.originalPrice,
          discountPercentage: newPercentage,
          discountStartDate: product.discountStartDate,
          discountEndDate: product.discountEndDate,
          discountReason: product.discountReason,
          discountReasonIs: product.discountReasonIs
        })
      ).unwrap();

      setEditingPercentageId(null);
      toast.success('Discount updated');
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedDiscounts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedDiscounts.map((p) => p.id));
    }
  };

  const handleCleanupExpired = async () => {
    const expiredIds = productsWithDiscounts
      .filter((p) => getDiscountStatus(p) === 'expired')
      .map((p) => p.id);

    if (!window.confirm(`Remove ${expiredIds.length} expired discounts?`)) return;

    try {
      await dispatch(bulkRemoveDiscounts(expiredIds)).unwrap();
      toast.success(`Removed ${expiredIds.length} expired discounts`);
      dispatch(fetchProductsWithDiscounts());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const statusBadgeClass = (status) => {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClass} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case 'scheduled':
        return `${baseClass} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400`;
      case 'expiring':
        return `${baseClass} bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400`;
      case 'expired':
        return `${baseClass} bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400`;
      default:
        return baseClass;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Tag}
          title={t('discounts.title')}
          description={t('discounts.description')}
          action={{
            label: t('discounts.createDiscount'),
            onClick: handleCreateDiscount,
            icon: Plus
          }}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('discounts.summary.productsOnDiscount')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {totalProducts}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('discounts.summary.totalSaved')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  kr {Math.round(totalSaved).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('discounts.summary.averageDiscount')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {avgDiscount}%
                </p>
              </div>
              <Tag className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('discounts.summary.expiringCount')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {expiringCount}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {expiredCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                {expiredCount} discounts have expired
              </span>
            </div>
            <button
              onClick={handleCleanupExpired}
              className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clean Up
            </button>
          </div>
        )}

        {expiringCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                {expiringCount} discounts expiring in the next 7 days
              </span>
            </div>
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedProducts.length} items selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkExtend(7)}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Extend All +7 Days
              </button>
              <button
                onClick={handleBulkRemove}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove All
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('discounts.search')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('discounts.allStatuses')}</option>
              <option value="active">{t('discounts.statusActive')}</option>
              <option value="scheduled">{t('discounts.statusScheduled')}</option>
              <option value="expiring">{t('discounts.statusExpiringsoon')}</option>
              <option value="expired">{t('discounts.statusExpired')}</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('discounts.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {t('discounts.results', { count: filteredDiscounts.length })}
            </span>
          </div>
        </div>

        {/* Table or Empty State */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <Tag className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('discounts.messages.noDiscounts')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('discounts.messages.noDiscountsDescription')}
            </p>
            <button
              onClick={handleCreateDiscount}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('discounts.createDiscount')}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === paginatedDiscounts.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.product')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.category')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.originalPrice')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.discountPercent')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.amountSaved')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.currentPrice')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('discounts.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDiscounts.map((product, idx) => {
                  const status = getDiscountStatus(product);
                  const daysText = getDaysText(product);
                  const discountedPrice = product.originalPrice * (1 - product.discountPercentage / 100);
                  const amountSaved = product.originalPrice * (product.discountPercentage / 100);

                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        status === 'expired'
                          ? 'bg-gray-50 dark:bg-gray-900/30 opacity-60'
                          : idx % 2 === 0
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-50 dark:bg-gray-900/30'
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        kr {product.originalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingPercentageId === product.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingPercentageValue}
                              onChange={(e) => setEditingPercentageValue(e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                handleInlinePercentageEdit(product.id, parseFloat(editingPercentageValue));
                              }}
                              className="text-green-600 dark:text-green-400 hover:text-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingPercentageId(null)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                            onClick={() => {
                              setEditingPercentageId(product.id);
                              setEditingPercentageValue(product.discountPercentage);
                            }}
                          >
                            {product.discountPercentage}%
                            <Edit2 size={14} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        kr {Math.round(amountSaved).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                        kr {Math.round(discountedPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={statusBadgeClass(status)}>
                            {status === 'active' && 'Active'}
                            {status === 'scheduled' && 'Scheduled'}
                            {status === 'expiring' && 'Expiring'}
                            {status === 'expired' && 'Expired'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{daysText}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDiscount(product)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {product.discountEndDate && (
                            <div className="relative group">
                              <button className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                                +
                              </button>
                              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 shadow-lg rounded hidden group-hover:block z-10 border border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => handleExtendDiscount(product.id, 7)}
                                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  +7 Days
                                </button>
                                <button
                                  onClick={() => handleExtendDiscount(product.id, 14)}
                                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                                >
                                  +14 Days
                                </button>
                                <button
                                  onClick={() => handleExtendDiscount(product.id, 30)}
                                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                                >
                                  +30 Days
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveDiscount(product.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        <DiscountModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          editingDiscount={editingDiscount}
          allProducts={allProducts}
          isLoading={operationLoading}
        />
      </div>
    </AdminLayout>
  );
}
