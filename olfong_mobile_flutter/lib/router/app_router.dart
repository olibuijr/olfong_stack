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
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _getCurrentIndex(context),
        onTap: (index) => _onTabTapped(context, index),
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.home_outlined),
            activeIcon: const Icon(Icons.home),
            label: l10n.homeWelcome.split(' ').last, // "Ölföng" or "Wine & Beer Shop"
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.store_outlined),
            activeIcon: const Icon(Icons.store),
            label: l10n.productsTitle,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.shopping_cart_outlined),
            activeIcon: const Icon(Icons.shopping_cart),
            label: l10n.cartTitle,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.person_outline),
            activeIcon: const Icon(Icons.person),
            label: l10n.profileTitle,
          ),
        ],
      ),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    switch (location) {
      case '/':
        return 0;
      case '/products':
        return 1;
      case '/cart':
        return 2;
      case '/profile':
        return 3;
      default:
        return 0;
    }
  }

  void _onTabTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/products');
        break;
      case 2:
        context.go('/cart');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }
}
