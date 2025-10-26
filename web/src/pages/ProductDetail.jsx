import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingCart, Minus, Plus, AlertTriangle, Calendar, Clock, Edit, X } from 'lucide-react';
import { FaFish, FaDrumstickBite, FaCheese, FaCarrot, FaBirthdayCake, FaUtensils, FaPizzaSlice, FaLeaf, FaHamburger } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { fetchProduct, clearCurrentProduct, updateProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  getProductName, 
  getProductDescription, 
  getProductFoodPairings, 
  getProductSpecialAttributes
} from '../utils/languageUtils';

// Map food pairings to grayscale icons using react-icons with proper dark mode contrast
const getFoodIcon = (food) => {
  const foodLower = food.toLowerCase();
  if (foodLower.includes('fish') || foodLower.includes('fiskur')) return <FaFish className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('beef') || foodLower.includes('nautakjöt')) return <GiCow className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('lamb') || foodLower.includes('lambakjöt')) return <FaDrumstickBite className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('pork') || foodLower.includes('svínakjöt')) return <FaHamburger className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('fowl') || foodLower.includes('fuglakjöt') || foodLower.includes('poultry')) return <FaDrumstickBite className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('cheese') || foodLower.includes('ostur')) return <FaCheese className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('vegetable') || foodLower.includes('grænmeti')) return <FaCarrot className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('dessert') || foodLower.includes('eftirréttur')) return <FaBirthdayCake className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('seafood') || foodLower.includes('sjávarfiskur')) return <FaFish className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('pasta') || foodLower.includes('pasta')) return <FaUtensils className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('pizza') || foodLower.includes('pizza')) return <FaPizzaSlice className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('salad') || foodLower.includes('salat')) return <FaLeaf className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('meat') || foodLower.includes('kjöt')) return <GiCow className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('chicken') || foodLower.includes('kjúklingur')) return <FaDrumstickBite className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('duck') || foodLower.includes('önd')) return <FaDrumstickBite className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  if (foodLower.includes('turkey') || foodLower.includes('kalkúnn')) return <FaDrumstickBite className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
  return <FaUtensils className="w-6 h-6 text-gray-600 dark:text-gray-400" />; // Default food icon
};

