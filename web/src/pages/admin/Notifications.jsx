import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell,
  AlertTriangle,
  Mail,
  Phone,
  Settings,
  Search,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Clock,
  ShoppingCart,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLanguage } from "../../contexts/LanguageContext";
import toast from 'react-hot-toast';

const Notifications = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    systemAlerts: true,
    marketing: false,
    securityAlerts: true
  });

  // Mock notifications data - in real app, this would come from API
  const mockNotifications = useMemo(() => [
    {
      id: 1,
      type: 'order',
      priority: 'high',
      title: 'New Order Received',
      message: 'Order #1234 has been placed by Jón Jónsson for ISK 4,500',
      timestamp: '2025-01-13T14:30:00Z',
      isRead: false,
      isArchived: false,
      actions: ['view', 'process', 'archive'],
      metadata: {
        orderId: 1234,
        customerName: 'Jón Jónsson',
        amount: 4500
      }
    },
    {
      id: 2,
      type: 'system',
      priority: 'medium',
      title: 'Low Stock Alert',
      message: 'Vínflaska - Rauðvín is running low (5 items remaining)',
      timestamp: '2025-01-13T13:15:00Z',
      isRead: true,
      isArchived: false,
      actions: ['view', 'restock', 'archive'],
      metadata: {
        productId: 1,
        productName: 'Vínflaska - Rauðvín',
        stockLevel: 5
      }
    },
    {
      id: 3,
      type: 'payment',
      priority: 'high',
      title: 'Payment Failed',
      message: 'Payment for Order #1231 failed. Customer needs to update payment method.',
      timestamp: '2025-01-13T12:45:00Z',
      isRead: false,
      isArchived: false,
      actions: ['view', 'contact', 'archive'],
      metadata: {
        orderId: 1231,
        customerName: 'Anna Pétursdóttir',
        paymentMethod: 'Credit Card'
      }
    },
    {
      id: 4,
      type: 'delivery',
      priority: 'medium',
      title: 'Delivery Completed',
      message: 'Order #1228 has been successfully delivered to Magnús Guðmundsson',
      timestamp: '2025-01-13T11:20:00Z',
      isRead: true,
      isArchived: false,
      actions: ['view', 'archive'],
      metadata: {
        orderId: 1228,
        customerName: 'Magnús Guðmundsson',
        deliveryTime: '11:20'
      }
    },
    {
      id: 5,
      type: 'security',
      priority: 'high',
      title: 'Suspicious Login Attempt',
      message: 'Multiple failed login attempts detected for admin account',
      timestamp: '2025-01-13T10:30:00Z',
      isRead: false,
      isArchived: false,
      actions: ['view', 'investigate', 'archive'],
      metadata: {
        ipAddress: '192.168.1.100',
        attempts: 5,
        account: 'admin'
      }
    },
    {
      id: 6,
      type: 'marketing',
      priority: 'low',
      title: 'New Customer Registration',
      message: 'Sigrún Ólafsdóttir has registered for a new account',
      timestamp: '2025-01-13T09:15:00Z',
      isRead: true,
      isArchived: true,
      actions: ['view', 'archive'],
      metadata: {
        customerId: 456,
        customerName: 'Sigrún Ólafsdóttir',
        registrationDate: '2025-01-13'
      }
    },
    {
      id: 7,
      type: 'system',
      priority: 'medium',
      title: 'Server Maintenance Scheduled',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      timestamp: '2025-01-13T08:00:00Z',
      isRead: true,
      isArchived: false,
      actions: ['view', 'archive'],
      metadata: {
        startTime: '2025-01-14T02:00:00Z',
        endTime: '2025-01-14T04:00:00Z',
        type: 'scheduled'
      }
    },
    {
      id: 8,
      type: 'order',
      priority: 'medium',
      title: 'Order Cancelled',
      message: 'Order #1225 has been cancelled by Einar Björnsson',
      timestamp: '2025-01-12T16:45:00Z',
      isRead: true,
      isArchived: false,
      actions: ['view', 'refund', 'archive'],
      metadata: {
        orderId: 1225,
        customerName: 'Einar Björnsson',
        reason: 'Customer requested'
      }
    }
  ], []);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, [mockNotifications]);

  useEffect(() => {
    // Filter notifications based on search and filters
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      if (statusFilter === 'unread') {
        filtered = filtered.filter(notification => !notification.isRead);
      } else if (statusFilter === 'read') {
        filtered = filtered.filter(notification => notification.isRead);
      } else if (statusFilter === 'archived') {
        filtered = filtered.filter(notification => notification.isArchived);
      }
    }

    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  const getNotificationIcon = (type, priority) => {
    const iconClass = `h-5 w-5 ${
      priority === 'high' ? 'text-red-500' :
      priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
    }`;

    switch (type) {
      case 'order':
        return <ShoppingCart className={iconClass} />;
      case 'payment':
        return <CreditCard className={iconClass} />;
      case 'delivery':
        return <Package className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      case 'security':
        return <AlertTriangle className={iconClass} />;
      case 'marketing':
        return <Mail className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('is-IS');
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    toast.success(t('adminNotifications.notificationMarkedRead'));
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: false }
          : notification
      )
    );
    toast.success(t('adminNotifications.notificationMarkedUnread'));
  };

  const handleArchive = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isArchived: true }
          : notification
      )
    );
    toast.success(t('adminNotifications.notificationArchived'));
  };

  const handleUnarchive = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isArchived: false }
          : notification
      )
    );
    toast.success(t('adminNotifications.notificationUnarchived'));
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    toast.success(t('adminNotifications.notificationDeleted'));
  };

  const handleBulkAction = (action) => {
    if (selectedNotifications.length === 0) {
      toast.error(t('adminNotifications.selectNotificationsFirst'));
      return;
    }

    switch (action) {
      case 'mark-read':
        setNotifications(prev =>
          prev.map(notification =>
            selectedNotifications.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
        );
        toast.success(t('adminNotifications.bulkMarkedRead', { count: selectedNotifications.length }));
        break;
      case 'mark-unread':
        setNotifications(prev =>
          prev.map(notification =>
            selectedNotifications.includes(notification.id)
              ? { ...notification, isRead: false }
              : notification
          )
        );
        toast.success(t('adminNotifications.bulkMarkedUnread', { count: selectedNotifications.length }));
        break;
      case 'archive':
        setNotifications(prev =>
          prev.map(notification =>
            selectedNotifications.includes(notification.id)
              ? { ...notification, isArchived: true }
              : notification
          )
        );
        toast.success(t('adminNotifications.bulkArchived', { count: selectedNotifications.length }));
        break;
      case 'delete':
        setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification.id)));
        toast.success(t('adminNotifications.bulkDeleted', { count: selectedNotifications.length }));
        break;
    }
    setSelectedNotifications([]);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const archivedCount = notifications.filter(n => n.isArchived).length;

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('admin.accessDenied')}</h1>
            <p className="text-gray-700">{t('admin.accessDeniedMessage')}</p>
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminNotifications.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('adminNotifications.unreadCount', { count: unreadCount })} • {t('adminNotifications.archivedCount', { count: archivedCount })} • {t('adminNotifications.totalCount', { count: notifications.length })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('adminNotifications.settings')}
              </button>
              <button
                onClick={() => handleBulkAction('mark-read')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('adminNotifications.markAllRead')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('adminNotifications.searchNotifications')}
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
              <option value="">{t('adminNotifications.allStatus')}</option>
              <option value="unread">{t('adminNotifications.unread')}</option>
              <option value="read">{t('adminNotifications.read')}</option>
              <option value="archived">{t('adminNotifications.archived')}</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input w-full"
            >
              <option value="">{t('adminNotifications.allTypes')}</option>
              <option value="order">{t('adminNotifications.orders')}</option>
              <option value="payment">{t('adminNotifications.payments')}</option>
              <option value="delivery">{t('adminNotifications.delivery')}</option>
              <option value="system">{t('adminNotifications.system')}</option>
              <option value="security">{t('adminNotifications.security')}</option>
              <option value="marketing">{t('adminNotifications.marketing')}</option>
            </select>

            {/* Bulk Actions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{t('adminNotifications.selectAll')}</span>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">{t('adminNotifications.selected', { count: selectedNotifications.length })}</span>
              <button
                onClick={() => handleBulkAction('mark-read')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {t('adminNotifications.markRead')}
              </button>
              <button
                onClick={() => handleBulkAction('mark-unread')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                {t('adminNotifications.markUnread')}
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Archive className="h-4 w-4 mr-1" />
                {t('adminNotifications.archive')}
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-red-50 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('adminNotifications.delete')}
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'ring-2 ring-blue-100 dark:ring-blue-900/20' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                      className="mt-1 rounded"
                    />
                    
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                          notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                          'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                        }`}>
                          {notification.priority}
                        </span>
                        {notification.isArchived && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            Archived
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-1" />
                          {notification.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead ? (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title={t('tooltips.markAsRead')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notification.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title={t('tooltips.markAsUnread')}
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}
                    
                    {!notification.isArchived ? (
                      <button
                        onClick={() => handleArchive(notification.id)}
                        className="p-2 text-gray-400 hover:text-yellow-600"
                        title={t('tooltips.archive')}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnarchive(notification.id)}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title={t('tooltips.unarchive')}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title={t('tooltips.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('notifications.noNotifications')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your search criteria or filters.'
                : 'You\'re all caught up! No new notifications.'}
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('notifications.settings')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('notifications.deliveryMethods')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <Mail className="h-4 w-4 mr-2" />
                    {t('notifications.emailNotifications')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, push: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <Bell className="h-4 w-4 mr-2" />
                    {t('notifications.pushNotifications')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sms}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <Phone className="h-4 w-4 mr-2" />
                    {t('notifications.smsNotifications')}
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('notifications.types')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, orderUpdates: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('notifications.orderUpdates')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <Settings className="h-4 w-4 mr-2" />
                    {t('notifications.systemAlerts')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketing}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <Mail className="h-4 w-4 mr-2" />
                    {t('notifications.marketing')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.securityAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                      className="rounded mr-3"
                    />
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('notifications.securityAlerts')}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Notification settings saved!');
                  setShowSettings(false);
                }}
                className="btn btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Notifications;
