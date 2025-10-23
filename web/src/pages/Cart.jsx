import { useEffect, useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Truck, CreditCard, MapPin } from 'lucide-react';
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


  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
      fetchEnabledPaymentGateways();
      fetchShippingOptions();
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('cart.title')}
          </h1>
          <div className="text-center">
            <div className="card p-8 max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('cartPage.emptyCart')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('cartPage.addItemsToStart')}</p>
              <Link to="/products" className="btn btn-primary w-full">{t('home.hero.startShopping')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = getSelectedShippingOption()?.fee || 0;
  const totalPrice = subtotal + shippingCost;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('cart.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('cartPage.cartDescription')}
                </p>
              </div>
              {cart.items.length > 0 && (
                <div className="flex gap-3">
                  <Link
                    to="/products"
                    className="btn btn-outline py-2"
                  >
                    {t('cartPage.continueShopping')}
                  </Link>
                  <button
                    onClick={handleClearCart}
                    className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{t('cartPage.clearCart')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  {t('cartPage.cartItems')}
                </h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="card p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.product.imageUrl ? (
                            <div className="w-20 h-20 bg-white dark:bg-white rounded-lg p-1">
                              <img
                                src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${item.product.imageUrl}`}
                                alt={item.product.name}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <span className="text-gray-400 dark:text-gray-500 text-xs">{t('cartPage.noImage')}</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {getProductName(currentLanguage, item.product)}
                          </h3>
                        </div>

                        {/* Quantity Controls and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-center min-w-[60px] font-medium text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              title={t('common.remove')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-left sm:text-right">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {(item.product.price * item.quantity).toLocaleString()} {t('common.currency')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.product.price.toLocaleString()} {t('common.currency')} {t('cartPage.each')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
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
                                {option.fee === 0 ? t('common.free') : `${option.fee.toLocaleString()} ${t('common.currency')}`}
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

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('checkoutPage.subtotal')} ({totalItems} {t('checkoutPage.items')})</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {getSelectedShippingOption() ? (currentLanguage === 'is' ? (getSelectedShippingOption().nameIs || getSelectedShippingOption().name) : (getSelectedShippingOption().name || getSelectedShippingOption().nameEn)) : t('checkoutPage.shipping')}
                    </span>
                    <span className="font-medium">
                      {getSelectedShippingOption()?.fee === 0 ? (
                        <span className="text-green-600">{t('common.free')}</span>
                      ) : (
                        `${getSelectedShippingOption()?.fee?.toLocaleString() || 0} ${t('common.currency')}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.total')}</span>
                      <span className="text-lg font-bold text-primary-600">
                        {totalPrice.toLocaleString()} {t('common.currency')}
                      </span>
                    </div>
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


