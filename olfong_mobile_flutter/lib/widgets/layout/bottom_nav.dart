import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class BottomNav extends StatelessWidget {
  final String currentRoute;

  const BottomNav({
    Key? key,
    required this.currentRoute,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final cartProvider = Provider.of<CartProvider>(context);
    final isAuthenticated = authProvider.isAuthenticated;

    final cartItemCount = cartProvider.itemCount;

    // Define navigation items
    final navItems = <Map<String, dynamic>>[
      {
        'route': '/',
        'icon': Icons.home_outlined,
        'activeIcon': Icons.home,
        'label': l10n.navigationHome,
      },
      {
        'route': '/products',
        'icon': Icons.inventory_2_outlined,
        'activeIcon': Icons.inventory_2,
        'label': l10n.navigationProducts,
      },
      if (isAuthenticated)
        {
          'route': '/cart',
          'icon': Icons.shopping_cart_outlined,
          'activeIcon': Icons.shopping_cart,
          'label': l10n.navigationCart,
          'badge': cartItemCount > 0 ? cartItemCount : null,
        },
      {
        'route': isAuthenticated ? '/profile' : '/login',
        'icon': Icons.person_outline,
        'activeIcon': Icons.person,
        'label': isAuthenticated ? l10n.navigationProfile : l10n.navigationLogin,
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: navItems.map((item) {
              final isActive = _isRouteActive(item['route'] as String);

              return Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => context.go(item['route'] as String),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Icon(
                              isActive
                                ? item['activeIcon'] as IconData
                                : item['icon'] as IconData,
                              color: isActive
                                  ? AppTheme.primary600
                                  : AppTheme.gray600,
                              size: 24,
                            ),
                            if (item['badge'] != null)
                              Positioned(
                                right: -8,
                                top: -8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary600,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 20,
                                    minHeight: 20,
                                  ),
                                  child: Text(
                                    '${item['badge']}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['label'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                            color: isActive
                                ? AppTheme.primary600
                                : AppTheme.gray600,
                            height: 1.2,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  bool _isRouteActive(String route) {
    if (route == '/') {
      return currentRoute == '/';
    }
    if (route == '/products') {
      return currentRoute == '/products' || currentRoute.startsWith('/products/');
    }
    return currentRoute == route;
  }
}
