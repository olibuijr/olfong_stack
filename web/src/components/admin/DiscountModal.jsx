import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const DISCOUNT_REASON_TEMPLATES = {
  'Seasonal Sale': { en: 'Seasonal Sale', is: 'Árstíðabundin sala' },
  'Clearance': { en: 'Clearance', is: 'Útsölu' },
  'Bundle Deal': { en: 'Bundle Deal', is: 'Búnt tilboð' },
  'Customer Loyalty': { en: 'Customer Loyalty', is: 'Tryggð viðskiptavina' },
  'Stock Reduction': { en: 'Stock Reduction', is: 'Minnkun birgða' },
  'New Item Launch': { en: 'New Item Launch', is: 'Ný vöru sem hleypt er út' }
};

export default function DiscountModal({
  isOpen,
  onClose,
  onSubmit,
  editingDiscount,
  allProducts,
  isLoading
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productId: '',
    originalPrice: '',
    discountPercentage: '',
    discountStartDate: '',
    discountEndDate: '',
    discountReason: '',
    discountReasonIs: '',
    reasonTemplate: 'custom'
  });

  const [errors, setErrors] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (editingDiscount) {
      setFormData({
        productId: editingDiscount.id,
        originalPrice: editingDiscount.originalPrice || '',
        discountPercentage: editingDiscount.discountPercentage || '',
        discountStartDate: editingDiscount.discountStartDate
          ? editingDiscount.discountStartDate.split('T')[0]
          : '',
        discountEndDate: editingDiscount.discountEndDate
          ? editingDiscount.discountEndDate.split('T')[0]
          : '',
        discountReason: editingDiscount.discountReason || '',
        discountReasonIs: editingDiscount.discountReasonIs || '',
        reasonTemplate: 'custom'
      });
    } else {
      setFormData({
        productId: '',
        originalPrice: '',
        discountPercentage: '',
        discountStartDate: '',
        discountEndDate: '',
        discountReason: '',
        discountReasonIs: '',
        reasonTemplate: 'custom'
      });
    }
    setErrors({});
  }, [editingDiscount, isOpen]);

  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = allProducts.filter(
        (p) =>
          !p.hasDiscount &&
          (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.nameIs && p.nameIs.toLowerCase().includes(productSearch.toLowerCase())))
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch, allProducts]);

  const handleProductSelect = (product) => {
    setFormData({
      ...formData,
      productId: product.id,
      originalPrice: product.price || product.basePrice || ''
    });
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleDiscountPercentageChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      discountPercentage: value
    });
    if (errors.discountPercentage) {
      setErrors({
        ...errors,
        discountPercentage: ''
      });
    }
  };

  const handleReasonTemplateChange = (template) => {
    if (template === 'custom') {
      setFormData({
        ...formData,
        reasonTemplate: 'custom',
        discountReason: '',
        discountReasonIs: ''
      });
    } else {
      const templateData = DISCOUNT_REASON_TEMPLATES[template];
      setFormData({
        ...formData,
        reasonTemplate: template,
        discountReason: templateData.en,
        discountReasonIs: templateData.is
      });
    }
  };

  const handleClearDate = (dateField) => {
    setFormData({
      ...formData,
      [dateField]: ''
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editingDiscount && !formData.productId) {
      newErrors.productId = t('discounts.messages.selectProduct');
    }

    if (!formData.discountPercentage) {
      newErrors.discountPercentage = 'Required';
    } else if (
      isNaN(formData.discountPercentage) ||
      formData.discountPercentage < 0 ||
      formData.discountPercentage > 100
    ) {
      newErrors.discountPercentage = t('discounts.messages.invalidDiscount');
    }

    if (
      formData.discountStartDate &&
      formData.discountEndDate &&
      new Date(formData.discountStartDate) > new Date(formData.discountEndDate)
    ) {
      newErrors.dates = t('discounts.messages.startAfterEnd');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedProduct = allProducts.find(p => p.id === formData.productId) || editingDiscount;

    const submitData = {
      productId: formData.productId,
      originalPrice: parseFloat(formData.originalPrice),
      discountPercentage: parseFloat(formData.discountPercentage),
      discountStartDate: formData.discountStartDate || null,
      discountEndDate: formData.discountEndDate || null,
      discountReason: formData.discountReason || null,
      discountReasonIs: formData.discountReasonIs || null
    };

    onSubmit(submitData);
  };

  const getSelectedProduct = () => {
    if (!formData.productId) return null;
    return editingDiscount ||
      allProducts.find(p => p.id === formData.productId);
  };

  const selectedProduct = getSelectedProduct();
  const discountedPrice =
    formData.originalPrice && formData.discountPercentage
      ? parseFloat(formData.originalPrice) * (1 - parseFloat(formData.discountPercentage) / 100)
      : 0;
  const amountSaved =
    formData.originalPrice && formData.discountPercentage
      ? parseFloat(formData.originalPrice) * (parseFloat(formData.discountPercentage) / 100)
      : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingDiscount
              ? t('discounts.modal.editTitle')
              : t('discounts.modal.createTitle')}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Selection */}
          {!editingDiscount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('discounts.modal.selectProduct')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t('discounts.modal.selectProductPlaceholder')}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.productId
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          kr {(product.price || product.basePrice || 0).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.productId && (
                <p className="mt-1 text-sm text-red-500">{errors.productId}</p>
              )}
            </div>
          )}

          {/* Original Price (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discounts.modal.originalPrice')}
            </label>
            <input
              type="text"
              value={`kr ${parseFloat(formData.originalPrice || 0).toLocaleString()}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            />
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discounts.modal.discountPercentage')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleDiscountPercentageChange}
                placeholder="25"
                disabled={isLoading}
                className={`flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.discountPercentage
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <span className="px-3 py-2 text-gray-600 dark:text-gray-400">%</span>
            </div>
            {errors.discountPercentage && (
              <p className="mt-1 text-sm text-red-500">{errors.discountPercentage}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('discounts.modal.discountStartDate')}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formData.discountStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountStartDate: e.target.value
                    })
                  }
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                {formData.discountStartDate && (
                  <button
                    type="button"
                    onClick={() => handleClearDate('discountStartDate')}
                    disabled={isLoading}
                    className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('discounts.modal.discountEndDate')}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formData.discountEndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountEndDate: e.target.value
                    })
                  }
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                {formData.discountEndDate && (
                  <button
                    type="button"
                    onClick={() => handleClearDate('discountEndDate')}
                    disabled={isLoading}
                    className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          {errors.dates && (
            <p className="text-sm text-red-500">{errors.dates}</p>
          )}

          {/* Discount Reason - English */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discounts.modal.discountReason')}
            </label>
            {formData.reasonTemplate === 'custom' ? (
              <input
                type="text"
                value={formData.discountReason}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountReason: e.target.value
                  })
                }
                placeholder="e.g., Seasonal Sale"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                {formData.discountReason}
              </div>
            )}
          </div>

          {/* Discount Reason - Icelandic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discounts.modal.discountReasonIs')}
            </label>
            {formData.reasonTemplate === 'custom' ? (
              <input
                type="text"
                value={formData.discountReasonIs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountReasonIs: e.target.value
                  })
                }
                placeholder="e.g., Árstíðabundin sala"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                {formData.discountReasonIs}
              </div>
            )}
          </div>

          {/* Reason Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discounts.modal.selectReason')}
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(DISCOUNT_REASON_TEMPLATES).map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => handleReasonTemplateChange(template)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.reasonTemplate === template
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {template}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleReasonTemplateChange('custom')}
                disabled={isLoading}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.reasonTemplate === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('discounts.modal.reasonCustom')}
              </button>
            </div>
          </div>

          {/* Live Price Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('discounts.modal.preview')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('discounts.modal.previewOriginal')}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  kr {parseFloat(formData.originalPrice || 0).toLocaleString()}
                </span>
              </div>
              {formData.discountPercentage && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('discounts.modal.previewDiscount')} ({formData.discountPercentage}%):
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -kr {parseFloat(amountSaved).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">
                  {t('discounts.modal.previewFinal')}:
                </span>
                <span className="text-green-600 dark:text-green-400">
                  kr {parseFloat(discountedPrice).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {t('discounts.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('discounts.modal.loading')}
                </>
              ) : editingDiscount ? (
                t('discounts.modal.submitEdit')
              ) : (
                t('discounts.modal.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
