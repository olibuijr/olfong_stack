import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Image as ImageIcon, Wand2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  subcategories,
  uploadedImage,
  setUploadedImage,
  handleImageUpload,
  setShowImageSearch,
  setShowMediaPicker
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [generatingEn, setGeneratingEn] = useState(false);
  const [generatingIs, setGeneratingIs] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset
  } = useForm();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isDirty) {
          const confirmClose = window.confirm(
            t('productModal.unsavedChanges') || 'You have unsaved changes. Are you sure you want to close without saving?'
          );
          if (confirmClose) {
            handleClose();
          }
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDirty, t]);

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      // Basic fields
      setValue('name', editingProduct.name || '');
      setValue('nameIs', editingProduct.nameIs || '');
      setValue('price', editingProduct.price || 0);
      setValue('stock', editingProduct.stock || 0);
      // Handle category - it comes as an object from the database relation, extract the name
      const categoryValue = typeof editingProduct.category === 'object'
        ? editingProduct.category?.name
        : editingProduct.category;
      setValue('category', categoryValue || '');
      // Handle subcategory - it comes as an object from the database relation, extract the name
      const subcategoryValue = typeof editingProduct.subcategory === 'object'
        ? editingProduct.subcategory?.name
        : editingProduct.subcategory;
      setValue('subcategory', subcategoryValue || '');
      setValue('isAgeRestricted', editingProduct.isAgeRestricted || false);
      setValue('ageRestriction', editingProduct.ageRestriction || 18);

      // Descriptions
      setValue('description', editingProduct.description || '');
      setValue('descriptionIs', editingProduct.descriptionIs || '');

      // Product details
      setValue('volume', editingProduct.volume || '');
      setValue('volumeIs', editingProduct.volumeIs || '');
      setValue('alcoholContent', editingProduct.alcoholContent || '');
      setValue('packaging', editingProduct.packaging || '');
      setValue('packagingIs', editingProduct.packagingIs || '');

      // Origin information
      setValue('producer', editingProduct.producer || '');
      setValue('producerIs', editingProduct.producerIs || '');
      setValue('country', editingProduct.country || '');
      setValue('countryIs', editingProduct.countryIs || '');
      setValue('region', editingProduct.region || '');
      setValue('regionIs', editingProduct.regionIs || '');
      setValue('origin', editingProduct.origin || '');
      setValue('originIs', editingProduct.originIs || '');
      setValue('distributor', editingProduct.distributor || '');
      setValue('distributorIs', editingProduct.distributorIs || '');

      // Wine specific
      setValue('vintage', editingProduct.vintage || '');
      setValue('grapeVariety', editingProduct.grapeVariety || '');
      setValue('grapeVarietyIs', editingProduct.grapeVarietyIs || '');
      setValue('wineStyle', editingProduct.wineStyle || '');
      setValue('wineStyleIs', editingProduct.wineStyleIs || '');

      // Pricing
      setValue('pricePerLiter', editingProduct.pricePerLiter || '');
      setValue('pricePerLiterIs', editingProduct.pricePerLiterIs || '');

      // Arrays (parse if they're JSON strings)
      const parseFoodPairings = (data) => {
        if (!data) return '';
        if (Array.isArray(data)) return data.join(', ');
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed.join(', ') : data;
          } catch {
            return data;
          }
        }
        return '';
      };

      setValue('foodPairings', parseFoodPairings(editingProduct.foodPairings));
      setValue('foodPairingsIs', parseFoodPairings(editingProduct.foodPairingsIs));
      setValue('specialAttributes', parseFoodPairings(editingProduct.specialAttributes));
      setValue('specialAttributesIs', parseFoodPairings(editingProduct.specialAttributesIs));
      setValue('certifications', parseFoodPairings(editingProduct.certifications));
      setValue('certificationsIs', parseFoodPairings(editingProduct.certificationsIs));

      // ATVR fields
      setValue('atvrProductId', editingProduct.atvrProductId || '');
      setValue('atvrUrl', editingProduct.atvrUrl || '');
      setValue('atvrImageUrl', editingProduct.atvrImageUrl || '');
      setValue('availability', editingProduct.availability || 'available');
      setValue('availabilityIs', editingProduct.availabilityIs || '');

      // Image
      setValue('imageUrl', editingProduct.imageUrl || '');
      if (editingProduct.imageUrl) {
        setUploadedImage(editingProduct.imageUrl);
      }

      // Discount fields
      setValue('hasDiscount', editingProduct.hasDiscount || false);
      setValue('originalPrice', editingProduct.originalPrice || 0);
      setValue('discountPercentage', editingProduct.discountPercentage || 0);
      setValue('discountStartDate', editingProduct.discountStartDate ? editingProduct.discountStartDate.split('T')[0] : '');
      setValue('discountEndDate', editingProduct.discountEndDate ? editingProduct.discountEndDate.split('T')[0] : '');
      setValue('discountReason', editingProduct.discountReason || '');
      setValue('discountReasonIs', editingProduct.discountReasonIs || '');
    } else {
      reset();
      setUploadedImage(null);
    }
  }, [editingProduct, setValue, reset, setUploadedImage]);

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        t('adminProductModal.unsavedChanges') || 'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }
    setActiveTab('basic');
    reset();
    setUploadedImage(null);
    onClose();
  };

  const handleFormSubmit = (data) => {
    // Convert comma-separated strings back to arrays
    const parseToArray = (str) => {
      if (!str) return [];
      return str.split(',').map(item => item.trim()).filter(item => item);
    };

    const formattedData = {
      ...data,
      foodPairings: JSON.stringify(parseToArray(data.foodPairings)),
      foodPairingsIs: JSON.stringify(parseToArray(data.foodPairingsIs)),
      specialAttributes: JSON.stringify(parseToArray(data.specialAttributes)),
      specialAttributesIs: JSON.stringify(parseToArray(data.specialAttributesIs)),
      certifications: JSON.stringify(parseToArray(data.certifications)),
      certificationsIs: JSON.stringify(parseToArray(data.certificationsIs)),
    };

    onSubmit(formattedData);
  };

  const handleGenerateDescription = async (language) => {
    const productName = language === 'en' ? watch('name') : watch('nameIs');

    if (!productName) {
      alert(language === 'en' ? 'Please enter product name first' : 'Please enter Icelandic product name first');
      return;
    }

    if (language === 'en') {
      setGeneratingEn(true);
    } else {
      setGeneratingIs(true);
    }

    try {
      const response = await api.post('/products/generate/description', {
        productName,
        language,
      });

      if (response.success && response.data?.description) {
        if (language === 'en') {
          setValue('description', response.data.description);
        } else {
          setValue('descriptionIs', response.data.description);
        }
      } else {
        alert('Failed to generate description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Error generating description: ' + (error.response?.data?.message || error.message));
    } finally {
      if (language === 'en') {
        setGeneratingEn(false);
      } else {
        setGeneratingIs(false);
      }
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: t('productModal.tabs.basicInfo'), icon: '📋' },
    { id: 'details', label: t('productModal.tabs.details'), icon: '📝' },
    { id: 'origin', label: t('productModal.tabs.origin'), icon: '🌍' },
    { id: 'pairings', label: t('productModal.tabs.pairingsAttributes'), icon: '🍽️' },
    { id: 'images', label: t('productModal.tabs.images'), icon: '🖼️' },
    { id: 'discounts', label: t('productModal.tabs.discounts'), icon: '💰' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingProduct ? t('adminProductsPage.editProduct') : t('adminProductsPage.newProductTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name (English) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.nameEn')} *
                    </label>
                    <input
                      {...register('name', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Product name in English"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">Name is required</p>
                    )}
                  </div>

                  {/* Name (Icelandic) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.nameIs')} *
                    </label>
                    <input
                      {...register('nameIs', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Vöruheiti á íslensku"
                    />
                    {errors.nameIs && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">Icelandic name is required</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('productModal.fields.price')} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { required: true, min: 0 })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors.price && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t('productModal.errors.priceRequired')}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('productModal.fields.stock')} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('stock', { required: true, min: 0 })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {errors.stock && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t('productModal.errors.stockRequired')}</p>
                    )}
                  </div>

                  {/* Age Restriction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('productModal.fields.ageRestriction')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...register('ageRestriction')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="18"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('productModal.fields.category')} *
                    </label>
                    <select
                      {...register('category', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('productModal.fields.selectCategory')}</option>
                      {categories?.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t('productModal.errors.categoryRequired')}</p>
                    )}
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('productModal.fields.subcategory')}
                    </label>
                    <select
                      {...register('subcategory')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('productModal.fields.selectSubcategory')}</option>
                      {subcategories
                        ?.filter(sub => sub.category === watch('category'))
                        .map(subcategory => (
                          <option key={subcategory.value} value={subcategory.value}>
                            {subcategory.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('isAgeRestricted')}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    {t('productModal.fields.ageRestrictedProduct')}
                  </label>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Descriptions */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('productModal.fields.descriptionEn')}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDescription('en')}
                      disabled={generatingEn || !watch('name')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                        generatingEn || !watch('name')
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>{generatingEn ? 'Generating...' : 'Generate with AI'}</span>
                    </button>
                  </div>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Product description in English"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('productModal.fields.descriptionIs')}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDescription('is')}
                      disabled={generatingIs || !watch('nameIs')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                        generatingIs || !watch('nameIs')
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>{generatingIs ? 'Generating...' : 'Generate with AI'}</span>
                    </button>
                  </div>
                  <textarea
                    {...register('descriptionIs')}
                    rows={4}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Vörulýsing á íslensku"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Volume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Volume (EN)
                    </label>
                    <input
                      {...register('volume')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 500 ml, 750 ml"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Volume (IS)
                    </label>
                    <input
                      {...register('volumeIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="t.d., 500 ml, 750 ml"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alcohol Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alcohol Content (%)
                    </label>
                    <input
                      {...register('alcoholContent')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 5.0, 12.5"
                    />
                  </div>

                  {/* Vintage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vintage (Year)
                    </label>
                    <input
                      {...register('vintage')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Packaging */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Packaging (EN)
                    </label>
                    <input
                      {...register('packaging')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Bottle, Can, Box"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Packaging (IS)
                    </label>
                    <input
                      {...register('packagingIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="t.d., Flaska, Dós"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grape Variety */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grape Variety (EN)
                    </label>
                    <input
                      {...register('grapeVariety')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Cabernet Sauvignon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grape Variety (IS)
                    </label>
                    <input
                      {...register('grapeVarietyIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Þrúgutegund"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Wine Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Wine Style (EN)
                    </label>
                    <input
                      {...register('wineStyle')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Dry, Sweet, Sparkling"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Wine Style (IS)
                    </label>
                    <input
                      {...register('wineStyleIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Vínstíll"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Per Liter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price Per Liter (EN)
                    </label>
                    <input
                      {...register('pricePerLiter')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 2,500 kr/L"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price Per Liter (IS)
                    </label>
                    <input
                      {...register('pricePerLiterIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="t.d., 2.500 kr/L"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Origin Tab */}
            {activeTab === 'origin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Producer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Producer (EN)
                    </label>
                    <input
                      {...register('producer')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Producer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Producer (IS)
                    </label>
                    <input
                      {...register('producerIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Framleiðandi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country (EN)
                    </label>
                    <input
                      {...register('country')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Iceland, France"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country (IS)
                    </label>
                    <input
                      {...register('countryIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="t.d., Ísland, Frakkland"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Region */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Region (EN)
                    </label>
                    <input
                      {...register('region')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Bordeaux, Tuscany"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Region (IS)
                    </label>
                    <input
                      {...register('regionIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Svæði"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Origin (EN)
                    </label>
                    <input
                      {...register('origin')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Specific origin details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Origin (IS)
                    </label>
                    <input
                      {...register('originIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Uppruni"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Distributor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Distributor (EN)
                    </label>
                    <input
                      {...register('distributor')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Distributor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Distributor (IS)
                    </label>
                    <input
                      {...register('distributorIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Dreifingaraðili"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">ATVR Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">ATVR Product ID</label>
                      <input
                        {...register('atvrProductId')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 01448"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">ATVR URL</label>
                      <input
                        {...register('atvrUrl')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                        placeholder="ATVR product page URL"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">ATVR Image URL</label>
                      <input
                        {...register('atvrImageUrl')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                        placeholder="ATVR product image URL"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pairings & Attributes Tab */}
            {activeTab === 'pairings' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Pairings (EN)
                  </label>
                  <input
                    {...register('foodPairings')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Comma-separated, e.g., Fish, Fowl, Beef"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter food pairings separated by commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Pairings (IS)
                  </label>
                  <input
                    {...register('foodPairingsIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Aðskilið með kommum, t.d., Fiskur, Alifuglar, Nautakjöt"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Settu inn matarpör aðskilin með kommum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Attributes (EN)
                  </label>
                  <input
                    {...register('specialAttributes')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Comma-separated, e.g., Organic, Vegan, Premium"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter special attributes separated by commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Attributes (IS)
                  </label>
                  <input
                    {...register('specialAttributesIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Aðskilið með kommum, t.d., Lífrænt, Vegan, Premium"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Settu inn séreiginleika aðskilda með kommum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certifications (EN)
                  </label>
                  <input
                    {...register('certifications')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Comma-separated, e.g., Fair Trade, Kosher"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter certifications separated by commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certifications (IS)
                  </label>
                  <input
                    {...register('certificationsIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Aðskilið með kommum"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Settu inn vottanir aðskildar með kommum
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Availability (EN)
                    </label>
                    <select
                      {...register('availability')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="available">Available</option>
                      <option value="special-order">Special Order</option>
                      <option value="coming-soon">Coming Soon</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Availability (IS)
                    </label>
                    <input
                      {...register('availabilityIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="t.d., Til ráðstöfunar"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('productModal.fields.productImage')}
                  </label>

                  <div className="flex space-x-2 mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageSearch(true)}
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>{t('productModal.buttons.searchOnline')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{t('productModal.buttons.mediaLibrary')}</span>
                    </button>
                  </div>

                  {uploadedImage && (
                    <div className="relative inline-block">
                      <img
                        src={uploadedImage}
                        alt="Product preview"
                        className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {!uploadedImage && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">{t('productModal.fields.noImageSelected')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {t('productModal.help.uploadImageHelp')}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('productModal.fields.imageUrl')}
                  </label>
                  <input
                    {...register('imageUrl')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            )}

            {/* Discounts Tab */}
            {activeTab === 'discounts' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    {...register('hasDiscount')}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('productModal.discounts.enableDiscount')}
                  </label>
                </div>

                {watch('hasDiscount') && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('productModal.discounts.originalPrice')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('originalPrice', { min: 0 })}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('productModal.discounts.discountPercentage')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          {...register('discountPercentage', { min: 0, max: 100 })}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('productModal.discounts.startDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountStartDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('productModal.discounts.endDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountEndDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('productModal.discounts.reasonEn')}
                      </label>
                      <input
                        {...register('discountReason')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('productModal.discounts.reasonPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('productModal.discounts.reasonIs')}
                      </label>
                      <input
                        {...register('discountReasonIs')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={t('productModal.discounts.reasonIsPlaceholder')}
                      />
                    </div>
                  </>
                )}

                {!watch('hasDiscount') && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('productModal.discounts.emptyStateMessage')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline px-6"
              >
                {t('productModal.buttons.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary px-6"
              >
                {editingProduct ? t('productModal.buttons.updateProduct') : t('productModal.buttons.createProduct')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
