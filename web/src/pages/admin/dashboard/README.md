# Admin Dashboard Components

This folder contains the refactored admin dashboard components, organized for better maintainability and reusability.

## Component Structure

```
dashboard/
├── Dashboard.jsx              # Main dashboard component
├── DashboardHeader.jsx        # Header with welcome message and quick actions
├── StatsGrid.jsx             # Grid of statistics cards
├── StatCard.jsx              # Individual statistics card component
├── RecentOrdersTable.jsx     # Table showing recent orders
├── OrderStatusChart.jsx      # Chart showing order status distribution
├── TopProductsList.jsx       # List of top-selling products
├── LoadingState.jsx          # Loading state component
├── ErrorState.jsx            # Error state component
├── utils.js                  # Utility functions
├── index.js                  # Component exports
└── README.md                 # This documentation
```

## Components

### Dashboard.jsx
Main dashboard component that orchestrates all sub-components. Handles data fetching and state management.

**Props:** None (uses Redux state)

### DashboardHeader.jsx
Header section with welcome message and quick action buttons.

**Props:**
- `user` (object): User information with `fullName` and `username`

### StatsGrid.jsx
Grid layout for displaying statistics cards.

**Props:**
- `stats` (object): Statistics data object
- `formatCurrency` (function): Currency formatting function

### StatCard.jsx
Individual statistics card component.

**Props:**
- `title` (string): Card title
- `value` (string|number): Card value
- `growth` (number): Growth percentage
- `icon` (element): Lucide React icon component
- `color` (string): Color theme (optional, defaults to 'blue')

### RecentOrdersTable.jsx
Table component for displaying recent orders.

**Props:**
- `recentOrders` (array): Array of order objects
- `formatCurrency` (function): Currency formatting function
- `formatDate` (function): Date formatting function

### OrderStatusChart.jsx
Chart component showing order status distribution.

**Props:**
- `orderStatusCounts` (object): Object with status counts

### TopProductsList.jsx
List component for top-selling products.

**Props:**
- `topProducts` (array): Array of product objects

### LoadingState.jsx
Loading state component with spinner.

**Props:** None

### ErrorState.jsx
Error state component with retry functionality.

**Props:**
- `error` (string): Error message
- `onRetry` (function): Retry callback function

## Utility Functions (utils.js)

- `formatCurrency(amount)`: Formats numbers as Icelandic Krona
- `formatDate(dateString)`: Formats dates in Icelandic locale
- `getStatusColor(status)`: Returns Tailwind CSS classes for status colors
- `getStatusIcon(status)`: Returns icon name for status

## Usage

```jsx
import Dashboard from './pages/admin/dashboard';

// Or import individual components
import { 
  DashboardHeader, 
  StatsGrid, 
  StatCard 
} from './pages/admin/dashboard';
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to locate and modify specific functionality
4. **Testability**: Individual components can be tested in isolation
5. **Type Safety**: PropTypes validation for all components
6. **Organization**: Clear folder structure with related components grouped together

## Future Enhancements

- Convert to TypeScript for better type safety
- Add unit tests for each component
- Implement lazy loading for better performance
- Add storybook stories for component documentation
- Consider using React.memo for performance optimization