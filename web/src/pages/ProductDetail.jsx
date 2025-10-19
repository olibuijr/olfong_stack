import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingCart, Minus, Plus, AlertTriangle, Calendar, Clock, Edit, X } from 'lucide-react';
import { FaFish, FaDrumstickBite, FaCheese, FaCarrot, FaBirthdayCake, FaUtensils, FaPizzaSlice, FaLeaf, FaHamburger } from 'react-icons/fa';
import { MdOutlinePets, MdOutlineLocalDining } from 'react-icons/md';
import { GiCow, GiSteak } from 'react-icons/gi';
import { fetchProduct, clearCurrentProduct, updateProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  getProductName, 
  getProductDescription, 
  getProductVolume, 
  getProductCountry, 
  getProductProducer, 
  getProductPackaging, 
  getProductAvailability, 
  getProductFoodPairings, 
  getProductSpecialAttributes,
  getLocalizedText
} from '../utils/languageUtils';

// Map food pairings to grayscale icons using react-icons
const getFoodIcon = (food) => {
  const foodLower = food.toLowerCase();
  if (foodLower.includes('fish') || foodLower.includes('fiskur')) return <FaFish className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('beef') || foodLower.includes('nautakjöt')) return <GiCow className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('lamb') || foodLower.includes('lambakjöt')) return <FaDrumstickBite className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('pork') || foodLower.includes('svínakjöt')) return <FaHamburger className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('fowl') || foodLower.includes('fuglakjöt') || foodLower.includes('poultry')) return <FaDrumstickBite className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('cheese') || foodLower.includes('ostur')) return <FaCheese className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('vegetable') || foodLower.includes('grænmeti')) return <FaCarrot className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('dessert') || foodLower.includes('eftirréttur')) return <FaBirthdayCake className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('seafood') || foodLower.includes('sjávarfiskur')) return <FaFish className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('pasta') || foodLower.includes('pasta')) return <FaUtensils className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('pizza') || foodLower.includes('pizza')) return <FaPizzaSlice className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('salad') || foodLower.includes('salat')) return <FaLeaf className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('meat') || foodLower.includes('kjöt')) return <GiCow className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('chicken') || foodLower.includes('kjúklingur')) return <FaDrumstickBite className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('duck') || foodLower.includes('önd')) return <FaDrumstickBite className="w-6 h-6 text-gray-600" />;
  if (foodLower.includes('turkey') || foodLower.includes('kalkúnn')) return <FaDrumstickBite className="w-6 h-6 text-gray-600" />;
  return <FaUtensils className="w-6 h-6 text-gray-600" />; // Default food icon
};

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
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
  const [subscriptionData, setSubscriptionData] = useState({
    intervalType: 'WEEKLY',
    intervalValue: 1,
    preferredDay: '',
    preferredTime: '15:00',
    quantity: 1,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

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
      setShowAgeVerification(true);
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
      uploadedImages.forEach((file, index) => {
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
      
      // Navigate to cart after successful add
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('productDetailPage.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            {currentProduct.imageUrl ? (
              <img
                src={`http://localhost:5000${currentProduct.imageUrl}`}
                alt={getProductName(i18n.language, currentProduct)}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">{t('cartPage.noImage')}</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {getProductName(i18n.language, currentProduct)}
                </h1>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentProduct.stock > 0 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentProduct.stock > 0 ? `${currentProduct.stock} ${t('products.unitsAvailable')}` : t('products.outOfStock')}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {t(`navigation.${currentProduct.category.name.toLowerCase()}`)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('productDetailPage.description')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {getProductDescription(i18n.language, currentProduct) || t('productDetailPage.noDescription')}
              </p>
            </div>

       {/* ATVR Product Information - Bilingual */}
       {(currentProduct.volume || currentProduct.country || currentProduct.producer || currentProduct.alcoholContent) && (
         <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('products.productDetails')}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {currentProduct.volume && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.volume')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getProductVolume(i18n.language, currentProduct)}
                 </p>
               </div>
             )}
             {currentProduct.alcoholContent && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.alcoholContent')}:</span>
                 <p className="text-gray-900 dark:text-white">{currentProduct.alcoholContent}%</p>
               </div>
             )}
             {currentProduct.country && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.country')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getProductCountry(i18n.language, currentProduct)}
                 </p>
               </div>
             )}
             {currentProduct.producer && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.producer')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getProductProducer(i18n.language, currentProduct)}
                 </p>
               </div>
             )}
             {currentProduct.distributor && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.distributor')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {currentProduct.distributor}
                   {currentProduct.distributorIs && currentProduct.distributorIs !== currentProduct.distributor && (
                     <span className="text-gray-600 dark:text-gray-400 ml-2">/ {currentProduct.distributorIs}</span>
                   )}
                 </p>
               </div>
             )}
             {currentProduct.packaging && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.packaging')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getProductPackaging(i18n.language, currentProduct)}
                 </p>
               </div>
             )}
             {getProductVolume(i18n.language, currentProduct) && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.volume')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getProductVolume(i18n.language, currentProduct)}
                 </p>
               </div>
             )}
             {currentProduct.region && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.region')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.regionIs, currentProduct.region)}
                 </p>
               </div>
             )}
             {currentProduct.vintage && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.vintage')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {currentProduct.vintage}
                 </p>
               </div>
             )}
             {currentProduct.pricePerLiter && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.pricePerLiter')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.pricePerLiterIs, currentProduct.pricePerLiter)}
                 </p>
               </div>
             )}
             {currentProduct.grapeVariety && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.grapeVariety')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.grapeVarietyIs, currentProduct.grapeVariety)}
                 </p>
               </div>
             )}
             {currentProduct.wineStyle && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.wineStyle')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.wineStyleIs, currentProduct.wineStyle)}
                 </p>
               </div>
             )}
             {currentProduct.packagingWeight && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.packagingWeight')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.packagingWeightIs, currentProduct.packagingWeight)}
                 </p>
               </div>
             )}
             {currentProduct.carbonFootprint && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.carbonFootprint')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.carbonFootprintIs, currentProduct.carbonFootprint)}
                 </p>
               </div>
             )}
             {currentProduct.origin && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.origin')}:</span>
                 <p className="text-gray-900 dark:text-white">
                   {getLocalizedText(i18n.language, currentProduct.originIs, currentProduct.origin)}
                 </p>
               </div>
             )}
           </div>
         </div>
       )}

       {/* Food Pairings - Language-aware with icons */}
       {getProductFoodPairings(i18n.language, currentProduct).length > 0 && (
         <div>
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('products.foodPairings')}</h3>
           <div className="flex flex-wrap gap-3">
             {getProductFoodPairings(i18n.language, currentProduct).map((pairing, index) => (
               <div
                 key={index}
                 className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
               >
                 <div className="text-gray-600 dark:text-gray-400 mb-2">
                   {getFoodIcon(pairing)}
                 </div>
                 <span className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                   {pairing}
                 </span>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Special Attributes - Language-aware */}
       {getProductSpecialAttributes(i18n.language, currentProduct).length > 0 && (
         <div>
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('products.specialAttributes')}</h3>
           <div className="flex flex-wrap gap-2">
             {getProductSpecialAttributes(i18n.language, currentProduct).map((attribute, index) => (
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

       {/* ATVR Information */}
       {(currentProduct.atvrProductId || currentProduct.atvrUrl) && (
         <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ATVR Information</h3>
           <div className="space-y-2">
             {currentProduct.atvrProductId && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Product ID:</span>
                 <p className="text-gray-900 dark:text-white">{currentProduct.atvrProductId}</p>
               </div>
             )}
             {currentProduct.atvrUrl && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ATVR Link:</span>
                 <a 
                   href={currentProduct.atvrUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-600 dark:text-blue-400 hover:underline"
                 >
                   View on ATVR
                 </a>
               </div>
             )}
             {getProductAvailability(i18n.language, currentProduct) && (
               <div>
                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products.availability')}:</span>
                 <p className="text-gray-900 dark:text-white">{getProductAvailability(i18n.language, currentProduct)}</p>
               </div>
             )}
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
                      {t('products.availability')}: {t(`products.${currentProduct.availability}`)}
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">{t('productDetailPage.ageRestriction')}</h4>
                    <p className="text-sm text-yellow-700">{t('productDetailPage.ageRestrictionDesc')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            {currentProduct.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">{t('productDetailPage.quantity')}:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[60px]">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= currentProduct.stock}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{currentProduct.stock} {t('productDetailPage.available')}</span>
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
                  <p className="text-sm text-gray-600 text-center">
                    {t('productDetailPage.loginToAdd')}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 ml-1">
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('productDetailPage.createSubscription')}</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  {currentProduct.nameIs || currentProduct.name}
                </h4>
                <p className="text-sm text-gray-600">{currentProduct.price.toLocaleString()} {t('common.currency')} {t('cartPage.each')}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDetailPage.quantity')}</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-32">
                  <button
                    onClick={() => setSubscriptionData({...subscriptionData, quantity: Math.max(1, subscriptionData.quantity - 1)})}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center flex-1">
                    {subscriptionData.quantity}
                  </span>
                  <button
                    onClick={() => setSubscriptionData({...subscriptionData, quantity: subscriptionData.quantity + 1})}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interval Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDetailPage.deliveryFrequency')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1"><Calendar className="w-4 h-4 inline mr-1" />{t('productDetailPage.preferredDayOptional')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1"><Clock className="w-4 h-4 inline mr-1" />{t('productDetailPage.preferredTimeOptional')}</label>
                <input
                  type="time"
                  value={subscriptionData.preferredTime}
                  onChange={(e) => setSubscriptionData({...subscriptionData, preferredTime: e.target.value})}
                  className="input w-full"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDetailPage.notesOptional')}</label>
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
                  onClick={() => {
                    // TODO: Implement subscription creation
                    toast.success(t('productDetailPage.subscriptionCreated'));
                    setShowSubscriptionModal(false);
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

              {/* Discount Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('adminProductsPage.discountSettings')}
                </h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    {...register('hasDiscount')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('adminProductsPage.hasDiscount')}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.originalPrice')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('originalPrice')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.discountPercentage')} (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...register('discountPercentage')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.discountStartDate')}
                    </label>
                    <input
                      type="date"
                      {...register('discountStartDate')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.discountEndDate')}
                    </label>
                    <input
                      type="date"
                      {...register('discountEndDate')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.discountReason')}
                    </label>
                    <input
                      {...register('discountReason')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('adminProductsPage.discountReason')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('adminProductsPage.discountReasonIs')}
                    </label>
                    <input
                      {...register('discountReasonIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('adminProductsPage.discountReasonIs')}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Product Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('adminProductsPage.enhancedInfo')}
                </h3>
                
                {/* Volume and Alcohol Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.volume')} (EN)
                    </label>
                    <input
                      {...register('volume')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="750 ml"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.volume')} (IS)
                    </label>
                    <input
                      {...register('volumeIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="750 ml"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.alcoholContent')} (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      {...register('alcoholContent')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="12.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.vintage')}
                    </label>
                    <input
                      {...register('vintage')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="2024"
                    />
                  </div>
                </div>

                {/* Country and Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.country')} (EN)
                    </label>
                    <input
                      {...register('country')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Iceland"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.country')} (IS)
                    </label>
                    <input
                      {...register('countryIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ísland"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.region')} (EN)
                    </label>
                    <input
                      {...register('region')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Reykjavik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.region')} (IS)
                    </label>
                    <input
                      {...register('regionIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Reykjavík"
                    />
                  </div>
                </div>

                {/* Producer and Distributor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.producer')} (EN)
                    </label>
                    <input
                      {...register('producer')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Egils Malt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.producer')} (IS)
                    </label>
                    <input
                      {...register('producerIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Egils Malt"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.distributor')} (EN)
                    </label>
                    <input
                      {...register('distributor')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Distributor Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.distributor')} (IS)
                    </label>
                    <input
                      {...register('distributorIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Útgefandi Nafn"
                    />
                  </div>
                </div>

                {/* Packaging */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.packaging')} (EN)
                    </label>
                    <input
                      {...register('packaging')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Bottle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.packaging')} (IS)
                    </label>
                    <input
                      {...register('packagingIs')}
                      className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Flaska"
                    />
                  </div>
                </div>

                {/* Food Pairings */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.foodPairings')} (EN) - Comma separated
                  </label>
                  <input
                    {...register('foodPairings')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Fish, Fowl, Beef, Lamb, Pork"
                    onChange={(e) => {
                      const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setValue('foodPairings', value);
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.foodPairings')} (IS) - Comma separated
                  </label>
                  <input
                    {...register('foodPairingsIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Fiskur, Alifuglar, Nautakjöt, Lambakjöt, Svínakjöt"
                    onChange={(e) => {
                      const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setValue('foodPairingsIs', value);
                    }}
                  />
                </div>

                {/* Special Attributes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.specialAttributes')} (EN) - Comma separated
                  </label>
                  <input
                    {...register('specialAttributes')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Premium Lager, Helles, Organic"
                    onChange={(e) => {
                      const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setValue('specialAttributes', value);
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.specialAttributes')} (IS) - Comma separated
                  </label>
                  <input
                    {...register('specialAttributesIs')}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Premium Lager, Helles, Náttúrulegt"
                    onChange={(e) => {
                      const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                      setValue('specialAttributesIs', value);
                    }}
                  />
                </div>

                {/* ATVR Information */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    ATVR Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ATVR Product ID
                      </label>
                      <input
                        {...register('atvrProductId')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="01448"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ATVR URL
                      </label>
                      <input
                        {...register('atvrUrl')}
                        className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="https://www.vinbudin.is/..."
                      />
                    </div>
                  </div>
                </div>
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


