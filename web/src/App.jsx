import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminSidebarProvider } from './contexts/AdminSidebarContext';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';
import { updateOrderStatusRealtime } from './store/slices/orderSlice';
import socketService from './services/socket';
import { StatusBar, Style } from '@capacitor/status-bar';
import AdminSidebarWidget from './components/admin/AdminSidebarWidget';
import { useReceiptCSS } from './hooks/useReceiptCSS';

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

import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import POSOrders from './pages/admin/POSOrders';
import Analytics from './pages/admin/Analytics';
import Customers from './pages/admin/Customers';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';
import SettingsOverview from './pages/admin/SettingsOverview';
import GeneralSettings from './pages/admin/settings/GeneralSettings';
import BusinessSettings from './pages/admin/settings/BusinessSettings';
import ShippingSettings from './pages/admin/settings/ShippingSettings';
import VatSettings from './pages/admin/settings/VatSettings';
import ApiKeysSettings from './pages/admin/settings/ApiKeysSettings';
import PaymentGatewaysSettings from './pages/admin/settings/PaymentGatewaysSettings';
import ReceiptSettings from './pages/admin/settings/ReceiptSettings';
import SMTPSettings from './pages/admin/settings/SMTPSettings';
import AdminBanners from './pages/admin/Banners';
import AdminChat from './pages/admin/Chat';
import DemoData from './pages/admin/DemoData';
import Translations from './pages/admin/Translations';
import Media from './pages/admin/Media';
import MediaUpload from './pages/admin/MediaUpload';
import Discounts from './pages/admin/Discounts';
import DeliveryDashboard from './pages/delivery/Dashboard';

function App() {

  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  // Load receipt CSS globally
  useReceiptCSS();

  // Check if we're on an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');

  // Initialize app
  useEffect(() => {
    // Set document title based on language
    const updateTitle = () => {
      document.title = 'Ölföng - Vín og Bjórverslun';
    };

    updateTitle();

    // Configure status bar for mobile apps
    const updateStatusBar = () => {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        const isDark = document.documentElement.classList.contains('dark');

        // Style.Dark = white text (for dark backgrounds)
        // Style.Light = dark text (for light backgrounds)
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(err => {
          console.warn('Status bar styling not available:', err);
        });
        StatusBar.setBackgroundColor({ color: isDark ? '#1f2937' : '#ffffff' }).catch(err => {
          console.warn('Status bar background color not available:', err);
        });
      }
    };

    // Initial status bar setup
    updateStatusBar();

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateStatusBar();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    // Scroll to top with requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [location.pathname]);

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
      try {
        socketService.connect();

        // Join appropriate rooms based on user role
        if (user.role === 'ADMIN') {
          socketService.joinAdminRoom();
        } else if (user.role === 'DELIVERY') {
          socketService.joinDeliveryRoom(user.id);
        }
      } catch (error) {
        console.warn('Socket connection failed, continuing without real-time features:', error);
      }
    }

    return () => {
      if (socketService.isSocketConnected()) {
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
    <LanguageProvider>
      <AdminSidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />

          <main className="flex-1 pt-16-safe">
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
              <Route path="/orders" element={<Navigate to="/profile" replace />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/discounts" element={<Discounts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/pos" element={<POSOrders />} />
              <Route path="/admin/customers" element={<Customers />} />
              <Route path="/admin/chat" element={<AdminChat />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/media" element={<Media />} />
              <Route path="/admin/media/upload" element={<MediaUpload />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/demo-data" element={<DemoData />} />
              <Route path="/admin/translations" element={<Translations />} />
              <Route path="/admin/settings" element={<SettingsOverview />} />
              <Route path="/admin/settings/general" element={<GeneralSettings />} />
              <Route path="/admin/settings/business" element={<BusinessSettings />} />
              <Route path="/admin/settings/shipping" element={<ShippingSettings />} />
              <Route path="/admin/settings/vat" element={<VatSettings />} />
              <Route path="/admin/settings/api-keys" element={<ApiKeysSettings />} />
              <Route path="/admin/settings/payment-gateways" element={<PaymentGatewaysSettings />} />
              <Route path="/admin/settings/receipts" element={<ReceiptSettings />} />
              <Route path="/admin/settings/smtp" element={<SMTPSettings />} />
            </Route>

            {/* Delivery routes - accessible by both ADMIN and DELIVERY roles */}
            <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'DELIVERY']} />}>
              <Route path="/delivery" element={<DeliveryDashboard />} />
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

        {/* Admin Sidebar Widget - Available globally for admin users */}
        <AdminSidebarWidget />
      </div>
      </AdminSidebarProvider>
    </LanguageProvider>
  );

}

export default App;
