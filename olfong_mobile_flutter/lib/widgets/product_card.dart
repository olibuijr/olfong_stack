import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final bool showDiscount;

  const ProductCard({
    Key? key,
    required this.product,
    this.showDiscount = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: Theme.of(context).brightness == Brightness.dark
              ? Colors.grey[700]!
              : Colors.grey[200]!,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () {
          // Navigate to product detail
          context.go('/products/${product.id}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image with overlay
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.grey[800]
                      : Colors.grey[50],
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: product.imageUrl != null
                          ? Image.network(
                              product.imageUrl!,
                              fit: BoxFit.contain,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Theme.of(context).brightness == Brightness.dark
                                      ? Colors.grey[800]
                                      : Colors.grey[100],
                                  child: Icon(
                                    Icons.image_not_supported,
                                    size: 50,
                                    color: Colors.grey[400],
                                  ),
                                );
                              },
                            )
                          : Container(
                              color: Theme.of(context).brightness == Brightness.dark
                                  ? Colors.grey[800]
                                  : Colors.grey[100],
                              child: Icon(
                                Icons.image_not_supported,
                                size: 50,
                                color: Colors.grey[400],
                              ),
                            ),
                    ),
                     // Stock status badge
                     Positioned(
                       top: 8,
                       right: 8,
                       child: Container(
                         padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                         decoration: BoxDecoration(
                           color: product.stock > 0 ? Colors.green : Colors.red,
                           borderRadius: BorderRadius.circular(12),
                           boxShadow: [
                             BoxShadow(
                               color: Colors.black.withOpacity(0.1),
                               blurRadius: 4,
                               offset: const Offset(0, 2),
                             ),
                           ],
                         ),
                         child: Text(
                           product.stock > 0 ? l10n.productsInStock : l10n.productsOutOfStock,
                           style: const TextStyle(
                             color: Colors.white,
                             fontSize: 10,
                             fontWeight: FontWeight.bold,
                           ),
                         ),
                       ),
                     ),
                     // Discount badge (only show if showDiscount is true and product has discount)
                     if (showDiscount && product.discountPercentage != null && product.discountPercentage! > 0)
                       Positioned(
                         top: 8,
                         left: 8,
                         child: Container(
                           padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                           decoration: BoxDecoration(
                             color: Colors.red,
                             borderRadius: BorderRadius.circular(12),
                             boxShadow: [
                               BoxShadow(
                                 color: Colors.black.withOpacity(0.1),
                                 blurRadius: 4,
                                 offset: const Offset(0, 2),
                               ),
                             ],
                           ),
                           child: Text(
                             '-${product.discountPercentage}%',
                             style: const TextStyle(
                               color: Colors.white,
                               fontSize: 10,
                               fontWeight: FontWeight.bold,
                             ),
                           ),
                         ),
                       ),
                    // Hover overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.1),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Product Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (product.description.isNotEmpty)
                      Text(
                        product.description,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 11,
                          height: 1.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const Spacer(),
                     Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                         Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             if (product.discountedPrice != null && product.discountedPrice! < product.price)
                               Text(
                                 '${product.discountedPrice!.toStringAsFixed(0)} ${l10n.commonCurrency}',
                                 style: TextStyle(
                                   fontWeight: FontWeight.bold,
                                   color: Theme.of(context).primaryColor,
                                   fontSize: 16,
                                 ),
                               ),
                             Text(
                               '${product.price.toStringAsFixed(0)} ${l10n.commonCurrency}',
                               style: TextStyle(
                                 fontWeight: product.discountedPrice != null && product.discountedPrice! < product.price
                                   ? FontWeight.normal
                                   : FontWeight.bold,
                                 color: product.discountedPrice != null && product.discountedPrice! < product.price
                                   ? Colors.grey[600]
                                   : Theme.of(context).primaryColor,
                                 fontSize: product.discountedPrice != null && product.discountedPrice! < product.price
                                   ? 14
                                   : 16,
                                 decoration: product.discountedPrice != null && product.discountedPrice! < product.price
                                   ? TextDecoration.lineThrough
                                   : null,
                               ),
                             ),
                           ],
                         ),
                        Consumer<CartProvider>(
                          builder: (context, cartProvider, child) {
                            return Container(
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: [
                                  BoxShadow(
                                    color: Theme.of(context).primaryColor.withOpacity(0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: IconButton(
                                onPressed: () {
                                  cartProvider.addToCart(product, 1);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('${product.name} added to cart'),
                                      duration: const Duration(seconds: 2),
                                      behavior: SnackBarBehavior.floating,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  );
                                },
                                icon: const Icon(
                                  Icons.add_shopping_cart,
                                  color: Colors.white,
                                ),
                                iconSize: 18,
                                padding: const EdgeInsets.all(8),
                                constraints: const BoxConstraints(
                                  minWidth: 36,
                                  minHeight: 36,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
