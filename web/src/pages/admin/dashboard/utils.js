import { Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';

// Utility functions for the dashboard
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: 'ISK'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('is-IS');
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    out_for_delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    confirmed: CheckCircle,
    preparing: Package,
    out_for_delivery: Package,
    delivered: CheckCircle,
    cancelled: AlertCircle
  };
  return icons[status] || Clock;
};

export const getStatusLabel = (status, t) => {
  const statusMap = {
    pending: t('orders.statuses.PENDING') || 'Pending',
    confirmed: t('orders.statuses.CONFIRMED') || 'Confirmed',
    preparing: t('orders.statuses.PREPARING') || 'Preparing',
    out_for_delivery: t('orders.statuses.OUT_FOR_DELIVERY') || 'Out for Delivery',
    delivered: t('orders.statuses.DELIVERED') || 'Delivered',
    cancelled: t('orders.statuses.CANCELLED') || 'Cancelled'
  };
  return statusMap[status] || status;
};