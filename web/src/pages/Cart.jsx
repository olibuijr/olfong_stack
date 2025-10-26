import { useEffect, useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Truck, CreditCard, MapPin, ArrowLeft } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { fetchAddresses, createAddress } from '../store/slices/addressSlice';
import { createOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getProductName } from '../utils/languageUtils';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { OPENING_HOURS } from '../utils/openingHours';

const Cart = () => {
  const { t, currentLanguage } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const { cart, isLoading: cartLoading } = useSelector((state) => state.cart);
  const { addresses, isLoading: addressesLoading } = useSelector((state) => state.addresses);
  const { isLoading: orderLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Checkout state
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('valitor');
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState('');
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [enabledPaymentGateways, setEnabledPaymentGateways] = useState([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(true);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [vatSettings, setVatSettings] = useState(null);


  // Fetch VAT settings
  const fetchVatSettings = async () => {
    try {
      const response = await api.get('/settings?category=VAT');
      if (response.data) {
        const settings = {};
        response.data.forEach(setting => {
          if (setting.key === 'vatRate') {
            settings.rate = parseInt(setting.value);
          } else {
            settings[setting.key] = setting.value === 'true';
          }
        });
        setVatSettings(settings);
      }
    } catch (error) {
      console.error('Failed to fetch VAT settings:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
      fetchEnabledPaymentGateways();
      fetchShippingOptions();
      fetchVatSettings();
    }
  }, [dispatch, isAuthenticated]);

  // Fetch enabled payment gateways
  const fetchEnabledPaymentGateways = async () => {
    try {
      setIsLoadingGateways(true);
      const response = await api.get('/payment-gateways/config');
      setEnabledPaymentGateways(response.data?.gateways || []);
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error);
    } finally {
      setIsLoadingGateways(false);
    }
  };

  // Fetch shipping options
  const fetchShippingOptions = async () => {
    try {
      setIsLoadingShipping(true);
      const response = await api.get('/shipping/active');
      const shippingData = response.data || [];
      setShippingOptions(shippingData);
      // Auto-select first shipping option if available
      if (shippingData && shippingData.length > 0) {
        setSelectedShippingOptionId(shippingData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch shipping options:', error);
    } finally {
      setIsLoadingShipping(false);
    }
  };

  // Generate available pickup times based on store hours with 30-minute intervals
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Get today's opening hours
    const dayIndex = now.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayHours = OPENING_HOURS[days[dayIndex]];

    if (!todayHours) return times;

    // Parse opening and closing hours
    const [openHour, openMinute] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

    // Generate time slots from store opening to closing with 30-minute intervals
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip if we're past closing time
        if (hour === closeHour - 1 && minute >= closeMinute) break;

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Only show times that haven't passed today (with 30-minute buffer)
        if (hour > currentHour || (hour === currentHour && minute > currentMinute + 30)) {
          times.push({
            value: timeString,
            label: timeString,
            display: timeString
          });
        }
      }
    }

    return times;
  };

  // Helper functions to check if payment methods are available
  const isPaymentMethodAvailable = (provider) => {
    return enabledPaymentGateways.some(gateway => gateway.provider === provider);
  };

  const getSelectedShippingOption = () => {
    return shippingOptions.find(option => option.id === selectedShippingOptionId);
  };

  const isValitorAvailable = () => isPaymentMethodAvailable('valitor');
  const isCashOnDeliveryAvailable = () => {
    const selectedOption = getSelectedShippingOption();
    return isPaymentMethodAvailable('cash_on_delivery') && selectedOption?.type === 'delivery';
  };
  const isPayOnPickupAvailable = () => {
    const selectedOption = getSelectedShippingOption();
    return isPaymentMethodAvailable('pay_on_pickup') && selectedOption?.type === 'pickup';
  };

  const onSubmitOrder = async (data) => {
    try {
      if (!selectedShippingOptionId) {
        toast.error(t('checkoutPage.selectShippingOption'));
        return;
      }

      const selectedOption = getSelectedShippingOption();
      const orderData = {
        shippingOptionId: selectedShippingOptionId,
        paymentMethod: paymentMethod,
        notes: data.notes || ''
      };

      // Add delivery-specific data
      if (selectedOption.type === 'delivery') {
        if (!selectedAddressId) {
          toast.error(t('checkoutPage.selectDeliveryAddress'));
          return;
        }
        orderData.deliveryAddressId = selectedAddressId;
      } else if (selectedOption.type === 'pickup') {
        if (!selectedPickupTime) {
          toast.error(t('checkoutPage.selectPickupTime'));
          return;
        }
        orderData.pickupTime = selectedPickupTime;
      }

      const result = await dispatch(createOrder(orderData)).unwrap();

      // Redirect to order confirmation or payment
      if (paymentMethod === 'valitor') {
        // For now, redirect to order detail
        // In a real implementation, this would redirect to Valitor payment page
        navigate(`/orders/${result.id}`);
      } else if (paymentMethod === 'cash_on_delivery') {
        navigate(`/orders/${result.id}`);
      } else if (paymentMethod === 'pay_on_pickup') {
        navigate(`/orders/${result.id}`);
      } else {
        navigate(`/orders/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const onSubmitNewAddress = async (addressData) => {
    try {
      const result = await dispatch(createAddress(addressData)).unwrap();
      setSelectedAddressId(result.id);
      setShowNewAddressForm(false);
      setValue('addressId', result.id);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await dispatch(removeFromCart(itemId));
      return;
    }
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(t('cartPage.clearCart') + '?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        toast.error(t('cart.failedToClearCart'));
      }
    }
  };



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {t('cart.title')}
            </h1>
            <div className="card p-8 max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('cartPage.loginToViewCart')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('cartPage.mustLoginToViewCart')}</p>
              <Link to="/login" className="btn btn-primary w-full">{t('cartPage.login')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header - Same styling as non-empty cart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4 flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {t('cart.title')}
                  </h1>
                </div>
                <div className="hidden sm:flex flex-col gap-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('cartPage.cartDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty Cart Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('cartPage.emptyCart')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('cartPage.addItemsToStart')}</p>
              <Link to="/products" className="btn btn-primary">{t('home.hero.startShopping')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = getSelectedShippingOption()?.fee || 0;

  // Calculate VAT
  const vatRate = vatSettings?.rate || 24; // Default to 24%
  const vatAmount = Math.round(subtotal * (vatRate / 100));
  const totalPrice = subtotal + vatAmount + shippingCost;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  {t('cart.title')}
                </h1>
                {cart.items.length > 0 && (
                  <div className="flex gap-2 sm:hidden flex-shrink-0">
                    <Link
                      to="/products"
                      className="btn btn-outline py-1.5 px-2 flex items-center justify-center gap-0 whitespace-nowrap"
                      title={t('cartPage.continueShopping')}
                    >
                      <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="inline-flex items-center justify-center gap-0 px-2 py-1.5 border border-red-300 dark:border-red-600 rounded-md shadow-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                      title={t('cartPage.clearCart')}
                    >
                      <Trash2 className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex flex-col gap-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t('cartPage.cartDescription')}
                </p>
                {cart.items.length > 0 && (
                  <div className="flex gap-3">
                    <Link
                      to="/products"
                      className="btn btn-outline py-2 px-4 flex items-center justify-start gap-0 whitespace-nowrap"
                      title={t('cartPage.continueShopping')}
                    >
                      <span>{t('cartPage.continueShopping')}</span>
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="inline-flex items-center justify-start gap-2 px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                      title={t('cartPage.clearCart')}
                    >
                      <Trash2 className="w-4 h-4 flex-shrink-0" />
                      <span>{t('cartPage.clearCart')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  {t('cartPage.cartItems')}
                </h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4 last:border-b-0">
                      <div className="flex gap-2 sm:gap-4">
                        {/* Product Image - Compact */}
                        <div className="flex-shrink-0">
                          {item.product.imageUrl ? (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5 flex items-center justify-center">
                              <img
                                src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://192.168.8.62:5000'}${item.product.imageUrl}`}
                                alt={item.product.name}
                                className="w-full h-full object-contain rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <span className="text-gray-400 dark:text-gray-500 text-xs">{t('cartPage.noImage')}</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info and Controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base sm:text-base font-medium text-gray-900 dark:text-white truncate leading-tight">
                              {getProductName(currentLanguage, item.product)}
                            </h3>
                            <p className="text-sm sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.product.price.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')} {t('cartPage.each')}
                            </p>
                          </div>

                          {/* Quantity Controls - Compact */}
                          <div className="flex items-center gap-1 mt-1 sm:mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-1.5 sm:px-2 py-0.5 text-center min-w-[28px] sm:min-w-[36px] font-medium text-xs sm:text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-0.5 sm:p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-1"
                              title={t('common.remove')}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="flex-shrink-0 text-right flex flex-col justify-between">
                          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {(item.product.price * item.quantity).toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkout Form - Middle Column */}
            <div className="lg:col-span-1 space-y-6">
              <form onSubmit={handleSubmit(onSubmitOrder)} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('checkoutPage.checkout')}
                  </h2>
                </div>

                {/* Shipping Options */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    {t('checkoutPage.shippingOptions')}
                  </h3>

                  {isLoadingShipping ? (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner size="small" />
                      <span className="ml-2 text-gray-600">{t('common.loading')}</span>
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>{t('checkoutPage.noShippingOptions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <label key={option.id} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 transition-colors">
                          <input
                            type="radio"
                            name="shippingOption"
                            value={option.id}
                            checked={selectedShippingOptionId == option.id}
                            onChange={(e) => setSelectedShippingOptionId(parseInt(e.target.value))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {currentLanguage === 'is' ? (option.nameIs || option.name) : (option.name || option.nameEn)}
                              </div>
                              <div className="text-sm font-semibold text-primary-600">
                                {option.fee === 0 ? t('common.free') : `${option.fee.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${t('common.currency')}`}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {currentLanguage === 'is' ? (option.descriptionIs || option.description) : (option.description || option.descriptionEn)}
                            </div>
                            {option.estimatedDays && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {t('checkoutPage.estimatedDelivery')}: {option.estimatedDays} {t('checkoutPage.days')}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivery Address - Only show when delivery shipping option is selected */}
                {getSelectedShippingOption()?.type === 'delivery' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('checkoutPage.deliveryAddress')}
                    </h3>

                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {addresses.map((address) => (
                          <label key={address.id} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              {...register('addressId', { required: true })}
                              value={address.id}
                              className="mt-1"
                              onChange={(e) => setSelectedAddressId(e.target.value)}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {address.street}, {address.city}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {address.postalCode}, {address.country}
                              </div>
                              {address.notes && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {address.notes}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {errors.addressId && (
                      <p className="text-red-600 text-sm mb-4">
                        {t('checkoutPage.selectDeliveryAddress')}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="btn btn-outline text-sm"
                    >
                      + {t('addresses.add')}
                    </button>

                    {/* New Address Form */}
                    {showNewAddressForm && (
                      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">{t('checkoutPage.newAddress')}</h4>
                        <form onSubmit={handleSubmit(onSubmitNewAddress)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('addresses.street')}
                              </label>
                              <input
                                type="text"
                                {...register('street', { required: true })}
                                className="input w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('addresses.city')}
                              </label>
                              <input
                                type="text"
                                {...register('city', { required: true })}
                                className="input w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('addresses.postalCode')}
                              </label>
                              <input
                                type="text"
                                {...register('postalCode', { required: true })}
                                className="input w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('addresses.country')}
                              </label>
                              <input
                                type="text"
                                {...register('country', { required: true })}
                                defaultValue="Iceland"
                                className="input w-full"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productDetailPage.notesOptional')}</label>
                            <textarea
                              {...register('notes')}
                              rows={3}
                              className="input w-full"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button type="submit" className="btn btn-primary">{t('checkoutPage.saveAddress')}</button>
                            <button
                              type="button"
                              onClick={() => setShowNewAddressForm(false)}
                              className="btn btn-outline"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Pickup Time Selection - Only show when pickup shipping option is selected */}
                {getSelectedShippingOption()?.type === 'pickup' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('checkoutPage.pickupTime')}
                    </h3>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('checkoutPage.selectPickupTimeHelp')}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {generatePickupTimes().map((time) => (
                          <button
                            key={time.value}
                            type="button"
                            onClick={() => setSelectedPickupTime(time.value)}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              selectedPickupTime === time.value
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-300'
                            }`}
                          >
                            {time.display}
                          </button>
                        ))}
                      </div>

                      {generatePickupTimes().length === 0 && (
                        <p className="text-red-600 text-sm">
                          {t('checkoutPage.noPickupTimes')}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t('checkoutPage.storeLocation')}</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{t('checkoutPage.storeLocationValue')}</p>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('checkoutPage.paymentMethod')}
                  </h3>

                  <div className="space-y-3">
                    {isLoadingGateways ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="small" />
                        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
                      </div>
                    ) : (
                      <>
                        {isValitorAvailable() && (
                          <label className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 transition-colors">
                            <input
                              type="radio"
                              value="valitor"
                              checked={paymentMethod === 'valitor'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{t('checkoutPage.valitorPayment')}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t('checkoutPage.valitorDesc')}</div>
                            </div>
                          </label>
                        )}

                        {isCashOnDeliveryAvailable() && (
                          <label className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 transition-colors">
                            <input
                              type="radio"
                              value="cash_on_delivery"
                              checked={paymentMethod === 'cash_on_delivery'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{t('checkoutPage.cashOnDelivery')}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t('checkoutPage.cashOnDeliveryDesc')}</div>
                            </div>
                          </label>
                        )}

                        {isPayOnPickupAvailable() && (
                          <label className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 transition-colors">
                            <input
                              type="radio"
                              value="pay_on_pickup"
                              checked={paymentMethod === 'pay_on_pickup'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{t('checkoutPage.payOnPickup')}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t('checkoutPage.payOnPickupDesc')}</div>
                            </div>
                          </label>
                        )}

                        {!isValitorAvailable() && !isCashOnDeliveryAvailable() && !isPayOnPickupAvailable() && (
                          <div className="text-center py-4 text-gray-500">
                            <p>{t('checkoutPage.noPaymentMethodsAvailable')}</p>
                            <p className="text-sm mt-1">{t('checkoutPage.contactAdmin')}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('checkoutPage.orderNotes')}</h3>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder={t('checkoutPage.orderNotes')}
                    className="input w-full"
                  />
                </div>

                {/* Line Items Summary */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('cartPage.cartItems')}</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-600 dark:text-gray-400 truncate">
                            {getProductName(currentLanguage, item.product)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium ml-2 flex-shrink-0">
                          {(item.product.price * item.quantity).toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 dark:border-gray-500 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('checkoutPage.subtotal')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subtotal.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                      </span>
                    </div>

                    {/* VAT Line Item */}
                    {vatAmount > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('checkout.vat')} ({vatRate}%)</span>
                        <span>
                          {vatAmount.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                        </span>
                      </div>
                    )}

                    {/* Shipping */}
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{t('checkout.shipping')}</span>
                        <span>
                          {shippingCost.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-4 border border-primary-200 dark:border-primary-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('checkout.total')}</span>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {totalPrice.toLocaleString('is-IS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('common.currency')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading || !selectedShippingOptionId || (getSelectedShippingOption()?.type === 'delivery' && !selectedAddressId) || (getSelectedShippingOption()?.type === 'pickup' && !selectedPickupTime)}
                  className="btn btn-primary w-full py-3 text-lg mt-6"
                >
                  {orderLoading ? t('checkoutPage.creatingOrder') : t('checkoutPage.placeOrder')}
                </button>

                {!selectedShippingOptionId && (
                  <p className="text-red-600 text-sm mt-2">{t('checkoutPage.selectShippingOption')}</p>
                )}

                {getSelectedShippingOption()?.type === 'delivery' && !selectedAddressId && (
                  <p className="text-red-600 text-sm mt-2">{t('checkoutPage.selectDeliveryAddress')}</p>
                )}

                {getSelectedShippingOption()?.type === 'pickup' && !selectedPickupTime && (
                  <p className="text-red-600 text-sm mt-2">{t('checkoutPage.selectPickupTime')}</p>
                )}
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


