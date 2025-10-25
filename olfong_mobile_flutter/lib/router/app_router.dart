import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/admin_login_screen.dart';
import '../screens/auth/auth_callback_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/products/products_screen.dart';
import '../screens/products/product_detail_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/chat/conversation_list_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/checkout/checkout_screen.dart';
import '../screens/checkout/order_confirmation_screen.dart';
import '../screens/admin/admin_dashboard.dart';
import '../screens/admin/admin_products.dart';
import '../screens/admin/admin_orders.dart';
import '../screens/delivery/delivery_dashboard.dart';
import '../widgets/layout/bottom_nav.dart';

class AppRouter {
  // Route names
  static const String login = 'login';
  static const String register = 'register';
  static const String home = 'home';
  static const String products = 'products';
  static const String productDetail = 'product-detail';
  static const String cart = 'cart';
  static const String profile = 'profile';
  static const String chat = 'chat';
  static const String chatDetail = 'chat-detail';
  static const String checkout = 'checkout';
  static const String orderConfirmation = 'order-confirmation';

  static final GoRouter router = GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      // Protected routes that require authentication
      final protectedRoutes = ['/profile', '/checkout', '/order-confirmation'];
      final isProtectedRoute = protectedRoutes.any((route) => 
          state.matchedLocation.startsWith(route));
      
      // Admin routes that require admin role
      final adminRoutes = ['/admin'];
      final isAdminRoute = adminRoutes.any((route) => 
          state.matchedLocation.startsWith(route));
      
      // Delivery routes that require delivery role
      final deliveryRoutes = ['/delivery'];
      final isDeliveryRoute = deliveryRoutes.any((route) => 
          state.matchedLocation.startsWith(route));
      
      // If user is not authenticated and trying to access protected routes
      if (!authProvider.isAuthenticated && (isProtectedRoute || isAdminRoute || isDeliveryRoute)) {
        return '/login';
      }
      
      // If user is authenticated but doesn't have admin role for admin routes
      if (authProvider.isAuthenticated && isAdminRoute && !authProvider.user!.isAdmin) {
        return '/';
      }
      
      // If user is authenticated but doesn't have delivery role for delivery routes
      if (authProvider.isAuthenticated && isDeliveryRoute && !authProvider.user!.isDelivery) {
        return '/';
      }
      
      // If user is authenticated and trying to access auth routes
      if (authProvider.isAuthenticated && 
          (state.matchedLocation == '/login' || state.matchedLocation == '/register')) {
        return '/';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/admin-login',
        name: 'admin-login',
        builder: (context, state) => const AdminLoginScreen(),
      ),
      GoRoute(
        path: '/auth/callback',
        name: 'auth-callback',
        builder: (context, state) => const AuthCallbackScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigationWrapper(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/products',
            name: 'products',
            builder: (context, state) => const ProductsScreen(),
          ),
          GoRoute(
            path: '/product/:id',
            name: 'product-detail',
            builder: (context, state) {
              final productId = state.pathParameters['id']!;
              return ProductDetailScreen(productId: productId);
            },
          ),
          GoRoute(
            path: '/cart',
            name: 'cart',
            builder: (context, state) => const CartScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (context, state) => const ConversationListScreen(),
          ),
          GoRoute(
            path: '/chat/:conversationId',
            name: 'chat-detail',
            builder: (context, state) {
              final conversationId = state.pathParameters['conversationId']!;
              // Note: We'll need to pass the conversation object here
              // For now, we'll create a placeholder conversation
              return const ConversationListScreen(); // TODO: Implement proper chat screen
            },
          ),
          GoRoute(
            path: '/checkout',
            name: 'checkout',
            builder: (context, state) => const CheckoutScreen(),
          ),
          GoRoute(
            path: '/order-confirmation',
            name: 'order-confirmation',
            builder: (context, state) {
              final order = state.extra as dynamic;
              return OrderConfirmationScreen(order: order);
            },
          ),
          // Admin routes
          GoRoute(
            path: '/admin',
            name: 'admin',
            builder: (context, state) => const AdminDashboard(),
          ),
          GoRoute(
            path: '/admin/products',
            name: 'admin-products',
            builder: (context, state) => const AdminProducts(),
          ),
          GoRoute(
            path: '/admin/orders',
            name: 'admin-orders',
            builder: (context, state) => const AdminOrders(),
          ),
          // Delivery routes
          GoRoute(
            path: '/delivery',
            name: 'delivery',
            builder: (context, state) => const DeliveryDashboard(),
          ),
        ],
      ),
    ],
  );
}

class MainNavigationWrapper extends StatelessWidget {
  final Widget child;

  const MainNavigationWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;

    // Don't show bottom nav on certain screens
    final hideBottomNav = location.startsWith('/admin') ||
        location.startsWith('/delivery') ||
        location == '/register' ||
        location == '/auth-callback' ||
        location.startsWith('/checkout') ||
        location.startsWith('/order-confirmation');

    return Scaffold(
      body: child,
      bottomNavigationBar: hideBottomNav ? null : BottomNav(currentRoute: location),
    );
  }
}
