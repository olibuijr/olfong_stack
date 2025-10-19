import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';
import { updateOrderStatusRealtime } from './store/slices/orderSlice';
import socketService from './services/socket';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ChatWidget from './components/chat/ChatWidget';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import Analytics from './pages/admin/Analytics';
import Customers from './pages/admin/Customers';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import AdminBanners from './pages/admin/Banners';
import AdminChat from './pages/admin/Chat';
import DeliveryDashboard from './pages/delivery/Dashboard';

function App() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  
  // Check if we're on an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');

  // Initialize app
  useEffect(() => {
    // Set document title based on language
    const updateTitle = () => {
      document.title = i18n.language === 'is' 
        ? 'Ölföng - Vín og Bjórverslun' 
        : 'Ölföng - Wine & Beer Shop';
    };

    updateTitle();
    i18n.on('languageChanged', updateTitle);

    return () => {
      i18n.off('languageChanged', updateTitle);
    };
  }, [i18n]);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Initialize socket connection for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect();
      
      // Join appropriate rooms based on user role
      if (user.role === 'ADMIN') {
        socketService.joinAdminRoom();
      } else if (user.role === 'DELIVERY') {
        socketService.joinDeliveryRoom(user.id);
      } else {
        socketService.joinUserRoom(user.id);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Handle real-time order updates
  useEffect(() => {
    if (isAuthenticated) {
      const handleOrderStatusUpdate = (data) => {
        // Dispatch to order slice for real-time updates
        dispatch(updateOrderStatusRealtime(data));
      };

      socketService.onOrderStatusUpdate(handleOrderStatusUpdate);

      return () => {
        socketService.removeListener('order-status-update', handleOrderStatusUpdate);
      };
    }
  }, [isAuthenticated, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Navigate to="/profile" replace />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          
          {/* Delivery routes */}
          <Route element={<ProtectedRoute requiredRole="DELIVERY" />}>
            <Route path="/delivery" element={<DeliveryDashboard />} />
            <Route path="/admin/chat" element={<AdminChat />} />
          </Route>
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Bottom Navigation for Mobile */}
      {!isAdminRoute && <BottomNav />}

      {/* Chat Widget - Available on all pages */}
      <ChatWidget />
    </div>
  );
}

export default App;
