// Main Dashboard component
export { default } from './Dashboard';

// Individual components for potential reuse
export { default as DashboardHeader } from './DashboardHeader';
export { default as StatsGrid } from './StatsGrid';
export { default as StatCard } from './StatCard';
export { default as RecentOrdersTable } from './RecentOrdersTable';
export { default as OrderStatusChart } from './OrderStatusChart';
export { default as TopProductsList } from './TopProductsList';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';

// Utility functions
export * from './utils';