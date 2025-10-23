import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, User, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { fetchOrder, clearCurrentOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DeliveryMap from '../components/common/DeliveryMap';
import ProductImage from '../components/common/ProductImage';

const OrderDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, isLoading, error } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Simulate delivery location updates (in real app, this would come from WebSocket)
  useEffect(() => {
    if (currentOrder && currentOrder.status === 'OUT_FOR_DELIVERY') {
      // Simulate delivery person location (Reykjavik coordinates)
      const interval = setInterval(() => {
        setDeliveryLocation({
          lat: 64.1466 + (Math.random() - 0.5) * 0.01,
          lng: -21.9426 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString()
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentOrder]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'CONFIRMED':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'PREPARING':
        return <Package className="w-6 h-6 text-purple-600" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-6 h-6 text-orange-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = (status) => t('orders.statuses', status);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('orderDetailPage.orderNotFound')}</h1>
            <p className="text-gray-600 mb-8">{t('orderDetailPage.orderNotFoundDesc')}</p>
            <button onClick={() => navigate('/orders')} className="btn btn-primary">{t('orderDetailPage.backToOrders')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('orderDetailPage.backToOrders')}
        </button>

        {/* Main Receipt-style Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Header - Receipt Style */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-6 sm:px-8 py-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  #{currentOrder.orderNumber}
                </h1>
                <p className="text-primary-100 text-sm">{t('orderDetailPage.created')}: {formatDate(currentOrder.createdAt)}</p>
              </div>
              <div className={`px-4 py-3 rounded-lg flex items-center space-x-2 font-semibold text-lg ${getStatusColor(currentOrder.status)}`}>
                {getStatusIcon(currentOrder.status)}
                <span>{getStatusText(currentOrder.status)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">

            {/* Order Items Section */}
            <div className="px-6 sm:px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                {t('orderDetailPage.orderItems')}
              </h2>
              <div className="space-y-6">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ProductImage
                      product={item.product}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0 bg-white dark:bg-gray-600 rounded-lg p-2"
                      currentLanguage={t('navigation.language')}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {item.product.nameIs || item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.product.descriptionIs || item.product.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t('orderDetailPage.quantity')}: <span className="font-bold text-gray-900 dark:text-white ml-1">{item.quantity}</span>
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.price.toLocaleString()} {t('common.currency')} {t('orderDetailPage.each')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('common.currency')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Map Section */}
            <div className="px-6 sm:px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                {t('orderDetailPage.deliveryInfo')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Delivery Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                      {t('orderDetailPage.deliveryMethod')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {currentOrder.shippingOption?.type === 'pickup'
                        ? t('orderDetailPage.storePickup')
                        : t('orderDetailPage.homeDelivery')}
                    </p>
                    {currentOrder.pickupTime && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {t('checkoutPage.pickupTime')}: <span className="font-semibold">{currentOrder.pickupTime}</span>
                      </p>
                    )}
                  </div>

                  {currentOrder.address && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        {t('orderDetailPage.deliveryAddress')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{currentOrder.address.street}</span><br />
                        <span className="text-sm">{currentOrder.address.city}, {currentOrder.address.postalCode}</span><br />
                        <span className="text-sm">{currentOrder.address.country}</span>
                      </p>
                    </div>
                  )}

                  {currentOrder.deliveryPerson && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                        {t('orderDetailPage.deliveryPerson')}
                      </h3>
                      <p className="font-medium text-gray-900 dark:text-white">{currentOrder.deliveryPerson.fullName}</p>
                      {currentOrder.deliveryPerson.phone && (
                        <a href={`tel:${currentOrder.deliveryPerson.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-2">
                          <Phone className="w-3 h-3 mr-1" />
                          {currentOrder.deliveryPerson.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {currentOrder.estimatedDelivery && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        {t('orderDetailPage.estimatedDelivery')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(currentOrder.estimatedDelivery)}</p>
                    </div>
                  )}

                  {currentOrder.deliveredAt && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('orderDetailPage.deliveredAt')}
                      </h3>
                      <p className="text-green-800 dark:text-green-300">{formatDate(currentOrder.deliveredAt)}</p>
                    </div>
                  )}
                </div>

                {/* Map */}
                <div>
                  <DeliveryMap
                    deliveryLocation={deliveryLocation}
                    deliveryAddress={currentOrder.address}
                    orderType={currentOrder.shippingOption?.type || 'delivery'}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {currentOrder.transaction && (
              <div className="px-6 sm:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
                  {t('orderDetailPage.paymentInfo')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-white block mb-2">{t('orderDetailPage.paymentMethod')}</span>
                    <p className="text-gray-600 dark:text-gray-400">{currentOrder.transaction.paymentMethod}</p>
                  </div>
                  <div className={`p-5 rounded-lg ${currentOrder.transaction.paymentStatus === 'COMPLETED' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
                    <span className={`font-semibold block mb-2 ${currentOrder.transaction.paymentStatus === 'COMPLETED' ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'}`}>
                      {t('orderDetailPage.status')}
                    </span>
                    <p className={currentOrder.transaction.paymentStatus === 'COMPLETED' ? 'text-green-800 dark:text-green-300 font-medium' : 'text-yellow-800 dark:text-yellow-300 font-medium'}>
                      {currentOrder.transaction.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {currentOrder.notes && (
              <div className="px-6 sm:px-8 py-8 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                  {t('orderDetailPage.notes')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{currentOrder.notes}</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="px-6 sm:px-8 py-8 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('orders.title')}</h2>

              <div className="space-y-4 max-w-md ml-auto">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('orders.reorder')}</span>
                  <span className="font-medium">
                    {((currentOrder.totalAmount || 0) - (currentOrder.deliveryFee || 0)).toLocaleString()} {t('common.currency')}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{currentOrder.shippingOption?.type === 'pickup' ? t('ordersPage.pickup') : t('ordersPage.delivery')}</span>
                  <span className="font-medium">
                    {(currentOrder.deliveryFee || 0) === 0
                      ? (t('navigation.language') === 'is' ? 'Ókeypis' : 'Free')
                      : `${(currentOrder.deliveryFee || 0).toLocaleString()} ${t('common.currency')}`
                    }
                  </span>
                </div>

                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 flex justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{t('common.total')}</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {(currentOrder.totalAmount || 0).toLocaleString()} {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information Footer */}
            <div className="px-6 sm:px-8 py-8 bg-gray-900 dark:bg-black text-white">
              <h2 className="text-xl font-bold mb-6">
                {t('footer.contact')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    {t('footer.email')}
                  </p>
                  <a href="mailto:info@olfong.is" className="text-primary-400 hover:text-primary-300 font-medium break-all">
                    info@olfong.is
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    {t('footer.phone')}
                  </p>
                  <a href="tel:+3541234567" className="text-primary-400 hover:text-primary-300 font-medium">
                    +354 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


