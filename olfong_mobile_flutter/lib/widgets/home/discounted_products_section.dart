import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/product_provider.dart';
import '../product_card.dart';
import '../common/loading_widget.dart';

class DiscountedProductsSection extends StatelessWidget {
  const DiscountedProductsSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Consumer<ProductProvider>(
      builder: (context, productProvider, child) {
        // Filter products that have discounts
        final discountedProducts = productProvider.products
            .where((product) =>
                product.discountPercentage != null &&
                product.discountPercentage! > 0)
            .take(6)
            .toList();

        // Don't show section if no discounted products
        if (discountedProducts.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          color: Theme.of(context).colorScheme.surface,
          padding: const EdgeInsets.symmetric(vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.homeDiscountedTitle,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.homeDiscountedSubtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 280,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  itemCount: discountedProducts.length,
                  itemBuilder: (context, index) {
                    final product = discountedProducts[index];
                    return Container(
                      width: 200,
                      margin: const EdgeInsets.only(right: 12),
                      child: ProductCard(
                        product: product,
                        showDiscount: true,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${discountedProducts.length} ${l10n.commonItemsLabel}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.go('/products?discounted=true'),
                      child: Text(l10n.commonViewAll),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}