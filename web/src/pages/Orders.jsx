import { useEffect } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye, RotateCcw } from 'lucide-react';
import { fetchUserOrders, setFilters } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Orders = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { orders, pagination, filters, isLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders(filters));
    }
  }, [dispatch, isAuthenticated, filters]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CONFIRMED':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'PREPARING':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => t('orders.statuses', status);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status === filters.status ? '' : status }));
  };

  const handleReorder = (order) => {
    // TODO: Implement reorder functionality
    console.log('Reorder order:', order);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('orders.title')}
            </h1>
            <div className="card p-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('ordersPage.loginToView')}</h2>
              <p className="text-gray-600 mb-6">{t('ordersPage.mustLogin')}</p>
              <Link to="/login" className="btn btn-primary">{t('navigation.login')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('orders.title')}
          </h1>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`btn ${filters.status === '' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t('ordersPage.allOrders')}
            </button>
            <button
              onClick={() => handleStatusFilter('PENDING')}
              className={`btn ${filters.status === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t('ordersPage.pending')}
            </button>
            <button
              onClick={() => handleStatusFilter('CONFIRMED')}
              className={`btn ${filters.status === 'CONFIRMED' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t('ordersPage.confirmed')}
            </button>
            <button
              onClick={() => handleStatusFilter('OUT_FOR_DELIVERY')}
              className={`btn ${filters.status === 'OUT_FOR_DELIVERY' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t('ordersPage.outForDelivery')}
            </button>
            <button
              onClick={() => handleStatusFilter('DELIVERED')}
              className={`btn ${filters.status === 'DELIVERED' ? 'btn-primary' : 'btn-outline'}`}
            >
              {t('ordersPage.delivered')}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('ordersPage.noOrders')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('ordersPage.noOrdersDesc')}
            </p>
              <Link to="/products" className="btn btn-primary">{t('ordersPage.startShopping')}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('orderDetailPage.order')} #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">
                          {t('ordersPage.date')}
                        </span>
                        <br />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t('ordersPage.total')}
                        </span>
                        <br />
                        {order.totalAmount.toLocaleString()} {t('common.currency')}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t('ordersPage.delivery')}
                        </span>
                        <br />
                        {order.deliveryMethod === 'PICKUP' 
                          ? t('ordersPage.pickup')
                          : t('ordersPage.homeDelivery')
                        }
                        {order.pickupTime && (
                          <span className="block">
                            {t('ordersPage.time')} {order.pickupTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {t('ordersPage.items')}
                      </h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.product.nameIs || item.product.name}
                            </span>
                            <span className="font-medium">
                              {(item.price * item.quantity).toLocaleString()} {t('common.currency')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address (for delivery orders) */}
                    {order.deliveryMethod === 'DELIVERY' && order.address && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {t('ordersPage.deliveryAddress')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.address.street}, {order.address.city}, {order.address.postalCode}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {t('ordersPage.notes')}
                        </h4>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('ordersPage.view')}</span>
                    </Link>
                    
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{t('ordersPage.reorder')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch(fetchUserOrders({ ...filters, page: pagination.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-outline"
              >
                {t('ordersPage.previous')}
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
                {t('ordersPage.page')} {pagination.page} {t('ordersPage.of')} {pagination.pages}
              </span>
              
              <button
                onClick={() => dispatch(fetchUserOrders({ ...filters, page: pagination.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn btn-outline"
              >
                {t('ordersPage.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;


