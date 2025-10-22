import { useEffect, useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  AlertCircle,
  Upload,
  X,
  Grid,
  List
} from 'lucide-react';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import ATVRImport from '../../components/admin/ATVRImport';
import ImageSearchModal from '../../components/admin/ImageSearchModal';
import MediaPicker from '../../components/admin/MediaPicker';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading, error } = useSelector((state) => state.products);

  const [showModal, setShowModal] = useState(false);
  const [showATVRImport, setShowATVRImport] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAgeRestricted, setShowAgeRestricted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      nameIs: '',
      description: '',
      descriptionIs: '',
      price: 0,
      stock: 0,
      category: 'WINE',
      subcategory: '',
      isAgeRestricted: false,
      imageUrl: '',
      hasDiscount: false,
      originalPrice: 0,
      discountPercentage: 0,
      discountStartDate: '',
      discountEndDate: '',
      discountReason: '',
      discountReasonIs: ''
    }
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (editingProduct) {
      setValue('name', editingProduct.name);
      setValue('nameIs', editingProduct.nameIs || '');
      setValue('description', editingProduct.description);
      setValue('descriptionIs', editingProduct.descriptionIs || '');
      setValue('price', editingProduct.price);
      setValue('stock', editingProduct.stock);
      setValue('category', editingProduct.category);
      setValue('subcategory', editingProduct.subcategory || '');
      setValue('isAgeRestricted', editingProduct.isAgeRestricted);
      setValue('imageUrl', editingProduct.imageUrl || '');
      setValue('hasDiscount', editingProduct.hasDiscount || false);
      setValue('originalPrice', editingProduct.originalPrice || 0);
      setValue('discountPercentage', editingProduct.discountPercentage || 0);
      setValue('discountStartDate', editingProduct.discountStartDate ? editingProduct.discountStartDate.split('T')[0] : '');
      setValue('discountEndDate', editingProduct.discountEndDate ? editingProduct.discountEndDate.split('T')[0] : '');
      setValue('discountReason', editingProduct.discountReason || '');
      setValue('discountReasonIs', editingProduct.discountReasonIs || '');
      setUploadedImage(editingProduct.imageUrl || null);
    } else {
      reset();
      setUploadedImage(null);
    }
  }, [editingProduct, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: uploadedImage || data.imageUrl
      };

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, ...productData })).unwrap();
        toast.success(t('common', 'success'));
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success(t('common', 'success'));
      }

      setShowModal(false);
      setEditingProduct(null);
      reset();
      setUploadedImage(null);
    } catch (error) {
      toast.error(error.message || t('common', 'error'));
    }
  };

  const handleATVRImport = async (productData) => {
    try {
      // Parse price from string format like "499 kr kr." to number
      const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        // Handle both string and number inputs
        if (typeof priceStr === 'number') return priceStr;
        if (typeof priceStr === 'string') {
          const match = priceStr.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        }
        return 0;
      };

      // Map ATVR category to our category system
      const mapCategory = (atvrCategory) => {
        const categoryMap = {
          'Síder': 'BEER',
          'Bjór': 'BEER', 
          'Beer': 'BEER',
          'Rauðvín': 'WINE',
          'Hvítvín': 'WINE',
          'Rósavín': 'WINE',
          'Freyðivín': 'WINE',
          'Red wine': 'WINE',
          'White wine': 'WINE',
          'Rose wine': 'WINE',
          'Sparkling wine': 'WINE',
          'Sterkt áfengi': 'SPIRITS',
          'Spirits': 'SPIRITS',
          'Líkjör': 'SPIRITS',
          'Liqueur': 'SPIRITS',
          'Cider': 'BEER',
          'Unknown': 'WINE'
        };
        return categoryMap[atvrCategory] || 'WINE';
      };

      // Convert ATVR product data to our format
      const convertedProduct = {
        name: productData.name,
        nameIs: productData.nameIs || productData.name, // Use Icelandic name if available
        description: productData.description || '',
        descriptionIs: productData.descriptionIs || productData.description || '',
        price: parsePrice(productData.price),
        stock: 100, // Default stock for imported products
        category: mapCategory(productData.category),
        ageRestriction: 20, // Iceland's legal drinking age
        imageUrl: productData.image || '',
        // ATVR fields - comprehensive bilingual support
        alcoholContent: productData.alcoholContent,
        volume: productData.volume,
        volumeIs: productData.volumeIs,
        country: productData.country,
        countryIs: productData.countryIs,
        region: productData.region,
        regionIs: productData.regionIs,
        origin: productData.origin,
        originIs: productData.originIs,
        producer: productData.producer,
        producerIs: productData.producerIs,
        distributor: productData.distributor,
        distributorIs: productData.distributorIs,
        packaging: productData.packaging,
        packagingIs: productData.packagingIs,
        packagingWeight: productData.packagingWeight,
        packagingWeightIs: productData.packagingWeightIs,
        carbonFootprint: productData.carbonFootprint,
        carbonFootprintIs: productData.carbonFootprintIs,
        vintage: productData.vintage,
        grapeVariety: productData.grapeVariety,
        grapeVarietyIs: productData.grapeVarietyIs,
        wineStyle: productData.wineStyle,
        wineStyleIs: productData.wineStyleIs,
        pricePerLiter: productData.pricePerLiter,
        pricePerLiterIs: productData.pricePerLiterIs,
        subcategories: productData.subcategories || [],
        foodPairings: JSON.stringify(productData.foodPairings || []),
        foodPairingsIs: JSON.stringify(productData.foodPairingsIs || []),
        specialAttributes: JSON.stringify(productData.specialAttributes || []),
        specialAttributesIs: JSON.stringify(productData.specialAttributesIs || []),
        certifications: JSON.stringify(productData.certifications || []),
        certificationsIs: JSON.stringify(productData.certificationsIs || []),
        storeAvailability: productData.storeAvailability ? JSON.stringify(productData.storeAvailability) : null,
        atvrProductId: productData.atvrProductId,
        atvrUrl: productData.atvrUrl,
        atvrImageUrl: productData.atvrImageUrl,
        availability: productData.availability || 'available',
        availabilityIs: productData.availabilityIs
      };

      await dispatch(createProduct(convertedProduct)).unwrap();
      toast.success(`Product "${productData.name}" imported successfully`);
    } catch (error) {
      console.error('Error importing product:', error);
      toast.error(`Failed to import product: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm(t('common', 'delete') + '?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success(t('common', 'success'));
      } catch (error) {
        toast.error(error.message || t('common', 'error'));
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearchSelect = (imageUrl) => {
    setUploadedImage(imageUrl);
  };

  const handleMediaSelect = (selectedMedia) => {
    if (selectedMedia && selectedMedia.url) {
      setUploadedImage(selectedMedia.url);
      setValue('imageUrl', selectedMedia.url);
    }
    setShowMediaPicker(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.nameIs && product.nameIs.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesAgeFilter = !showAgeRestricted || product.isAgeRestricted;
    
    return matchesSearch && matchesCategory && matchesAgeFilter;
  });

  const categories = [
    { value: 'WINE', label: t('categories', 'WINE') },
    { value: 'BEER', label: t('categories', 'BEER') },
    { value: 'BEERS', label: t('categories', 'BEERS') },
    { value: 'CIDER_RTD', label: t('categories', 'CIDER_RTD') },
    { value: 'SPIRITS', label: t('categories', 'SPIRITS') },
    { value: 'NICOTINE', label: t('categories', 'NICOTINE') },
    { value: 'NON_ALCOHOLIC', label: t('categories', 'NON_ALCOHOLIC') },
    { value: 'OFFERS', label: t('categories', 'OFFERS') }
  ];

  const subcategories = [
    // Wine subcategories
    { value: 'WHITE_WINE', label: t('subcategories', 'WHITE_WINE'), category: 'WINE' },
    { value: 'RED_WINE', label: t('subcategories', 'RED_WINE'), category: 'WINE' },
    { value: 'SPARKLING_WINE', label: t('subcategories', 'SPARKLING_WINE'), category: 'WINE' },
    { value: 'CHAMPAGNE', label: t('subcategories', 'CHAMPAGNE'), category: 'WINE' },
    { value: 'YELLOW_WINE', label: t('subcategories', 'YELLOW_WINE'), category: 'WINE' },
    { value: 'ROSE_WINE', label: t('subcategories', 'ROSE_WINE'), category: 'WINE' },
    // Spirits subcategories
    { value: 'GIN', label: t('subcategories', 'GIN'), category: 'SPIRITS' },
    { value: 'COGNAC', label: t('subcategories', 'COGNAC'), category: 'SPIRITS' },
    { value: 'RUM', label: t('subcategories', 'RUM'), category: 'SPIRITS' },
    { value: 'LIQUEURS_SHOTS', label: t('subcategories', 'LIQUEURS_SHOTS'), category: 'SPIRITS' },
    { value: 'TEQUILA', label: t('subcategories', 'TEQUILA'), category: 'SPIRITS' },
    { value: 'VODKA', label: t('subcategories', 'VODKA'), category: 'SPIRITS' },
    { value: 'WHISKEY', label: t('subcategories', 'WHISKEY'), category: 'SPIRITS' },
    // Nicotine subcategories
    { value: 'VAPE', label: t('subcategories', 'VAPE'), category: 'NICOTINE' },
    { value: 'NICOTINE_PADS', label: t('subcategories', 'NICOTINE_PADS'), category: 'NICOTINE' },
    // Non-alcoholic subcategories
    { value: 'SODA', label: t('subcategories', 'SODA'), category: 'NON_ALCOHOLIC' },
    { value: 'SOFT_DRINKS', label: t('subcategories', 'SOFT_DRINKS'), category: 'NON_ALCOHOLIC' },
    { value: 'ENERGY_DRINKS', label: t('subcategories', 'ENERGY_DRINKS'), category: 'NON_ALCOHOLIC' }
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminPage', 'accessDenied')}</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('adminPage', 'accessDenied')}
              </h2>
              <p className="text-gray-600">
                {t('adminPage', 'noPermission')}
              </p>
            </div>
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

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('common', 'error')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => dispatch(fetchProducts({ limit: 100 }))}
              className="btn btn-primary"
            >
              {t('common', 'retry')}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminProductsPage', 'productManagement')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminProductsPage', 'manageProducts')}</p>
              </div>
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('adminProductsPage', 'newProduct')}
                </button>
                <button
                  onClick={() => setShowATVRImport(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t('adminProducts', 'importFromATVR')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">

        {/* Filters and View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminLabels', 'filters')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('adminLabels', 'gridView')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('adminLabels', 'listView')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('adminProductsPage', 'searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-full"
            >
              <option value="">{t('adminProductsPage', 'allCategories')}</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Age Restricted Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAgeRestricted}
                onChange={(e) => setShowAgeRestricted(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('adminProductsPage', 'showOnlyAgeRestricted')}
              </span>
            </label>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {product.nameIs || product.name}
                    </h3>
                    {product.isAgeRestricted && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.descriptionIs || product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {product.price.toLocaleString()} {t('common', 'currency')}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {product.stock} {t('adminProductsPage', 'inStock')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-outline btn-sm flex-1 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{t('common', 'edit')}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {product.nameIs || product.name}
                          </h3>
                          {product.isAgeRestricted && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {product.descriptionIs || product.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {product.category?.name || 'Unknown'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {product.stock} {t('adminProductsPage', 'inStock')}
                          </span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-lg whitespace-nowrap">
                          {product.price.toLocaleString()} {t('common', 'currency')}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-outline btn-sm flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>{t('common', 'edit')}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('adminProductsPage', 'noProductsFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('adminProductsPage', 'adjustSearchOrAdd')}
            </p>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? t('adminProductsPage', 'editProduct') : t('adminProductsPage', 'newProductTitle')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    reset();
                    setUploadedImage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name (English) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage', 'nameEn')} *
                    </label>
                    <input
                      {...register('name', { required: true })}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('products', 'title')}
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {t('adminProductsPage', 'nameRequired')}
                      </p>
                    )}
                  </div>

                  {/* Name (Icelandic) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage', 'nameIs')}
                    </label>
                    <input
                      {...register('nameIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('adminProductsPage', 'nameIs')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common', 'price')} * ({t('common', 'currency')})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { required: true, min: 0 })}
                      className="input w-full"
                    />
                    {errors.price && (
                      <p className="text-red-600 text-sm mt-1">
                        {t('adminProductsPage', 'priceRequired')}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products', 'stock')} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('stock', { required: true, min: 0 })}
                      className="input w-full"
                    />
                    {errors.stock && (
                      <p className="text-red-600 text-sm mt-1">
                        {t('adminProductsPage', 'stockRequired')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('products', 'category')} *
                    </label>
                    <select
                      {...register('category', { required: true })}
                      className="input w-full"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('adminProductsPage', 'subcategory')}
                    </label>
                    <select
                      {...register('subcategory')}
                      className="input w-full"
                    >
                      <option value="">{t('adminProductsPage', 'selectSubcategory')}</option>
                      {subcategories
                        .filter(sub => sub.category === watch('category'))
                        .map(subcategory => (
                          <option key={subcategory.value} value={subcategory.value}>
                            {subcategory.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age Restricted */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('isAgeRestricted')}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">
                      {t('adminProductsPage', 'ageRestricted')}
                    </label>
                  </div>
                </div>

                {/* Description (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProductsPage', 'descEn')}
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input w-full"
                    placeholder={t('products', 'description')}
                  />
                </div>

                {/* Description (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProductsPage', 'descIs')}
                  </label>
                  <textarea
                    {...register('descriptionIs')}
                    rows={3}
                    className="input w-full"
                    placeholder={t('adminProductsPage', 'descIs')}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adminProductsPage', 'image')}
                  </label>
                  <div className="space-y-2">
                     <div className="flex space-x-2">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="input flex-1"
                       />
                       <button
                         type="button"
                         onClick={() => setShowImageSearch(true)}
                         className="btn btn-outline flex items-center space-x-2"
                       >
                         <Search className="w-4 h-4" />
                         <span>{t('adminLabels', 'searchOnline')}</span>
                       </button>
                       <button
                         type="button"
                         onClick={() => setShowMediaPicker(true)}
                         className="btn btn-outline flex items-center space-x-2"
                       >
                         <Upload className="w-4 h-4" />
                         <span>{t('adminMedia', 'selectFromMedia')}</span>
                       </button>
                     </div>
                    {uploadedImage && (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt={t('adminLabels', 'preview')}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Discount Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('adminProductsPage', 'discountSettings')}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      {...register('hasDiscount')}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      {t('adminProductsPage', 'enableDiscount')}
                    </label>
                  </div>

                  {watch('hasDiscount') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'originalPrice')} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('originalPrice', { min: 0 })}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Discount Percentage */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'discountPercentage')} * (%)
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

                      {/* Discount Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'discountStartDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountStartDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Discount End Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'discountEndDate')}
                        </label>
                        <input
                          type="date"
                          {...register('discountEndDate')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      {/* Discount Reason (English) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'discountReason')}
                        </label>
                        <input
                          {...register('discountReason')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={t('adminProductsPage', 'discountReasonPlaceholder')}
                        />
                      </div>

                      {/* Discount Reason (Icelandic) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('adminProductsPage', 'discountReasonIs')}
                        </label>
                        <input
                          {...register('discountReasonIs')}
                          className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder={t('adminProductsPage', 'discountReasonPlaceholder')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      reset();
                      setUploadedImage(null);
                    }}
                    className="btn btn-outline flex-1"
                  >
                    {t('adminProductsPage', 'cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingProduct ? t('adminProductsPage', 'update') : t('adminProductsPage', 'create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* ATVR Import Modal */}
      {showATVRImport && (
        <ATVRImport
          onImportProduct={handleATVRImport}
          onClose={() => setShowATVRImport(false)}
        />
      )}

      {/* Image Search Modal */}
      {showImageSearch && (
        <ImageSearchModal
          isOpen={showImageSearch}
          onClose={() => setShowImageSearch(false)}
          onSelectImage={handleImageSearchSelect}
          productName={editingProduct?.name || ''}
          category={editingProduct?.category || ''}
          initialQuery={editingProduct?.name || ''}
        />
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        collection="PRODUCTS"
        multiple={false}
      />
    </AdminLayout>
  );
};

export default AdminProducts;


