import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  RefreshCw,
  FileText,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle,
  Eye,
  AlertCircle
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
import { Line } from 'react-chartjs-2';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLanguage } from "../../contexts/LanguageContext";
import {
  fetchReports,
  setCurrentReport,
  setTimeRange,
  setDateRange
} from '../../store/slices/reportsSlice';

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

const Reports = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    sales,
    products,
    customers,
    orders,
    currentReport,
    timeRange,
    dateRange,
    isLoading
  } = useSelector((state) => state.reports);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      // Fetch all reports data
      dispatch(fetchReports({ 
        reportType: currentReport, 
        timeRange, 
        startDate: dateRange.start, 
        endDate: dateRange.end 
      }));
    }
  }, [dispatch, user, currentReport, timeRange, dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('is-IS', {
      style: 'currency',
      currency: 'ISK'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('is-IS');
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const exportReport = (format) => {
    // In real app, this would generate and download the report
    console.log(`Exporting ${currentReport} report as ${format}`);
    // Simulate download
    const reportData = { sales, products, customers, orders }[currentReport];
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, growth, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {getGrowthIcon(growth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(growth)}`}>
                {growth >= 0 ? '+' : ''}{growth}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{t('adminReports.vsPreviousPeriod')}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );

  const SalesReport = () => (
    <div className="space-y-8">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('adminReports.totalRevenue')}
          value={formatCurrency(sales.totalRevenue || 0)}
          icon={DollarSign}
          growth={sales.growthRate}
          color="green"
        />
        <StatCard
          title={t('adminReports.totalOrders')}
          value={(sales.totalOrders || 0).toLocaleString()}
          icon={ShoppingCart}
          growth={8.3}
          color="blue"
        />
        <StatCard
          title={t('adminReports.averageOrderValue')}
          value={formatCurrency(sales.averageOrderValue || 0)}
          icon={TrendingUp}
          growth={5.2}
          color="purple"
        />
        <StatCard
          title={t('adminReports.growthRate')}
          value={`${sales.growthRate || 0}%`}
          icon={BarChart3}
          growth={sales.growthRate}
          color="indigo"
        />
      </div>

       {/* Daily Sales Chart */}
       <ChartCard
         title={t('adminReports.dailySalesTrend')}
         actions={
           <div className="flex items-center space-x-2">
             <button className="p-2 text-gray-400 hover:text-gray-600">
               <Eye className="h-4 w-4" />
             </button>
             <button className="p-2 text-gray-400 hover:text-gray-600">
               <Download className="h-4 w-4" />
             </button>
           </div>
         }
       >
         {sales.dailySales && sales.dailySales.length > 0 ? (
           <div className="h-80">
             <Line
               data={{
                 labels: sales.dailySales.map(day => {
                   const date = new Date(day.date);
                   return date.toLocaleDateString('is-IS', { month: 'short', day: 'numeric' });
                 }),
                 datasets: [{
                   label: t('adminReports.revenue'),
                   data: sales.dailySales.map(day => parseFloat(day.revenue) || 0),
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
           <div className="h-80 flex items-center justify-center text-gray-500">
             {t('adminReports.noData')}
           </div>
         )}
       </ChartCard>
    </div>
  );

  const ProductsReport = () => (
    <div className="space-y-8">
      {/* Product Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('adminReports.totalProducts')}
          value={products.totalProducts}
          icon={Package}
          growth={15.2}
          color="blue"
        />
        <StatCard
          title={t('adminReports.activeProducts')}
          value={products.activeProducts}
          subtitle={`${Math.round((products.activeProducts / products.totalProducts) * 100)}% ${t('adminReports.ofTotal')}`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title={t('adminReports.outOfStock')}
          value={products.outOfStock}
          subtitle={`${Math.round((products.outOfStock / products.totalProducts) * 100)}% ${t('adminReports.ofTotal')}`}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Top Selling Products */}
      <ChartCard title={t('adminReports.topSellingProducts')}>
        <div className="space-y-4">
          {products.topSelling.length > 0 ? (
            products.topSelling.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                  <div className="flex items-center">
                    {getGrowthIcon(product.growth)}
                    <span className={`text-xs ml-1 ${getGrowthColor(product.growth)}`}>
                      +{product.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>

      {/* Category Breakdown */}
      <ChartCard title={t('adminReports.revenueByCategory')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.categoryBreakdown.length > 0 ? (
            products.categoryBreakdown.map((category) => (
              <div key={category.category} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">{category.category}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">{category.count}</p>
                <p className="text-xs text-gray-500">{t('adminReports.products')}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">{formatCurrency(category.revenue)}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );

  const CustomersReport = () => (
    <div className="space-y-8">
      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('adminReports.totalCustomers')}
          value={customers.totalCustomers}
          icon={Users}
          growth={6.7}
          color="blue"
        />
        <StatCard
          title={t('adminReports.newCustomers')}
          value={customers.newCustomers}
          subtitle={t('adminReports.thisPeriod')}
          icon={TrendingUp}
          growth={12.3}
          color="green"
        />
        <StatCard
          title={t('adminReports.avgOrderFrequency')}
          value={customers.averageOrderFrequency}
          subtitle={t('adminReports.ordersPerCustomer')}
          icon={ShoppingCart}
          growth={-2.1}
          color="purple"
        />
      </div>

      {/* Customer Segments */}
      <ChartCard title={t('adminReports.customerSegmentation')}>
        <div className="space-y-4">
          {customers.customerSegments.length > 0 ? (
            customers.customerSegments.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12">{segment.count}</span>
                  <span className="text-sm text-gray-500 w-12">{segment.percentage}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>

      {/* Top Customers */}
      <ChartCard title={t('adminReports.topCustomersByRevenue')}>
        <div className="space-y-4">
          {customers.topCustomers.length > 0 ? (
            customers.topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orders} {t('adminReports.orders')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-gray-500">{t('adminReports.last')}: {formatDate(customer.lastOrder)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );

  const OrdersReport = () => (
    <div className="space-y-8">
      {/* Order Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('adminReports.totalOrders')}
          value={orders.totalOrders}
          icon={ShoppingCart}
          growth={8.3}
          color="blue"
        />
        <StatCard
          title={t('adminReports.completedOrders')}
          value={orders.completedOrders}
          subtitle={`${Math.round((orders.completedOrders / orders.totalOrders) * 100)}% ${t('adminReports.completionRate')}`}
          icon={CheckCircle}
          growth={12.1}
          color="green"
        />
        <StatCard
          title={t('adminReports.pendingOrders')}
          value={orders.pendingOrders}
          icon={Clock}
          growth={-15.2}
          color="yellow"
        />
        <StatCard
          title={t('adminReports.avgProcessingTime')}
          value={`${orders.averageProcessingTime} ${t('adminReports.days')}`}
          icon={TrendingUp}
          growth={-5.3}
          color="purple"
        />
      </div>

      {/* Delivery Methods */}
      <ChartCard title={t('adminReports.orderDistributionByDeliveryMethod')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.deliveryMethods.length > 0 ? (
            orders.deliveryMethods.map((method) => (
              <div key={method.method} className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">
                  {method.method === 'HOME_DELIVERY' ? t('adminPage.homeDelivery') : t('ordersPage.pickup')}
                </h4>
                <p className="text-3xl font-bold text-gray-900 mt-2">{method.count}</p>
                <p className="text-sm text-gray-500">{method.percentage}% {t('adminReports.ofTotalOrders')}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>

      {/* Order Status Trend */}
      <ChartCard title={t('adminReports.orderStatusDistribution')}>
        <div className="space-y-4">
          {orders.orderStatusTrend.length > 0 ? (
            orders.orderStatusTrend.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    status.status === 'delivered' ? 'bg-green-500' :
                    status.status === 'shipped' ? 'bg-blue-500' :
                    status.status === 'confirmed' ? 'bg-yellow-500' :
                    status.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{status.status}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        status.status === 'delivered' ? 'bg-green-500' :
                        status.status === 'shipped' ? 'bg-blue-500' :
                        status.status === 'confirmed' ? 'bg-yellow-500' :
                        status.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(status.count / orders.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12">{status.count}</span>
                  <div className="flex items-center ml-2">
                    {status.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : status.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('adminReports.noData')}
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );

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
      <div className="max-w-none">
        {/* Header */}
        <PageHeader
          icon={FileText}
          title={t('adminSidebar.reportsAnalytics')}
          description={t('adminSidebar.comprehensiveInsights')}
          actions={
            <div className="flex items-center space-x-4">
              <button
                onClick={() => exportReport('pdf')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('adminReports.exportPDF')}
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('adminReports.exportCSV')}
              </button>
            </div>
          }
        />

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        {/* Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminReports.reportType')}</label>
              <select
                value={currentReport}
                onChange={(e) => dispatch(setCurrentReport(e.target.value))}
                className="input w-full"
              >
                <option value="sales">{t('adminReports.salesReport')}</option>
                <option value="products">{t('adminReports.productsReport')}</option>
                <option value="customers">{t('adminReports.customersReport')}</option>
                <option value="orders">{t('adminReports.ordersReport')}</option>
              </select>
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminReports.timePeriod')}</label>
              <select
                value={timeRange}
                onChange={(e) => dispatch(setTimeRange(e.target.value))}
                className="input w-full"
              >
                <option value="last7days">{t('adminReports.last7Days')}</option>
                <option value="last30days">{t('adminReports.last30Days')}</option>
                <option value="last90days">{t('adminReports.last90Days')}</option>
                <option value="lastyear">{t('adminReports.lastYear')}</option>
                <option value="custom">{t('adminReports.customRange')}</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminReports.startDate')}</label>
              <input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => dispatch(setDateRange({ ...dateRange, start: e.target.value }))}
                className="input w-full"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminReports.endDate')}</label>
              <input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => dispatch(setDateRange({ ...dateRange, end: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => {
                dispatch(fetchReports({ 
                  reportType: currentReport, 
                  timeRange, 
                  startDate: dateRange.start, 
                  endDate: dateRange.end 
                }));
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
{t('adminReports.refreshData')}
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleString('is-IS')}</span>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-8">
          {currentReport === 'sales' && <SalesReport />}
          {currentReport === 'products' && <ProductsReport />}
          {currentReport === 'customers' && <CustomersReport />}
          {currentReport === 'orders' && <OrdersReport />}
        </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Reports;
