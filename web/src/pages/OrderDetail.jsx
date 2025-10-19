import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import { fetchOrder, clearCurrentOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetail = () => {
  const { t } = useTranslation();
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

  const getStatusText = (status) => t(`orders.statuses.${status}`);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('orderDetailPage.backToOrders')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('orderDetailPage.order')} #{currentOrder.orderNumber}
                  </h1>
                  <p className="text-gray-600">{t('orderDetailPage.created')}: {formatDate(currentOrder.createdAt)}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${getStatusColor(currentOrder.status)}`}>
                  {getStatusIcon(currentOrder.status)}
                  <span className="font-medium">{getStatusText(currentOrder.status)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orderDetailPage.orderItems')}</h2>
              <div className="space-y-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {item.product.imageUrl ? (
                      <img
                        src={`http://localhost:5000${item.product.imageUrl}`}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product.nameIs || item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{t('orderDetailPage.quantity')}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} {t('common.currency')}
                      </p>
                      <p className="text-sm text-gray-600">{item.price.toLocaleString()} {t('common.currency')} {t('orderDetailPage.each')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {t('orderDetailPage.deliveryInfo')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('orderDetailPage.deliveryMethod')}</h3>
                  <p className="text-gray-600">{currentOrder.deliveryMethod === 'PICKUP' ? t('orderDetailPage.storePickup') : t('orderDetailPage.homeDelivery')}</p>
                  {currentOrder.pickupTime && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t('navigation.language') === 'is' ? 'Tími:' : 'Time:'} {currentOrder.pickupTime}
                    </p>
                  )}
                </div>

                {currentOrder.deliveryMethod === 'DELIVERY' && currentOrder.address && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('orderDetailPage.deliveryAddress')}</h3>
                    <p className="text-gray-600">
                      {currentOrder.address.street}<br />
                      {currentOrder.address.city}, {currentOrder.address.postalCode}<br />
                      {currentOrder.address.country}
                    </p>
                  </div>
                )}

                {currentOrder.deliveryPerson && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {t('orderDetailPage.deliveryPerson')}
                    </h3>
                    <p className="text-gray-600">{currentOrder.deliveryPerson.fullName}</p>
                    {currentOrder.deliveryPerson.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {currentOrder.deliveryPerson.phone}
                      </p>
                    )}
                  </div>
                )}

                {currentOrder.estimatedDelivery && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {t('orderDetailPage.estimatedDelivery')}
                    </h3>
                    <p className="text-gray-600">{formatDate(currentOrder.estimatedDelivery)}</p>
                  </div>
                )}

                {currentOrder.deliveredAt && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('orderDetailPage.deliveredAt')}</h3>
                    <p className="text-gray-600">{formatDate(currentOrder.deliveredAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {currentOrder.transaction && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('orderDetailPage.paymentInfo')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-900">{t('orderDetailPage.paymentMethod')}</span>
                    <p className="text-gray-600">{currentOrder.transaction.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{t('orderDetailPage.status')}</span>
                    <p className="text-gray-600">{currentOrder.transaction.paymentStatus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {currentOrder.notes && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orderDetailPage.notes')}</h2>
                <p className="text-gray-600">{currentOrder.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary & Map */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orders.title')}</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.reorder')}</span>
                  <span className="font-medium">
                    {(currentOrder.totalAmount - currentOrder.deliveryFee).toLocaleString()} {t('common.currency')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{currentOrder.deliveryMethod === 'PICKUP' ? t('ordersPage.pickup') : t('ordersPage.delivery')}</span>
                  <span className="font-medium">
                    {currentOrder.deliveryFee === 0 
                      ? (t('navigation.language') === 'is' ? 'Ókeypis' : 'Free')
                      : `${currentOrder.deliveryFee.toLocaleString()} ${t('common.currency')}`
                    }
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">{t('common.total')}</span>
                    <span className="text-lg font-bold text-primary-600">
                      {currentOrder.totalAmount.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Tracking Map */}
            {currentOrder.status === 'OUT_FOR_DELIVERY' && currentOrder.deliveryMethod === 'DELIVERY' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orderDetailPage.deliveryTracking')}</h2>
                
                {deliveryLocation ? (
                  <div>
                    {/* OpenStreetMap Integration */}
                    <div className="bg-gray-200 rounded-lg h-64 mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{t('orderDetailPage.onTheWay')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('orderDetailPage.lastUpdated')}: {new Date(deliveryLocation.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>
                        {t('navigation.language') === 'is' 
                          ? 'Áætluð afhending:' 
                          : 'Estimated delivery'}: {currentOrder.estimatedDelivery ? formatDate(currentOrder.estimatedDelivery) : 'TBD'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {t('orderDetailPage.notStarted')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('navigation.language') === 'is' ? 'Hafa samband' : 'Contact'}
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">
                    {t('navigation.language') === 'is' ? 'Netfang:' : 'Email:'}
                  </span>
                  <br />
                  <a href="mailto:info@olfong.is" className="text-primary-600 hover:text-primary-700">
                    info@olfong.is
                  </a>
                </p>
                <p>
                  <span className="font-medium">
                    {t('navigation.language') === 'is' ? 'Sími:' : 'Phone:'}
                  </span>
                  <br />
                  <a href="tel:+3541234567" className="text-primary-600 hover:text-primary-700">
                    +354 123 4567
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


