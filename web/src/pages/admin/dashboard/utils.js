// Utility functions for the dashboard
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('is-IS').format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('is-IS');
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: 'Clock',
    confirmed: 'CheckCircle',
    shipped: 'Package',
    delivered: 'CheckCircle',
    cancelled: 'AlertCircle'
  };
  return icons[status] || 'Clock';
};