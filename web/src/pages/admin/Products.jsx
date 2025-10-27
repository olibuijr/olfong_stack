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
  List,
  Sparkles
} from 'lucide-react';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import ATVRImport from '../../components/admin/ATVRImport';
import ImageSearchModal from '../../components/admin/ImageSearchModal';
import MediaPicker from '../../components/admin/MediaPicker';
import ProductModal from '../../components/admin/ProductModal';
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
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [showAgeRestricted, setShowAgeRestricted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currencySymbol, setCurrencySymbol] = useState('kr'); // Default to kr
  const [generatingMediaIds, setGeneratingMediaIds] = useState({}); // Track which products are generating AI images with progress {mediaId: progress%}
  const [jobMappings, setJobMappings] = useState({}); // Track mediaId -> jobId mappings for RunPod status polling

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

  // Fetch and resume polling for any ongoing AI image generation jobs
  useEffect(() => {
    const fetchOngoingJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
        const response = await fetch(`${apiBase}/api/ai-image/ongoing-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.jobMappings && Object.keys(data.jobMappings).length > 0) {
            console.log('Resuming AI image generation polling for ongoing jobs:', data.jobMappings);
            const mediaIds = Object.keys(data.jobMappings);
            handleGeneratingProducts(mediaIds, data.jobMappings);
          }
        }
      } catch (error) {
        console.error('Error fetching ongoing jobs:', error);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchOngoingJobs();
    }
  }, [user]);

  useEffect(() => {
    if (editingProduct) {
      setValue('name', editingProduct.name);
      setValue('nameIs', editingProduct.nameIs || '');
      setValue('description', editingProduct.description);
      setValue('descriptionIs', editingProduct.descriptionIs || '');
      setValue('price', editingProduct.price);
      setValue('stock', editingProduct.stock);
      setValue('category', editingProduct.category?.name || editingProduct.category || '');
      setValue('subcategory', editingProduct.subcategory?.name || '');
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

  // Fetch currency symbol from settings
  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      try {
        const response = await fetch('/api/settings/public', {});
        const data = await response.json();
        if (data.data && data.data.settings) {
          // Handle both array and object formats
          if (Array.isArray(data.data.settings)) {
            const currencySetting = data.data.settings.find(s => s.key === 'currencySymbol');
            if (currencySetting && currencySetting.value) {
              setCurrencySymbol(currencySetting.value);
            }
          } else if (typeof data.data.settings === 'object' && data.data.settings.currencySymbol) {
            // Direct object format
            setCurrencySymbol(data.data.settings.currencySymbol);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch currency symbol:', error);
        // Keep default 'kr'
      }
    };
    fetchCurrencySymbol();
  }, []);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: uploadedImage || data.imageUrl
      };

      console.log('Form submitted with data:', productData);

      if (editingProduct) {
        console.log('Dispatching updateProduct with id:', editingProduct.id, 'productData:', productData);
        await dispatch(updateProduct({ id: editingProduct.id, productData })).unwrap();
        toast.success(t('common.success'));
      } else {
        console.log('Dispatching createProduct');
        await dispatch(createProduct(productData)).unwrap();
        toast.success(t('common.success'));
      }

      setShowModal(false);
      setEditingProduct(null);
      reset();
      setUploadedImage(null);
    } catch (error) {
      console.error('onSubmit error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error payload:', error.payload);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error(error.message || t('common.error'));
    }
  };

  const pollGenerationStatus = async (mediaId, jobId) => {
    const maxAttempts = 120; // Poll for up to 10 minutes (120 * 5 second intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
        const response = await fetch(`${apiBase}/api/ai-image/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error(`Failed to check status for job ${jobId}`);
          // Update progress based on time passed
          const progress = Math.min(10 + (attempts * 0.75), 95);
          setGeneratingMediaIds(prev => ({...prev, [mediaId]: Math.round(progress)}));
          return false;
        }

        const data = await response.json();
        console.log(`Job ${jobId} status:`, data.status);

        if (data.status === 'COMPLETED') {
          // Set progress to 100%
          setGeneratingMediaIds(prev => ({...prev, [mediaId]: 100}));

          // Refresh products to get the new image
          dispatch(fetchProducts()).then(() => {
            console.log(`AI image generation completed for mediaId ${mediaId}`);
            // Remove from generating list
            setGeneratingMediaIds(prev => {
              const newState = { ...prev };
              delete newState[mediaId];
              return newState;
            });
          });
          return true;
        } else if (data.status === 'FAILED') {
          console.error(`Generation failed for job ${jobId}: ${data.error}`);
          toast.error(`Generation failed for job ${jobId}: ${data.error}`);
          setGeneratingMediaIds(prev => {
            const newState = { ...prev };
            delete newState[mediaId];
            return newState;
          });
          return true; // Stop polling on failure
        }

        // Still processing - update progress based on attempts
        // Progress moves from 10% to 95% as time passes
        const progress = Math.min(10 + (attempts * 0.75), 95);
        setGeneratingMediaIds(prev => ({...prev, [mediaId]: Math.round(progress)}));
        return false;
      } catch (error) {
        console.error(`Error polling status for job ${jobId}:`, error);
        // Still update progress on error
        const progress = Math.min(10 + (attempts * 0.75), 95);
        setGeneratingMediaIds(prev => ({...prev, [mediaId]: Math.round(progress)}));
        return false;
      }
    };

    // Poll for status
    const pollInterval = setInterval(async () => {
      attempts++;
      const isDone = await poll();

      if (isDone || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        if (attempts >= maxAttempts) {
          console.warn(`Polling timeout for job ${jobId}`);
          setGeneratingMediaIds(prev => {
            const newState = { ...prev };
            delete newState[mediaId];
            return newState;
          });
        }
      }
    }, 5000); // Poll every 5 seconds

    return pollInterval;
  };

  const handleGeneratingProducts = async (mediaIds, newJobMappings = {}) => {
    // Store the job mappings for status polling
    setJobMappings(newJobMappings);

    // Track which products are generating AI images with initial progress
    const initialProgress = {};
    mediaIds.forEach(id => {
      initialProgress[id] = 5; // Start at 5%
    });
    setGeneratingMediaIds(initialProgress);

    // Immediately check status for each job to get accurate progress
    for (const mediaId of mediaIds) {
      const jobId = newJobMappings[mediaId];
      if (jobId) {
        console.log(`Starting to poll RunPod status for mediaId ${mediaId} with jobId ${jobId}`);

        // Get immediate status update before starting polling
        try {
          const token = localStorage.getItem('token');
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
          const response = await fetch(`${apiBase}/api/ai-image/status/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Initial status for job ${jobId}:`, data.status);

            if (data.status === 'COMPLETED') {
              setGeneratingMediaIds(prev => ({...prev, [mediaId]: 100}));
              // Refresh products to get the new image
              dispatch(fetchProducts()).then(() => {
                setGeneratingMediaIds(prev => {
                  const newState = { ...prev };
                  delete newState[mediaId];
                  return newState;
                });
              });
              continue; // Skip polling for completed jobs
            } else if (data.status === 'FAILED') {
              console.error(`Job ${jobId} already failed`);
              toast.error(`Generation failed for job ${jobId}: ${data.error || 'Unknown error'}`);
              setGeneratingMediaIds(prev => {
                const newState = { ...prev };
                delete newState[mediaId];
                return newState;
              });
              continue; // Skip polling for failed jobs
            } else if (data.status === 'IN_PROGRESS' || data.status === 'IN_QUEUE') {
              // Update to a more accurate initial progress for in-progress jobs
              setGeneratingMediaIds(prev => ({...prev, [mediaId]: 30}));
            }
          }
        } catch (error) {
          console.error(`Error checking initial status for job ${jobId}:`, error);
        }

        pollGenerationStatus(mediaId, jobId);
      } else {
        // Fallback to media status polling if no jobId
        console.warn(`No jobId found for mediaId ${mediaId}, using media status polling as fallback`);
        pollMediaStatus(mediaId);
      }
    }
  };

  const pollMediaStatus = async (mediaId) => {
    const maxAttempts = 120; // Poll for up to 10 minutes (120 * 5 second intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com';
        const response = await fetch(`${apiBase}/api/media/${mediaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        const media = data.data || data;

        // Check if this is a newly generated image (contains 'ai-' in filename)
        if (media.url && media.url.includes('ai-')) {
          // Update the product with the new image
          const updatedProducts = products.map(p =>
            p.mediaId === mediaId
              ? { ...p, imageUrl: media.url }
              : p
          );

          // Dispatch to update Redux store
          dispatch({
            type: 'products/fulfilled',
            payload: updatedProducts
          });

          console.log(`AI image generation completed for mediaId ${mediaId}`);

          // Remove from generating list
          setGeneratingMediaIds(prev => {
            const newState = { ...prev };
            delete newState[mediaId];
            return newState;
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error(`Error polling media status for ${mediaId}:`, error);
        return false;
      }
    };

    // Poll for status
    const pollInterval = setInterval(async () => {
      attempts++;

      // Increment progress: 10-95% over time (5-120 attempts = 10% to 95%)
      const progress = Math.min(10 + (attempts * 0.75), 95);
      setGeneratingMediaIds(prev => ({
        ...prev,
        [mediaId]: Math.round(progress)
      }));

      const isDone = await poll();

      if (isDone || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        if (isDone) {
          // Set to 100% before removing
          setGeneratingMediaIds(prev => ({
            ...prev,
            [mediaId]: 100
          }));
          // Remove after a short delay to show completion
          setTimeout(() => {
            setGeneratingMediaIds(prev => {
              const newState = { ...prev };
              delete newState[mediaId];
              return newState;
            });
          }, 500);
        } else if (attempts >= maxAttempts) {
          console.warn(`Polling timeout for mediaId ${mediaId}`);
          setGeneratingMediaIds(prev => {
            const newState = { ...prev };
            delete newState[mediaId];
            return newState;
          });
        }
      }
    }, 5000); // Poll every 5 seconds

    return pollInterval;
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
          'Síder': 'CIDER_RTD',
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
          'Cider': 'CIDER_RTD',
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
        atvrImageUrl: productData.image || '', // Backend will download this image
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
        subcategory: productData.subcategory,
        subcategoryIs: productData.subcategoryIs,
        foodPairings: JSON.stringify(productData.foodPairings || []),
        foodPairingsIs: JSON.stringify(productData.foodPairingsIs || []),
        specialAttributes: JSON.stringify(productData.specialAttributes || []),
        specialAttributesIs: JSON.stringify(productData.specialAttributesIs || []),
        certifications: JSON.stringify(productData.certifications || []),
        certificationsIs: JSON.stringify(productData.certificationsIs || []),
        storeAvailability: productData.storeAvailability ? JSON.stringify(productData.storeAvailability) : null,
        atvrProductId: productData.atvrProductId,
        atvrUrl: productData.atvrUrl,
        availability: productData.availability || 'available',
        availabilityIs: productData.availabilityIs
      };

      const result = await dispatch(createProduct(convertedProduct)).unwrap();
      toast.success(`Product "${productData.name}" imported successfully`);
      // Return the created product with mediaId
      return result;
    } catch (error) {
      console.error('Error importing product:', error);
      toast.error(`Failed to import product: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm(t('common.delete') + '?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success(t('common.success'));
      } catch (error) {
        toast.error(error.message || t('common.error'));
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
    const matchesCategory = !filterCategory || product.category?.name === filterCategory;
    const matchesSubcategory = !filterSubcategory || product.subcategory?.name === filterSubcategory;
    const matchesAgeFilter = !showAgeRestricted || product.isAgeRestricted;

    return matchesSearch && matchesCategory && matchesSubcategory && matchesAgeFilter;
  });

  const categories = [
    { value: 'WINE', label: t('categories.WINE') },
    { value: 'BEER', label: t('categories.BEER') },
    { value: 'BEERS', label: t('categories.BEERS') },
    { value: 'CIDER_RTD', label: t('categories.CIDER_RTD') },
    { value: 'SPIRITS', label: t('categories.SPIRITS') },
    { value: 'NICOTINE', label: t('categories.NICOTINE') },
    { value: 'NON_ALCOHOLIC', label: t('categories.NON_ALCOHOLIC') },
    { value: 'OFFERS', label: t('categories.OFFERS') }
  ];

  const subcategories = [
    // Wine subcategories
    { value: 'WHITE_WINE', label: t('subcategories.WHITE_WINE'), category: 'WINE' },
    { value: 'RED_WINE', label: t('subcategories.RED_WINE'), category: 'WINE' },
    { value: 'SPARKLING_WINE', label: t('subcategories.SPARKLING_WINE'), category: 'WINE' },
    { value: 'CHAMPAGNE', label: t('subcategories.CHAMPAGNE'), category: 'WINE' },
    { value: 'YELLOW_WINE', label: t('subcategories.YELLOW_WINE'), category: 'WINE' },
    { value: 'ROSE_WINE', label: t('subcategories.ROSE_WINE'), category: 'WINE' },
    // Spirits subcategories
    { value: 'GIN', label: t('subcategories.GIN'), category: 'SPIRITS' },
    { value: 'COGNAC', label: t('subcategories.COGNAC'), category: 'SPIRITS' },
    { value: 'RUM', label: t('subcategories.RUM'), category: 'SPIRITS' },
    { value: 'LIQUEURS_SHOTS', label: t('subcategories.LIQUEURS_SHOTS'), category: 'SPIRITS' },
    { value: 'TEQUILA', label: t('subcategories.TEQUILA'), category: 'SPIRITS' },
    { value: 'VODKA', label: t('subcategories.VODKA'), category: 'SPIRITS' },
    { value: 'WHISKEY', label: t('subcategories.WHISKEY'), category: 'SPIRITS' },
    // Nicotine subcategories
    { value: 'VAPE', label: t('subcategories.VAPE'), category: 'NICOTINE' },
    { value: 'NICOTINE_PADS', label: t('subcategories.NICOTINE_PADS'), category: 'NICOTINE' },
    // Non-alcoholic subcategories
    { value: 'SODA', label: t('subcategories.SODA'), category: 'NON_ALCOHOLIC' },
    { value: 'SOFT_DRINKS', label: t('subcategories.SOFT_DRINKS'), category: 'NON_ALCOHOLIC' },
    { value: 'ENERGY_DRINKS', label: t('subcategories.ENERGY_DRINKS'), category: 'NON_ALCOHOLIC' }
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminPage.accessDenied')}</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('adminPage.accessDenied')}
              </h2>
              <p className="text-gray-600">
                {t('adminPage.noPermission')}
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
              {t('common.error')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => dispatch(fetchProducts({ limit: 100 }))}
              className="btn btn-primary"
            >
              {t('common.retry')}
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
        <PageHeader
          icon={Package}
          title={t('adminProductsPage.productManagement')}
          description={t('adminProductsPage.manageProducts')}
          actions={
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('adminProductsPage.newProduct')}
              </button>
              <button
                onClick={() => setShowATVRImport(true)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Package className="w-4 h-4 mr-2" />
                {t('adminProducts.importFromATVR')}
              </button>
            </div>
          }
        />

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">

        {/* Filters and View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminLabels.filters')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('adminLabels.gridView')}
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
                title={t('adminLabels.listView')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('adminProductsPage.searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubcategory(''); // Clear subcategory when category changes
              }}
              className="input w-full"
            >
              <option value="">{t('adminProductsPage.allCategories')}</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Subcategory Filter */}
            <select
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
              className="input w-full"
            >
              <option value="">{t('adminProductsPage.allSubcategories') || 'All Subcategories'}</option>
              {subcategories
                .filter(sub => !filterCategory || sub.category === filterCategory)
                .map(subcategory => (
                  <option key={subcategory.value} value={subcategory.value}>
                    {subcategory.label}
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
                {t('adminProductsPage.showOnlyAgeRestricted')}
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
                  <div
                    onClick={() => handleEdit(product)}
                    className="aspect-square bg-white dark:bg-white rounded-lg mb-4 overflow-hidden p-2 cursor-pointer hover:shadow-md transition-shadow duration-200 relative"
                  >
                    {generatingMediaIds[product.mediaId] !== undefined ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded">
                        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 animate-spin" />
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center px-2 mb-3">
                          {t('adminProductsPage.generatingAIImage') || 'Generating AI Image'}
                        </p>
                        <div className="w-3/4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                              {generatingMediaIds[product.mediaId]}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${generatingMediaIds[product.mediaId]}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : product.responsiveData ? (
                      <picture>
                        {product.responsiveData.picture?.webp?.srcset && (
                          <source
                            srcSet={product.responsiveData.picture.webp.srcset}
                            type="image/webp"
                          />
                        )}
                        {product.responsiveData.picture?.jpeg?.srcset && (
                          <source
                            srcSet={product.responsiveData.picture.jpeg.srcset}
                            type="image/jpeg"
                          />
                        )}
                        <img
                          src={product.responsiveData.picture?.img?.src || product.responsiveData.src}
                          alt={product.responsiveData.picture?.img?.alt || product.responsiveData.alt}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </picture>
                    ) : product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com'}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
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
                      {product.price.toLocaleString()} {currencySymbol}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {product.stock} {t('adminProductsPage.inStock')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-outline btn-sm flex-1 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{t('common.edit')}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                      data-testid={`delete-product-${product.id}`}
                      aria-label={`Delete ${product.name}`}
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
                  <div
                    onClick={() => handleEdit(product)}
                    className="w-24 h-24 bg-white dark:bg-white rounded-lg overflow-hidden flex-shrink-0 p-2 cursor-pointer hover:shadow-md transition-shadow duration-200 relative"
                  >
                    {generatingMediaIds[product.mediaId] !== undefined ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin mb-1" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                          {generatingMediaIds[product.mediaId]}%
                        </span>
                      </div>
                    ) : product.responsiveData ? (
                      <picture>
                        {product.responsiveData.picture?.webp?.srcset && (
                          <source
                            srcSet={product.responsiveData.picture.webp.srcset}
                            type="image/webp"
                          />
                        )}
                        {product.responsiveData.picture?.jpeg?.srcset && (
                          <source
                            srcSet={product.responsiveData.picture.jpeg.srcset}
                            type="image/jpeg"
                          />
                        )}
                        <img
                          src={product.responsiveData.picture?.img?.src || product.responsiveData.src}
                          alt={product.responsiveData.picture?.img?.alt || product.responsiveData.alt}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </picture>
                    ) : product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://olfong.olibuijr.com'}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
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
                            {product.stock} {t('adminProductsPage.inStock')}
                          </span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-lg whitespace-nowrap">
                          {product.price.toLocaleString()} {currencySymbol}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-outline btn-sm flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>{t('common.edit')}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                            data-testid={`delete-product-${product.id}`}
                            aria-label={`Delete ${product.name}`}
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
              {t('adminProductsPage.noProductsFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('adminProductsPage.adjustSearchOrAdd')}
            </p>
          </div>
        )}

        {/* Product Modal */}
        <ProductModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
            setUploadedImage(null);
          }}
          onSubmit={onSubmit}
          editingProduct={editingProduct}
          categories={categories}
          subcategories={subcategories}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          handleImageUpload={handleImageUpload}
          setShowImageSearch={setShowImageSearch}
          setShowMediaPicker={setShowMediaPicker}
        />
      </div>

      {/* OLD MODAL CODE REMOVED - Now using ProductModal component */}


      {/* ATVR Import Modal */}
      {showATVRImport && (
        <ATVRImport
          onImportProduct={handleATVRImport}
          onClose={() => setShowATVRImport(false)}
          onGeneratingProducts={handleGeneratingProducts}
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
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminProducts;


