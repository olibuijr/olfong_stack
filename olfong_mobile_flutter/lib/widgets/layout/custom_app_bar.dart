import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBackButton;
  final bool showCart;
  final List<Widget>? actions;

  const CustomAppBar({
    Key? key,
    this.title,
    this.showBackButton = false,
    this.showCart = true,
    this.actions,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppBar(
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.1),
      backgroundColor: isDark ? const Color(0xFF1F2937) : Colors.white,
      surfaceTintColor: Colors.transparent,
      automaticallyImplyLeading: false,
      flexibleSpace: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1F2937) : Colors.white,
            border: Border(
              bottom: BorderSide(
                color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                width: 1,
              ),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Back button or Logo
              if (showBackButton)
                IconButton(
                  icon: Icon(
                    Icons.arrow_back,
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                  onPressed: () => context.pop(),
                )
              else
                // Logo
                GestureDetector(
                  onTap: () => context.go('/'),
                  child: Row(
                    children: [
                      Icon(
                        Icons.wine_bar,
                        color: AppTheme.primary600,
                        size: 28,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Ölföng',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).textTheme.bodyLarge?.color,
                        ),
                      ),
                    ],
                  ),
                ),

              const Spacer(),

              // Title (if provided)
              if (title != null)
                Expanded(
                  child: Text(
                    title!,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),

              // Actions or Cart
              if (actions != null)
                ...actions!
              else if (showCart)
                Consumer<CartProvider>(
                  builder: (context, cartProvider, child) {
                    return Stack(
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.shopping_cart_outlined,
                            color: Theme.of(context).textTheme.bodyLarge?.color,
                          ),
                          onPressed: () => context.go('/cart'),
                          tooltip: l10n.cartTitle,
                        ),
                        if (cartProvider.itemCount > 0)
                          Positioned(
                            right: 8,
                            top: 8,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: AppTheme.primary600,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 18,
                                minHeight: 18,
                              ),
                              child: Text(
                                '${cartProvider.itemCount}',
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
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
