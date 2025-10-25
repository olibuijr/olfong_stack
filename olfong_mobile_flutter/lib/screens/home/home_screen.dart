import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/product_provider.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/chat_widget.dart';
import '../../widgets/layout/custom_app_bar.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../../widgets/home/hero_section.dart';
import '../../widgets/home/features_section.dart';
import '../../widgets/home/discounted_products_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProductProvider>(context, listen: false).loadProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: CustomAppBar(showCart: true),
      body: Stack(
        children: [
          Consumer<ProductProvider>(
            builder: (context, productProvider, child) {
              if (productProvider.isLoading) {
                return const LoadingWidget();
              }

              if (productProvider.error != null) {
                return CustomErrorWidget(
                  message: 'Error loading products',
                  onRetry: () => productProvider.loadProducts(),
                );
              }

              final featuredProducts = productProvider.products.take(6).toList();

              return RefreshIndicator(
                onRefresh: () async {
                  await productProvider.loadProducts();
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                       // Hero Section
                       const HeroSection(),

                       // Features Section
                       const FeaturesSection(),

                       // Discounted Products Section
                       const DiscountedProductsSection(),

                      // Main Content
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 8),
                            // Categories section
                            Text(
                              l10n.homeCategories,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              height: 100,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: productProvider.getCategories().length,
                                itemBuilder: (context, index) {
                                  final category = productProvider.getCategories()[index];
                                  return Container(
                                    width: 80,
                                    margin: const EdgeInsets.only(right: 12),
                                    child: Column(
                                      children: [
                                        Container(
                                          width: 60,
                                          height: 60,
                                          decoration: BoxDecoration(
                                            color: Theme.of(context).primaryColor.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(30),
                                          ),
                                          child: Icon(
                                            Icons.category,
                                            color: Theme.of(context).primaryColor,
                                            size: 30,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          category,
                                          style: Theme.of(context).textTheme.bodySmall,
                                          textAlign: TextAlign.center,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 32),

                            // Featured products section
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  l10n.homeFeaturedProducts,
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                TextButton(
                                  onPressed: () => context.go('/products'),
                                  child: Text(l10n.commonViewAll),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            
                            // Products grid
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: featuredProducts.length,
                              itemBuilder: (context, index) {
                                final product = featuredProducts[index];
                                return ProductCard(product: product);
                              },
                            ),
                            // Add bottom padding to account for bottom navigation bar
                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const ChatWidget(),
        ],
      ),
    );
  }
}
