import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { 
    stats, 
    recentOrders, 
    topProducts, 
    orderStatusCounts, 
    isLoading, 
    error 
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('is-IS', {
      style: 'currency',
      currency: 'ISK'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('is-IS');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      shipped: Package,
      delivered: CheckCircle,
      cancelled: AlertCircle
    };
    return icons[status] || Clock;
  };

  const StatCard = ({ title, value, growth, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          <div className="flex items-center mt-3">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">+{growth}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{t('adminDashboard.vsLastMonth')}</span>
          </div>
        </div>
        <div className={`p-4 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-8 w-8 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchDashboardStats())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminDashboard.dashboardOverview')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminDashboard.welcomeBack', { name: user?.fullName || user?.username })}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            onClick={() => navigate('/admin/products')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Package className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('adminDashboard.addProduct')}</span>
          </button>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Users className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('adminDashboard.manageUsers')}</span>
          </button>
          <button 
            onClick={() => navigate('/admin/analytics')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <TrendingUp className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('adminDashboard.viewAnalytics')}</span>
          </button>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Filter className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('adminDashboard.reports')}</span>
          </button>
          <button 
            onClick={() => {
              // TODO: Implement export functionality
              alert(t('adminDashboard.export') + ' - Coming soon');
            }}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Download className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t('adminDashboard.export')}</span>
          </button>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex flex-col items-center justify-center p-4 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200 group"
          >
            <Plus className="h-6 w-6 text-white mb-2" />
            <span className="text-xs font-medium text-white text-center">{t('adminDashboard.newOrder')}</span>
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <StatCard
            title={t('adminDashboard.totalRevenue')}
            value={formatCurrency(stats.totalRevenue)}
            growth={stats.revenueGrowth}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title={t('adminDashboard.totalOrders')}
            value={stats.totalOrders.toLocaleString()}
            growth={stats.orderGrowth}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title={t('adminDashboard.totalProducts')}
            value={stats.totalProducts}
            growth={stats.productGrowth}
            icon={Package}
            color="purple"
          />
          <StatCard
            title={t('adminDashboard.totalCustomers')}
            value={stats.totalCustomers}
            growth={stats.customerGrowth}
            icon={Users}
            color="indigo"
          />
        </div>

        {/* Recent Orders - Full Width */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminDashboard.recentOrders')}</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminDashboard.orderId')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminDashboard.customer')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminDashboard.amount')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminDashboard.status')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('adminDashboard.date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.customer}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {t(`orders.statuses.${order.status.toUpperCase()}`)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Status & Top Products - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Order Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminDashboard.orderStatus')}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(orderStatusCounts).map(([status, count]) => {
                  const StatusIcon = getStatusIcon(status);
                  const total = Object.values(orderStatusCounts).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{t(`orders.statuses.${status.toUpperCase()}`)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminDashboard.topProducts')}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.sales} {t('adminDashboard.sales')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;