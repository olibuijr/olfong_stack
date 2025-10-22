import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../../../store/slices/dashboardSlice';
import AdminLayout from '../../../components/admin/AdminLayout';
import DashboardHeader from './DashboardHeader';
import StatsGrid from './StatsGrid';
import RecentOrdersTable from './RecentOrdersTable';
import OrderStatusChart from './OrderStatusChart';
import TopProductsList from './TopProductsList';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { formatCurrency, formatDate } from './utils';

const Dashboard = () => {
  const dispatch = useDispatch();
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
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => dispatch(fetchDashboardStats())} />;
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <DashboardHeader user={user} />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6">
            <StatsGrid
              stats={stats}
              formatCurrency={formatCurrency}
            />

            <RecentOrdersTable
              recentOrders={recentOrders}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <OrderStatusChart orderStatusCounts={orderStatusCounts} />
              <TopProductsList topProducts={topProducts} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;