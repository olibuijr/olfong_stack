import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from "../../contexts/LanguageContext";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAnalytics, fetchRevenueTrend } from '../../store/slices/analyticsSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    metrics,
    orderStatusDistribution,
    topProducts,
    revenueTrend,
    isLoading
  } = useSelector((state) => state.analytics);
  
  const [timeRange, setTimeRange] = useState('30d');


  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchAnalytics(timeRange));
      dispatch(fetchRevenueTrend(timeRange));
    }
  }, [dispatch, user, timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    dispatch(fetchAnalytics(newTimeRange));
    dispatch(fetchRevenueTrend(newTimeRange));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('is-IS', {
      style: 'currency',
      currency: 'ISK'
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const MetricCard = ({ title, value, growth, icon: Icon, color = 'blue' }) => {
    const GrowthIcon = getGrowthIcon(growth);
    const growthColor = getGrowthColor(growth);
    
    return (
      <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <div className="flex items-center mt-2">
              <GrowthIcon className={`h-4 w-4 mr-1 ${growthColor}`} />
              <span className={`text-sm font-medium ${growthColor}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{t('adminAnalytics', 'vsPreviousPeriod')}</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </div>
    );
  };

  const timeRanges = [
    { value: '7d', label: t('adminAnalytics', 'last7Days') },
    { value: '30d', label: t('adminAnalytics', 'last30Days') },
    { value: '90d', label: t('adminAnalytics', 'last90Days') },
    { value: '1y', label: t('adminAnalytics', 'lastYear') }
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminPage', 'accessDenied')}</h1>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('adminPage', 'accessDenied')}
              </h2>
              <p className="text-gray-600">
                {t('adminPage', 'noPermission')}
              </p>
            </div>
          </div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminAnalytics', 'analyticsDashboard')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminAnalytics', 'businessInsights')}</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  {t('adminAnalytics', 'export')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">{t('adminAnalytics', 'loading')}</span>
            </div>
          ) : (
            <>
              <MetricCard
                title={t('adminAnalytics', 'totalRevenue')}
                value={formatCurrency(metrics.revenue.current)}
                previous={metrics.revenue.previous}
                growth={metrics.revenue.growth}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title={t('adminAnalytics', 'totalOrders')}
                value={metrics.orders.current.toLocaleString()}
                previous={metrics.orders.previous}
                growth={metrics.orders.growth}
                icon={ShoppingCart}
                color="blue"
              />
              <MetricCard
                title={t('adminAnalytics', 'totalCustomers')}
                value={metrics.customers.current.toLocaleString()}
                previous={metrics.customers.previous}
                growth={metrics.customers.growth}
                icon={Users}
                color="purple"
              />
              <MetricCard
                title={t('adminAnalytics', 'totalProducts')}
                value={metrics.products.current}
                previous={metrics.products.previous}
                growth={metrics.products.growth}
                icon={Package}
                color="indigo"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminAnalytics', 'revenueTrend')}</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : revenueTrend?.dailyRevenue && revenueTrend.dailyRevenue.length > 0 ? (
                <div className="h-80">
                  <Line
                    data={{
                      labels: revenueTrend.dailyRevenue.map(item => {
                        const date = new Date(item.date);
                        return date.toLocaleDateString('is-IS', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [{
                        label: t('adminAnalytics', 'revenue'),
                        data: revenueTrend.dailyRevenue.map(item => parseFloat(item.revenue) || 0),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => formatCurrency(context.parsed.y)
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value)
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t('adminAnalytics', 'noRevenueData')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminAnalytics', 'orderStatusDistribution')}</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{t('adminAnalytics', 'loading')}</span>
                </div>
              ) : orderStatusDistribution && orderStatusDistribution.length > 0 ? (
                <div className="h-80">
                  <Bar
                    data={{
                      labels: orderStatusDistribution.map(status => {
                        const statusLabels = {
                          'DELIVERED': t('adminAnalytics', 'delivered'),
                          'SHIPPED': t('adminAnalytics', 'shipped'),
                          'PROCESSING': t('adminAnalytics', 'processing'),
                          'PENDING': t('adminAnalytics', 'pending'),
                          'CANCELLED': t('adminAnalytics', 'cancelled')
                        };
                        return statusLabels[status.status] || status.status;
                      }),
                      datasets: [{
                        label: t('adminAnalytics', 'orders'),
                        data: orderStatusDistribution.map(status => status.count || 0),
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)', // green for delivered
                          'rgba(59, 130, 246, 0.8)', // blue for shipped
                          'rgba(245, 158, 11, 0.8)', // yellow for processing
                          'rgba(156, 163, 175, 0.8)', // gray for pending
                          'rgba(239, 68, 68, 0.8)', // red for cancelled
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(59, 130, 246)',
                          'rgb(245, 158, 11)',
                          'rgb(156, 163, 175)',
                          'rgb(239, 68, 68)',
                        ],
                        borderWidth: 1,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.parsed.y} ${t('adminAnalytics', 'orders').toLowerCase()}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {t('adminAnalytics', 'noData')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('adminAnalytics', 'topPerformingProducts')}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('adminAnalytics', 'product')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('adminAnalytics', 'category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('adminAnalytics', 'sales')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('adminAnalytics', 'revenue')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('adminAnalytics', 'growth')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('adminAnalytics', 'loading')}</span>
                          </div>
                        </td>
                      </tr>
                    ) : topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <tr key={product.productId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {product.product?.name || t('adminAnalytics', 'unknownProduct')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.product?.category?.name || t('adminAnalytics', 'unknownCategory')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product._sum?.quantity || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(product._sum?.price || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {t('adminAnalytics', 'topPerformer')}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('adminAnalytics', 'noProducts')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
