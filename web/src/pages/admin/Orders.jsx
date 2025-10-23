import { useEffect, useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  User, 
  MapPin,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { fetchAllOrders, updateOrderStatus, assignDeliveryPerson } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import ReceiptModal from '../../components/common/ReceiptModal';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryMethodFilter, setDeliveryMethodFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignedDelivery, setAssignedDelivery] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchAllOrders({ limit: 100 }));
    }
  }, [dispatch, user]);

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

  const getStatusText = (status) => t('orders.statuses')[status];

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.fullName && order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.username && order.user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesDeliveryMethod = !deliveryMethodFilter || order.deliveryMethod === deliveryMethodFilter;
    
    return matchesSearch && matchesStatus && matchesDeliveryMethod;
  });

  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ 
        orderId: selectedOrder.id, 
        status: newStatus 
      })).unwrap();
      toast.success(t('adminPage.statusUpdated'));
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (error) {
      toast.error(error.message || t('adminPage.errorOccurred'));
    }
  };

  const handleDeliveryAssignment = async () => {
    try {
      await dispatch(assignDeliveryPerson({ 
        id: selectedOrder.id, 
        deliveryPersonId: assignedDelivery 
      })).unwrap();
      toast.success(t('adminPage.deliveryAssigned'));
      setShowAssignModal(false);
      setSelectedOrder(null);
      setAssignedDelivery('');
    } catch (error) {
      toast.error(error.message || t('adminPage.errorOccurred'));
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: t('orders.statuses.PENDING') },
    { value: 'CONFIRMED', label: t('orders.statuses.CONFIRMED') },
    { value: 'PREPARING', label: t('orders.statuses.PREPARING') },
    { value: 'OUT_FOR_DELIVERY', label: t('orders.statuses.OUT_FOR_DELIVERY') },
    { value: 'DELIVERED', label: t('orders.statuses.DELIVERED') },
    { value: 'CANCELLED', label: t('orders.statuses.CANCELLED') },
  ];

  // Mock delivery persons - in real app, this would come from API
  const deliveryPersons = [
    { id: 1, name: 'Jón Jónsson', phone: '+354 123 4567' },
    { id: 2, name: 'Anna Sigurðardóttir', phone: '+354 765 4321' },
    { id: 3, name: 'Magnús Magnússon', phone: '+354 987 6543' },
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

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminPage.orderManagement')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminPage.manageOrders')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('adminPage.searchOrders')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="">{t('adminPage.allStatuses')}</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Delivery Method Filter */}
            <select
              value={deliveryMethodFilter}
              onChange={(e) => setDeliveryMethodFilter(e.target.value)}
              className="input w-full"
            >
              <option value="">{t('adminPage.allDeliveryMethods')}</option>
              <option value="DELIVERY">{t('adminPage.homeDelivery')}</option>
              <option value="PICKUP">{t('adminPage.storePickup')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              {filteredOrders.length} {t('adminPage.results')}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.order')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.delivery')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('adminPage.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items.length} {t('cart.items')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.user?.fullName || order.user?.username || t('common.unknown')}
                          </div>
                          {order.user?.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.deliveryMethod === 'PICKUP' ? t('ordersPage.pickup') : t('ordersPage.homeDelivery')}
                        </div>
                      </div>
                      {order.deliveryPerson && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('adminPage.deliveryPerson')}: {order.deliveryPerson.fullName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.totalAmount.toLocaleString()} {t('common.currency')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReceiptModal(true);
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors duration-200 flex items-center space-x-1"
                          title={t('receipts.viewReceipt')}
                        >
                          <Receipt className="w-4 h-4" />
                          <span>{t('receipts.receipt')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                            setNewStatus(order.status);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          {t('adminPage.update')}
                        </button>
                        {order.deliveryMethod === 'DELIVERY' && !order.deliveryPerson && order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowAssignModal(true);
                            }}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200"
                          >
                            {t('adminPage.assign')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('adminPage.noOrdersFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('adminPage.adjustSearchCriteria')}
            </p>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('adminPage.updateOrder')} #{selectedOrder.orderNumber}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('adminPage.newStatus')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="btn btn-primary flex-1"
                >
                  {t('adminPage.update')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Delivery Modal */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('adminPage.assignDeliveryPerson')} #{selectedOrder.orderNumber}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('adminPage.deliveryPerson')}
                </label>
                <select
                  value={assignedDelivery}
                  onChange={(e) => setAssignedDelivery(e.target.value)}
                  className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t('adminPage.selectDeliveryPerson')}</option>
                  {deliveryPersons.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedOrder(null);
                    setAssignedDelivery('');
                  }}
                  className="btn btn-outline flex-1"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeliveryAssignment}
                  disabled={!assignedDelivery}
                  className="btn btn-primary flex-1"
                >
                  {t('adminPage.assign')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          order={selectedOrder}
          onEmailSent={() => {
            toast.success(t('receipts.emailSentSuccess'));
          }}
        />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;


