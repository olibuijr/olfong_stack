import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, CreditCard, Truck } from 'lucide-react';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchAddresses, createAddress } from '../store/slices/addressSlice';
import { createOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const { cart, isLoading: cartLoading } = useSelector((state) => state.cart);
  const { addresses, isLoading: addressesLoading } = useSelector((state) => state.addresses);
  const { isLoading: orderLoading } = useSelector((state) => state.orders);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('valitor');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [enabledPaymentGateways, setEnabledPaymentGateways] = useState([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(true);

  const selectedAddress = watch('addressId');

  // Fetch enabled payment gateways
  const fetchEnabledPaymentGateways = async () => {
    try {
      setIsLoadingGateways(true);
      const response = await fetch('/api/payment-gateways/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnabledPaymentGateways(data.data.gateways || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error);
    } finally {
      setIsLoadingGateways(false);
    }
  };

  // Generate available pickup times for today (15:00 - 24:00 with 30-minute intervals)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Start from 15:00 (3 PM)
    for (let hour = 15; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Only show times that haven't passed today
        if (hour > currentHour || (hour === currentHour && minute > currentMinute + 30)) {
          times.push({
            value: timeString,
            label: timeString,
            display: hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:${minute.toString().padStart(2, '0')} PM` : `${hour}:${minute.toString().padStart(2, '0')} AM`
          });
        }
      }
    }
    
    return times;
  };

  // Helper functions to check if payment methods are available
  const isPaymentMethodAvailable = (provider) => {
    return enabledPaymentGateways.some(gateway => 
      gateway.provider === provider && gateway.isEnabled && gateway.isActive
    );
  };

  const isValitorAvailable = () => isPaymentMethodAvailable('valitor');
  const isCashOnDeliveryAvailable = () => isPaymentMethodAvailable('cash_on_delivery') && deliveryMethod === 'delivery';
  const isPayOnPickupAvailable = () => isPaymentMethodAvailable('pay_on_pickup') && deliveryMethod === 'pickup';

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
      fetchEnabledPaymentGateways();
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error(t('cart.empty'));
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, cart, navigate, t]);

  const onSubmitOrder = async (data) => {
    try {
      const orderData = {
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
        notes: data.notes || ''
      };

      // Add delivery-specific data
      if (deliveryMethod === 'delivery') {
        if (!selectedAddressId) {
          toast.error(t('checkoutPage.selectDeliveryAddress'));
          return;
        }
        orderData.deliveryAddressId = selectedAddressId;
      } else if (deliveryMethod === 'pickup') {
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

  if (!isAuthenticated || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
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

  const totalPrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkoutPage.checkout')}</h1>

        <form onSubmit={handleSubmit(onSubmitOrder)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Method */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">{t('checkoutPage.deliveryOption')}</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t('checkoutPage.homeDelivery')}</div>
                    <div className="text-sm text-gray-500">{t('checkoutPage.deliveryToAddress')}</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t('checkoutPage.storePickup')}</div>
                    <div className="text-sm text-gray-500">{t('checkoutPage.pickupAtStore')}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Address - Only show when delivery is selected */}
            {deliveryMethod === 'delivery' && (
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">{t('checkoutPage.deliveryAddress')}</h2>
                </div>

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
                        <div className="font-medium text-gray-900">
                          {address.street}, {address.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.postalCode}, {address.country}
                        </div>
                        {address.notes && (
                          <div className="text-sm text-gray-500 mt-1">
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
                className="btn btn-outline flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addresses.add')}
              </button>

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-4">{t('checkoutPage.newAddress')}</h3>
                  <form onSubmit={handleSubmit(onSubmitNewAddress)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('addresses.street')}
                        </label>
                        <input
                          type="text"
                          {...register('street', { required: true })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('addresses.city')}
                        </label>
                        <input
                          type="text"
                          {...register('city', { required: true })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('addresses.postalCode')}
                        </label>
                        <input
                          type="text"
                          {...register('postalCode', { required: true })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('productDetailPage.notesOptional')}</label>
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

            {/* Pickup Time Selection - Only show when pickup is selected */}
            {deliveryMethod === 'pickup' && (
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">{t('checkoutPage.pickupTime')}</h2>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">{t('checkoutPage.selectPickupTimeHelp')}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {generatePickupTimes().map((time) => (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => setSelectedPickupTime(time.value)}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          selectedPickupTime === time.value
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">{t('checkoutPage.storeLocation')}</h3>
                  <p className="text-sm text-blue-700">{t('checkoutPage.storeLocationValue')}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">{t('checkoutPage.paymentMethod')}</h2>
              </div>

              <div className="space-y-3">
                {isLoadingGateways ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="small" />
                    <span className="ml-2 text-gray-600">{t('common.loading')}</span>
                  </div>
                ) : (
                  <>
                    {isValitorAvailable() && (
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value="valitor"
                          checked={paymentMethod === 'valitor'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{t('checkoutPage.valitorPayment')}</div>
                          <div className="text-sm text-gray-500">{t('checkoutPage.valitorDesc')}</div>
                        </div>
                      </label>
                    )}

                    {isCashOnDeliveryAvailable() && (
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value="cash_on_delivery"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{t('checkoutPage.cashOnDelivery')}</div>
                          <div className="text-sm text-gray-500">{t('checkoutPage.cashOnDeliveryDesc')}</div>
                        </div>
                      </label>
                    )}

                    {isPayOnPickupAvailable() && (
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value="pay_on_pickup"
                          checked={paymentMethod === 'pay_on_pickup'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{t('checkoutPage.payOnPickup')}</div>
                          <div className="text-sm text-gray-500">{t('checkoutPage.payOnPickupDesc')}</div>
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
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkoutPage.orderNotes')}</h2>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder={t('checkoutPage.orderNotes')}
                className="input w-full"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
              <div className="card p-6 sticky top-8">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">{t('checkoutPage.orderSummary')}</h2>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.product.nameIs || item.product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.quantity}x {item.product.price.toLocaleString()} {t('common.currency')}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString()} {t('common.currency')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkoutPage.items')} ({totalItems})</span>
                  <span className="font-medium">
                    {totalPrice.toLocaleString()} {t('common.currency')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{deliveryMethod === 'pickup' ? t('ordersPage.pickup') : t('ordersPage.delivery')}</span>
                  <span className="font-medium text-green-600">{t('common.free')}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('common.total')}</span>
                    <span className="text-lg font-bold text-primary-600">
                      {totalPrice.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading || (deliveryMethod === 'delivery' && !selectedAddressId) || (deliveryMethod === 'pickup' && !selectedPickupTime)}
                className="btn btn-primary w-full py-3 text-lg mt-6"
              >
                {orderLoading ? t('checkoutPage.creatingOrder') : t('checkoutPage.placeOrder')}
              </button>

              {deliveryMethod === 'delivery' && !selectedAddressId && (
                <p className="text-red-600 text-sm mt-2">{t('checkoutPage.selectDeliveryAddress')}</p>
              )}

              {deliveryMethod === 'pickup' && !selectedPickupTime && (
                <p className="text-red-600 text-sm mt-2">{t('checkoutPage.selectPickupTime')}</p>
              )}
            </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;