const ProductDetail = () => {
  const { t, currentLanguage } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProduct, isLoading, error } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading: cartLoading } = useSelector((state) => state.cart);
  
  const [quantity, setQuantity] = useState(1);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const [subscriptionData, setSubscriptionData] = useState({
    intervalType: 'WEEKLY',
    intervalValue: 1,
    preferredDay: '',
    preferredTime: '15:00',
    quantity: 1,
  });

  // Age verification persistence functions
  const AGE_VERIFICATION_KEY = 'olfong_age_verified';

  const checkAgeVerification = () => {
    try {
      const stored = localStorage.getItem(AGE_VERIFICATION_KEY);
      if (!stored) return false;

      const { confirmed } = JSON.parse(stored);
      return confirmed;
    } catch (error) {
      console.error('Error checking age verification:', error);
      return false;
    }
  };

  const storeAgeVerification = (confirmed) => {
    try {
      const data = {
        confirmed
      };
      localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing age verification:', error);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
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
      discountReasonIs: '',
      // ATVR/Enhanced fields
      volume: '',
      volumeIs: '',
      alcoholContent: '',
      country: '',
      countryIs: '',
      region: '',
      regionIs: '',
      origin: '',
      originIs: '',
      producer: '',
      producerIs: '',
      distributor: '',
      distributorIs: '',
      packaging: '',
      packagingIs: '',
      packagingWeight: '',
      packagingWeightIs: '',
      carbonFootprint: '',
      carbonFootprintIs: '',
      vintage: '',
      grapeVariety: '',
      grapeVarietyIs: '',
      wineStyle: '',
      wineStyleIs: '',
      pricePerLiter: '',
      pricePerLiterIs: '',
      foodPairings: [],
      foodPairingsIs: [],
      specialAttributes: [],
      specialAttributesIs: [],
      certifications: [],
      certificationsIs: [],
      availability: 'available',
      availabilityIs: 'Til ráðstöfunar',
      atvrProductId: '',
      atvrUrl: '',
      atvrImageUrl: ''
    }
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    // Check if user needs age verification for nicotine products
    if (currentProduct && currentProduct.category.name === 'NICOTINE' && user && user.age < 18) {
      // Only show modal if user hasn't already confirmed their age
      if (!checkAgeVerification()) {
        setShowAgeVerification(true);
      } else {
        setAgeConfirmed(true);
      }
    }
  }, [currentProduct, user]);

  useEffect(() => {
    if (currentProduct && showEditModal) {
      setValue('name', currentProduct.name);
      setValue('nameIs', currentProduct.nameIs || '');
      setValue('description', currentProduct.description || '');
      setValue('descriptionIs', currentProduct.descriptionIs || '');
      setValue('price', currentProduct.price);
      setValue('stock', currentProduct.stock);
      setValue('category', currentProduct.category.name);
      setValue('subcategory', currentProduct.subcategory || '');
      setValue('isAgeRestricted', currentProduct.ageRestriction > 18);
      setValue('imageUrl', currentProduct.imageUrl || '');
      setValue('hasDiscount', currentProduct.hasDiscount || false);
      setValue('originalPrice', currentProduct.originalPrice || 0);
      setValue('discountPercentage', currentProduct.discountPercentage || 0);
      setValue('discountStartDate', currentProduct.discountStartDate ? currentProduct.discountStartDate.split('T')[0] : '');
      setValue('discountEndDate', currentProduct.discountEndDate ? currentProduct.discountEndDate.split('T')[0] : '');
      setValue('discountReason', currentProduct.discountReason || '');
      setValue('discountReasonIs', currentProduct.discountReasonIs || '');
      
      // ATVR/Enhanced fields
      setValue('volume', currentProduct.volume || '');
      setValue('volumeIs', currentProduct.volumeIs || '');
      setValue('alcoholContent', currentProduct.alcoholContent || '');
      setValue('country', currentProduct.country || '');
      setValue('countryIs', currentProduct.countryIs || '');
      setValue('region', currentProduct.region || '');
      setValue('regionIs', currentProduct.regionIs || '');
      setValue('origin', currentProduct.origin || '');
      setValue('originIs', currentProduct.originIs || '');
      setValue('producer', currentProduct.producer || '');
      setValue('producerIs', currentProduct.producerIs || '');
      setValue('distributor', currentProduct.distributor || '');
      setValue('distributorIs', currentProduct.distributorIs || '');
      setValue('packaging', currentProduct.packaging || '');
      setValue('packagingIs', currentProduct.packagingIs || '');
      setValue('packagingWeight', currentProduct.packagingWeight || '');
      setValue('packagingWeightIs', currentProduct.packagingWeightIs || '');
      setValue('carbonFootprint', currentProduct.carbonFootprint || '');
      setValue('carbonFootprintIs', currentProduct.carbonFootprintIs || '');
      setValue('vintage', currentProduct.vintage || '');
      setValue('grapeVariety', currentProduct.grapeVariety || '');
      setValue('grapeVarietyIs', currentProduct.grapeVarietyIs || '');
      setValue('wineStyle', currentProduct.wineStyle || '');
      setValue('wineStyleIs', currentProduct.wineStyleIs || '');
      setValue('pricePerLiter', currentProduct.pricePerLiter || '');
      setValue('pricePerLiterIs', currentProduct.pricePerLiterIs || '');
      setValue('foodPairings', currentProduct.foodPairings || []);
      setValue('foodPairingsIs', currentProduct.foodPairingsIs || []);
      setValue('specialAttributes', currentProduct.specialAttributes || []);
      setValue('specialAttributesIs', currentProduct.specialAttributesIs || []);
      setValue('certifications', currentProduct.certifications || []);
      setValue('certificationsIs', currentProduct.certificationsIs || []);
      setValue('availability', currentProduct.availability || 'available');
      setValue('availabilityIs', currentProduct.availabilityIs || 'Til ráðstöfunar');
      setValue('atvrProductId', currentProduct.atvrProductId || '');
      setValue('atvrUrl', currentProduct.atvrUrl || '');
      setValue('atvrImageUrl', currentProduct.atvrImageUrl || '');
      
      // Reset image uploads
      setUploadedImages([]);
      setImagePreviewUrls([]);
    }
  }, [currentProduct, showEditModal, setValue]);

  // Image upload handlers
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [...uploadedImages, ...files];
    setUploadedImages(newImages);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleEditSubmit = async (data) => {
    try {
      // Remove the category field since we're using categoryId for the relation
      // eslint-disable-next-line no-unused-vars
      const { category, ...formData } = data;
      
      // Create FormData for file uploads
      const productData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'foodPairings' || key === 'foodPairingsIs' || 
            key === 'specialAttributes' || key === 'specialAttributesIs' ||
            key === 'certifications' || key === 'certificationsIs' ||
            key === 'subcategories') {
          // Handle arrays
          productData.append(key, JSON.stringify(formData[key] || []));
        } else {
          productData.append(key, formData[key] || '');
        }
      });
      
      // Add categoryId and ageRestriction
      productData.append('categoryId', currentProduct.categoryId);
      productData.append('ageRestriction', data.isAgeRestricted ? 20 : 18);
      
      // Add uploaded images
      uploadedImages.forEach((file) => {
        productData.append('images', file);
      });

      await dispatch(updateProduct({ id: currentProduct.id, productData })).unwrap();
      toast.success(t('common.success'));
      setShowEditModal(false);
      reset();
      setUploadedImages([]);
      setImagePreviewUrls([]);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || t('common.error'));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired'));
      navigate('/login');
      return;
    }

    // Age verification for nicotine products
    if (currentProduct.category.name === 'NICOTINE' && user.age < 18 && !ageConfirmed) {
      setShowAgeVerification(true);
      return;
    }

    try {
      await dispatch(addToCart({
        productId: currentProduct.id,
        quantity
      })).unwrap();
      // Toast is handled by the thunk
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Toast is handled by the thunk
    }
  };

  const incrementQuantity = () => {
    if (currentProduct && quantity < currentProduct.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const confirmAge = () => {
    setAgeConfirmed(true);
    setShowAgeVerification(false);
    storeAgeVerification(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('products.title')} {t('orderDetailPage.orderNotFound')}</h1>
            <p className="text-gray-600 mb-8">{t('orderDetailPage.orderNotFoundDesc')}</p>
            <Link to="/products" className="btn btn-primary">{t('common.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('productDetailPage.back')}
        </button>

        {/* Main Product Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              {currentProduct.imageUrl ? (
                <div className="bg-white dark:bg-white rounded-lg p-4 shadow-lg">
                  <img
                    src={currentProduct.imageUrl.startsWith('http') ? currentProduct.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://192.168.8.62:5000'}${currentProduct.imageUrl}`}
                    alt={getProductName(currentLanguage, currentProduct)}
                    className="w-full h-96 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500 text-lg">{t('cartPage.noImage')}</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getProductName(currentLanguage, currentProduct)}
                  </h1>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('common.edit')}
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    {currentProduct.price.toLocaleString()} {t('common.currency')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {t(`navigation.${currentProduct.category.name.toLowerCase()}`)}
                    </span>
                    {currentProduct.subcategory && (
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                        {currentProduct.subcategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('productDetailPage.description')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {getProductDescription(currentLanguage, currentProduct) || t('productDetailPage.noDescription')}
                </p>
              </div>

              {/* VAT Information */}
              {currentProduct.category?.vatProfile && (() => {
                const vatRate = currentProduct.category.vatProfile.vatRate;
                const totalPrice = currentProduct.price;
                // VAT amount = (Total Price / (1 + VAT Rate)) * VAT Rate
                const priceBeforeVat = totalPrice / (1 + (vatRate / 100));
                const vatAmount = totalPrice - priceBeforeVat;

                return (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {t('productDetailPage.vatInformation') || 'VAT Information'}
                    </h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between items-center">
                        <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('productDetailPage.vatProfile') || 'VAT Profile'}:
                        </dt>
                        <dd className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {currentLanguage === 'is' && currentProduct.category.vatProfile.nameIs
                            ? currentProduct.category.vatProfile.nameIs
                            : currentProduct.category.vatProfile.name}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('productDetailPage.vatRate') || 'VAT Rate'}:
                        </dt>
                        <dd className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {vatRate}%
                        </dd>
                      </div>
                      <div className="border-t border-blue-200 dark:border-blue-800 pt-3 mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('productDetailPage.priceBeforeVat') || 'Price before VAT'}:
                          </dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {priceBeforeVat.toLocaleString('is-IS', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} {t('common.currency')}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('productDetailPage.vatAmount') || 'VAT Amount'}:
                          </dt>
                          <dd className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {vatAmount.toLocaleString('is-IS', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} {t('common.currency')}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-100 dark:border-blue-900">
                          <dt className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t('productDetailPage.totalPrice') || 'Total Price (incl. VAT)'}:
                          </dt>
                          <dd className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {totalPrice.toLocaleString('is-IS', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} {t('common.currency')}
                          </dd>
                        </div>
                      </div>
                      {currentProduct.category.vatProfile.description || currentProduct.category.vatProfile.descriptionIs && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {currentLanguage === 'is' && currentProduct.category.vatProfile.descriptionIs
                              ? currentProduct.category.vatProfile.descriptionIs
                              : currentProduct.category.vatProfile.description}
                          </p>
                        </div>
                      )}
                    </dl>
                  </div>
                );
              })()}


              {/* Product Specifications */}
              {(currentProduct.volume || currentProduct.alcoholContent || currentProduct.producer || currentProduct.country || currentProduct.packaging) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('productDetailPage.specifications') || 'Specifications'}</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {(currentProduct.volume || currentProduct.volumeIs) && (
                      <>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productDetailPage.volume') || 'Volume'}</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{currentLanguage === 'is' && currentProduct.volumeIs ? currentProduct.volumeIs : currentProduct.volume}</dd>
                      </>
                    )}
                    {currentProduct.alcoholContent && (
                      <>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productDetailPage.alcoholContent') || 'Alcohol Content'}</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{currentProduct.alcoholContent}%</dd>
                      </>
                    )}
                    {(currentProduct.producer || currentProduct.producerIs) && (
                      <>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productDetailPage.producer') || 'Producer'}</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{currentLanguage === 'is' && currentProduct.producerIs ? currentProduct.producerIs : currentProduct.producer}</dd>
                      </>
                    )}
                    {(currentProduct.country || currentProduct.countryIs) && (
                      <>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productDetailPage.country') || 'Country'}</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{currentLanguage === 'is' && currentProduct.countryIs ? currentProduct.countryIs : currentProduct.country}</dd>
                      </>
                    )}
                    {(currentProduct.packaging || currentProduct.packagingIs) && (
                      <>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productDetailPage.packaging') || 'Packaging'}</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{currentLanguage === 'is' && currentProduct.packagingIs ? currentProduct.packagingIs : currentProduct.packaging}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {/* Food Pairings - Language-aware with icons */}
              {getProductFoodPairings(currentLanguage, currentProduct).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('products.foodPairings')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {getProductFoodPairings(currentLanguage, currentProduct).map((pairing, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-gray-600 dark:text-gray-400 mb-2">
                          {getFoodIcon(pairing)}
                        </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 text-center font-medium">
                      {pairing}
                    </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Attributes - Language-aware */}
              {getProductSpecialAttributes(currentLanguage, currentProduct).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('products.specialAttributes')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {getProductSpecialAttributes(currentLanguage, currentProduct).map((attribute, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full"
                      >
                        {attribute}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {currentProduct.availability && currentProduct.availability !== 'available' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {t('products.availability')}: {t('products', currentProduct.availability)}
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {currentProduct.availability === 'special-order' && t('productDetailPage.specialOrderDesc')}
                        {currentProduct.availability === 'coming-soon' && t('productDetailPage.comingSoonDesc')}
                        {currentProduct.availability === 'discontinued' && t('productDetailPage.discontinuedDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Age verification warning for nicotine products */}
              {currentProduct.category.name === 'NICOTINE' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">{t('productDetailPage.ageRestriction')}</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{t('productDetailPage.ageRestrictionDesc')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {currentProduct.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('productDetailPage.quantity')}:</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-center min-w-[60px] text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= currentProduct.stock}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{currentProduct.stock} {t('productDetailPage.available')}</span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || (!isAuthenticated)}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2 py-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{!isAuthenticated ? t('common.loginRequired') : cartLoading ? t('common.loading') : t('products.addToCart')}</span>
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {t('productDetailPage.loginToAdd')}
                      <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 ml-1">
                        {t('productDetailPage.loginHere')}
                      </Link>
                    </p>
                  )}

                  {/* Subscription Button */}
                  {isAuthenticated && currentProduct.stock > 0 && (
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="btn btn-outline w-full flex items-center justify-center space-x-2 py-3 mt-3"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>{t('productDetailPage.subscribe')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Age Verification Modal */}
      {showAgeVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('ageVerification.title')}</h3>
              <p className="text-gray-600 mb-6">{t('ageVerification.message', { age: 18 })}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAgeVerification(false);
                    setAgeConfirmed(false);
                    storeAgeVerification(false);
                  }}
                  className="btn btn-outline flex-1"
                >
                  {t('common.no')}
                </button>
                <button
                  onClick={confirmAge}
                  className="btn btn-primary flex-1"
                >
                  {t('common.yes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('productDetailPage.createSubscription')}</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {currentProduct.nameIs || currentProduct.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentProduct.price.toLocaleString()} {t('common.currency')} {t('cartPage.each')}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productDetailPage.quantity')}</label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg w-32">
                  <button
                    onClick={() => setSubscriptionData({...subscriptionData, quantity: Math.max(1, subscriptionData.quantity - 1)})}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center flex-1 text-gray-900 dark:text-white">
                    {subscriptionData.quantity}
                  </span>
                  <button
                    onClick={() => setSubscriptionData({...subscriptionData, quantity: subscriptionData.quantity + 1})}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interval Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productDetailPage.deliveryFrequency')}</label>
                <select
                  value={subscriptionData.intervalType}
                  onChange={(e) => setSubscriptionData({...subscriptionData, intervalType: e.target.value})}
                  className="input w-full"
                >
                  <option value="WEEKLY">
                    {t('subscription.weekly')}
                  </option>
                  <option value="BIWEEKLY">
                    {t('subscription.biweekly')}
                  </option>
                  <option value="MONTHLY">
                    {t('subscription.monthly')}
                  </option>
                </select>
              </div>

              {/* Preferred Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><Calendar className="w-4 h-4 inline mr-1" />{t('productDetailPage.preferredDayOptional')}</label>
                <select
                  value={subscriptionData.preferredDay}
                  onChange={(e) => setSubscriptionData({...subscriptionData, preferredDay: e.target.value})}
                  className="input w-full"
                >
                  <option value="">{t('subscription.noSpecificDay')}</option>
                  <option value="MONDAY">{t('subscription.monday')}</option>
                  <option value="TUESDAY">{t('subscription.tuesday')}</option>
                  <option value="WEDNESDAY">{t('subscription.wednesday')}</option>
                  <option value="THURSDAY">{t('subscription.thursday')}</option>
                  <option value="FRIDAY">{t('subscription.friday')}</option>
                  <option value="SATURDAY">{t('subscription.saturday')}</option>
                  <option value="SUNDAY">{t('subscription.sunday')}</option>
                </select>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Clock className="w-4 h-4 inline mr-1" />{t('productDetailPage.preferredTimeOptional')}</label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('subscription.selectPreferredTimeHelp')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSubscriptionData({...subscriptionData, preferredTime: time})}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        subscriptionData.preferredTime === time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productDetailPage.notesOptional')}</label>
                <textarea
                  rows={3}
                  placeholder={t('subscription.specialNotesPlaceholder')}
                  className="input w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="btn btn-outline flex-1"
                >
                  {t('subscription.cancel')}
                </button>
                <button
                  onClick={async () => {
                    // Check if user is authenticated
                    if (!isAuthenticated) {
                      toast.error(t('subscription.mustBeLoggedIn'));
                      return;
                    }

                    // Validate that payment provider supports subscriptions
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.8.62:5000'}/api/payment-gateways/config`);
                      const { gateways } = await response.json();

                      const supportsSubscription = gateways.some(gw => gw.supportsSubscriptions && gw.isEnabled);

                      if (!supportsSubscription) {
                        toast.error(t('subscription.noPaymentProviderSupport'));
                        return;
                      }

                      // TODO: Create subscription in database
                      toast.success(t('productDetailPage.subscriptionCreated'));
                      setShowSubscriptionModal(false);
                    } catch (error) {
                      console.error('Error creating subscription:', error);
                      toast.error(t('subscription.creationFailed'));
                    }
                  }}
                  className="btn btn-primary flex-1"
                >
                  {t('subscription.createSubscription')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('adminProductsPage.editProduct')}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminProductsPage.nameEn')} *
                  </label>
                  <input
                    {...register('name', { required: true })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('products.title')}
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {t('adminProductsPage.nameRequired')}
                    </p>
                  )}
                </div>

                {/* Name (Icelandic) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('adminProductsPage.nameIs')}
                  </label>
                  <input
                    {...register('nameIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('adminProductsPage.nameIs')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common.price')} * ({t('common.currency')})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { required: true, min: 0 })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {errors.price && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {t('adminProductsPage.priceRequired')}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.stock')} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('stock', { required: true, min: 0 })}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {errors.stock && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {t('adminProductsPage.stockRequired')}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.description')}
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('products.description')}
                />
              </div>

              {/* Description (Icelandic) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminProductsPage.descriptionIs')}
                </label>
                <textarea
                  {...register('descriptionIs')}
                  rows={3}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('adminProductsPage.descriptionIs')}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminProductsPage.productImages')}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image URL (fallback) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('adminProductsPage.imageUrl')}
                </label>
                <input
                  {...register('imageUrl')}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Age Restriction */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isAgeRestricted')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('adminProductsPage.ageRestricted')}
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;