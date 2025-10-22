import {
  ShoppingCart,
  Package,
  Users,
  DollarSign
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useLanguage } from "../../../contexts/LanguageContext";
import StatCard from './StatCard';

const StatsGrid = ({ stats, formatCurrency }) => {
  const { t } = useLanguage();

  const statCards = [
    {
      title: t('adminDashboard', 'totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: t('adminDashboard', 'totalOrders'),
      value: stats.totalOrders.toLocaleString(),
      growth: stats.orderGrowth,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: t('adminDashboard', 'totalProducts'),
      value: stats.totalProducts,
      growth: stats.productGrowth,
      icon: Package,
      color: 'purple'
    },
    {
      title: t('adminDashboard', 'totalCustomers'),
      value: stats.totalCustomers,
      growth: stats.customerGrowth,
      icon: Users,
      color: 'indigo'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          growth={stat.growth}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

StatsGrid.propTypes = {
  stats: PropTypes.shape({
    totalRevenue: PropTypes.number.isRequired,
    revenueGrowth: PropTypes.number.isRequired,
    totalOrders: PropTypes.number.isRequired,
    orderGrowth: PropTypes.number.isRequired,
    totalProducts: PropTypes.number.isRequired,
    productGrowth: PropTypes.number.isRequired,
    totalCustomers: PropTypes.number.isRequired,
    customerGrowth: PropTypes.number.isRequired
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired
};

export default StatsGrid;