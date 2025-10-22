import { useEffect, useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  Phone, 
  User, 
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.orders);

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (user?.role === 'DELIVERY') {
      dispatch(fetchAllOrders({ deliveryPersonId: user.id }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (orders) {
      // Filter orders assigned to this delivery person
      const myOrders = orders.filter(order => 
        order.deliveryPerson?.id === user?.id && 
        ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status)
      );
      setAssignedOrders(myOrders);
    }
  }, [orders, user]);

  useEffect(() => {
    let watchId;
    
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
          // TODO: Implement location update functionality
          // dispatch(updateLocation({
          //   deliveryPersonId: user.id,
          //   latitude: location.lat,
          //   longitude: location.lng
          // }));
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Villa við að fá staðsetningu');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, dispatch, user, t]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'PREPARING':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Staðfest';
      case 'PREPARING':
        return 'Undirbúningur';
      case 'OUT_FOR_DELIVERY':
        return 'Í afhendingu';
      case 'DELIVERED':
        return 'Afhent';
      default:
        return status; // Fallback to original status if not found
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ 
        orderId: selectedOrder.id, 
        status: newStatus 
      })).unwrap();
      toast.success('Staða uppfært!');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (error) {
      toast.error(error.message || ('Villa kom upp'));
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      toast.success('Staðsetning byrjað');
    } else {
      toast.info('Staðsetning stöðvuð');
    }
  };

  const startDelivery = (order) => {
    setSelectedOrder(order);
    setNewStatus('OUT_FOR_DELIVERY');
    setShowStatusModal(true);
  };

  const completeDelivery = (order) => {
    setSelectedOrder(order);
    setNewStatus('DELIVERED');
    setShowStatusModal(true);
  };

  const statusOptions = [
    { value: 'CONFIRMED', label: 'Staðfest' },
    { value: 'PREPARING', label: 'Undirbúningur' },
    { value: 'OUT_FOR_DELIVERY', label: 'Í afhendingu' },
    { value: 'DELIVERED', label: 'Afhent' },
  ];

  if (user?.role !== 'DELIVERY') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('delivery', 'title')}
            </h1>
            <div className="card p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {'Aðgangur bannaður'}
              </h2>
              <p className="text-gray-600">
                {'Þú hefur ekki leyfi til að skoða þessa síðu.'}
              </p>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('delivery', 'title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {'Velkomin, ' + (user?.fullName || user?.username) + '. Stjórnaðu afhendingum þínum.'}
            </p>
          </div>
          
          {/* Location Tracking Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isTracking 
                  ? ('Staðsetning virk')
                  : ('Staðsetning óvirk')
                }
              </span>
            </div>
            <button
              onClick={toggleTracking}
              className={`btn ${isTracking ? 'btn-outline' : 'btn-primary'} flex items-center space-x-2`}
            >
              {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>
                {isTracking 
                  ? ('Stöðva')
                  : ('Byrja')
                }
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
'Úthlutaðar pantanir'
                </p>
                <p className="text-2xl font-bold text-gray-900">{assignedOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
'Í afhendingu'
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedOrders.filter(order => order.status === 'OUT_FOR_DELIVERY').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
'Afhent í dag'
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedOrders.filter(order => 
                    order.status === 'DELIVERED' && 
                    new Date(order.updatedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
'Bíður afhendingar'
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedOrders.filter(order => ['CONFIRMED', 'PREPARING'].includes(order.status)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Orders */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
  'Úthlutaðar pantanir'
          </h2>

          {assignedOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
'Engar pantanir úthlutaðar'
              </h3>
              <p className="text-gray-600">
'Engar pantanir hafa verið úthlutaðar þér ennþá.'
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignedOrders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
'Pöntun' #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {order.user?.fullName || order.user?.username}
                      </span>
                    </div>
                    {order.user?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${order.user.phone}`} className="text-primary-600 hover:text-primary-700">
                          {order.user.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Delivery Info */}
                  {order.deliveryMethod === 'DELIVERY' && order.address && (
                    <div className="mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Afhendingarstaður</p>
                          <p className="text-sm text-gray-600">
                            {order.address.street}<br />
                            {order.address.city}, {order.address.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
'Vörur:'
                    </h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product.nameIs || item.product.name}</span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toLocaleString()} {t('common', 'currency')}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500">
'fleiri'
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
  'Samtals:'
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {order.totalAmount.toLocaleString()} {t('common', 'currency')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => startDelivery(order)}
                        className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
'Byrja afhendingu'
                      </button>
                    )}
                    
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => completeDelivery(order)}
                        className="btn btn-success flex-1 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
'Ljúka afhendingu'
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setShowStatusModal(true);
                      }}
                      className="btn btn-outline"
                    >
'Breyta'
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
'Uppfæra pöntun' #{selectedOrder.orderNumber}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
'Ný staða'
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input w-full"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="btn btn-outline flex-1"
                >
'Hætta við'
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="btn btn-primary flex-1"
                >
'Uppfæra'
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;


