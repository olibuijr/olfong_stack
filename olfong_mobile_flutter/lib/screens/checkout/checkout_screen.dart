import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/checkout_provider.dart';
import '../../providers/cart_provider.dart';
import '../../models/order.dart';
import '../../router/app_router.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  String? _selectedPickupTime;

  final List<String> _pickupTimes = [
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CheckoutProvider>().loadEnabledPaymentGateways();
    });
  }

  @override
  void dispose() {
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Consumer2<CheckoutProvider, CartProvider>(
        builder: (context, checkoutProvider, cartProvider, child) {
          if (cartProvider.items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('Your cart is empty'),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Summary
                  _buildOrderSummary(cartProvider),
                  const SizedBox(height: 24),

                  // Delivery Method
                  _buildDeliveryMethodSection(checkoutProvider),
                  const SizedBox(height: 24),

                  // Delivery Address (if delivery)
                  if (checkoutProvider.deliveryMethod == DeliveryMethod.delivery)
                    _buildDeliveryAddressSection(),
                  const SizedBox(height: 24),

                  // Pickup Time (if pickup)
                  if (checkoutProvider.deliveryMethod == DeliveryMethod.pickup)
                    _buildPickupTimeSection(),
                  const SizedBox(height: 24),

                  // Payment Method
                  _buildPaymentMethodSection(checkoutProvider),
                  const SizedBox(height: 24),

                  // Order Notes
                  _buildOrderNotesSection(),
                  const SizedBox(height: 24),

                  // Place Order Button
                  _buildPlaceOrderButton(checkoutProvider, cartProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderSummary(CartProvider cartProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Summary',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...cartProvider.items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${item.product.name} x${item.quantity}'),
                  Text('\$${item.totalPrice.toStringAsFixed(2)}'),
                ],
              ),
            )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total (${cartProvider.itemCount} items):',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '\$${cartProvider.totalPrice.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryMethodSection(CheckoutProvider checkoutProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Delivery Method',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            RadioListTile<DeliveryMethod>(
              title: const Text('Home Delivery'),
              subtitle: const Text('We deliver to your address'),
              value: DeliveryMethod.delivery,
              groupValue: checkoutProvider.deliveryMethod,
              onChanged: (value) {
                if (value != null) {
                  checkoutProvider.setDeliveryMethod(value);
                }
              },
            ),
            RadioListTile<DeliveryMethod>(
              title: const Text('Store Pickup'),
              subtitle: const Text('Pick up at our store'),
              value: DeliveryMethod.pickup,
              groupValue: checkoutProvider.deliveryMethod,
              onChanged: (value) {
                if (value != null) {
                  checkoutProvider.setDeliveryMethod(value);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryAddressSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Delivery Address',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                hintText: 'Enter your delivery address',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your delivery address';
                }
                return null;
              },
              onChanged: (value) {
                context.read<CheckoutProvider>().setDeliveryAddress(value);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPickupTimeSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pickup Time',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedPickupTime,
              decoration: const InputDecoration(
                hintText: 'Select pickup time',
                border: OutlineInputBorder(),
              ),
              items: _pickupTimes.map((time) {
                return DropdownMenuItem(
                  value: time,
                  child: Text(time),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedPickupTime = value;
                });
                context.read<CheckoutProvider>().setPickupTime(value);
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please select a pickup time';
                }
                return null;
              },
            ),
            const SizedBox(height: 8),
            const Text(
              'Store Location: Ölföng vín og bjórverslun, Reykjavík',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSection(CheckoutProvider checkoutProvider) {
    if (checkoutProvider.isLoadingGateways) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (checkoutProvider.gatewayError != null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Icon(Icons.error, color: Colors.red, size: 48),
              const SizedBox(height: 8),
              Text(
                'Failed to load payment methods',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                checkoutProvider.gatewayError!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.red,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  checkoutProvider.loadEnabledPaymentGateways();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final hasValitor = checkoutProvider.isValitorAvailable();
    final hasCashOnDelivery = checkoutProvider.isCashOnDeliveryAvailable();
    final hasPayOnPickup = checkoutProvider.isPayOnPickupAvailable();

    if (!hasValitor && !hasCashOnDelivery && !hasPayOnPickup) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Icon(Icons.payment, color: Colors.grey, size: 48),
              const SizedBox(height: 8),
              Text(
                'No payment methods available',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              const Text(
                'Please contact the administrator to enable payment methods',
                style: TextStyle(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Method',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (hasValitor)
              RadioListTile<PaymentMethod>(
                title: const Text('Valitor Payment'),
                subtitle: const Text('Credit card, debit card and online banking'),
                value: PaymentMethod.valitor,
                groupValue: checkoutProvider.paymentMethod,
                onChanged: (value) {
                  if (value != null) {
                    checkoutProvider.setPaymentMethod(value);
                  }
                },
              ),
            if (hasCashOnDelivery)
              RadioListTile<PaymentMethod>(
                title: const Text('Cash on Delivery'),
                subtitle: const Text('Pay with cash when your order is delivered (max 50,000 ISK)'),
                value: PaymentMethod.cashOnDelivery,
                groupValue: checkoutProvider.paymentMethod,
                onChanged: (value) {
                  if (value != null) {
                    checkoutProvider.setPaymentMethod(value);
                  }
                },
              ),
            if (hasPayOnPickup)
              RadioListTile<PaymentMethod>(
                title: const Text('Pay on Pickup'),
                subtitle: const Text('Pay with cash when you pick up your order at the store (max 50,000 ISK)'),
                value: PaymentMethod.payOnPickup,
                groupValue: checkoutProvider.paymentMethod,
                onChanged: (value) {
                  if (value != null) {
                    checkoutProvider.setPaymentMethod(value);
                  }
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderNotesSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Notes (Optional)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                hintText: 'Any special instructions for your order...',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              onChanged: (value) {
                context.read<CheckoutProvider>().setOrderNotes(value);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceOrderButton(CheckoutProvider checkoutProvider, CartProvider cartProvider) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: checkoutProvider.isCreatingOrder ? null : () => _placeOrder(checkoutProvider, cartProvider),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: checkoutProvider.isCreatingOrder
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text('Creating order...'),
                ],
              )
            : Text('Place Order - \$${cartProvider.totalPrice.toStringAsFixed(2)}'),
      ),
    );
  }

  Future<void> _placeOrder(CheckoutProvider checkoutProvider, CartProvider cartProvider) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Validate delivery address for delivery orders
    if (checkoutProvider.deliveryMethod == DeliveryMethod.delivery) {
      if (_addressController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter your delivery address')),
        );
        return;
      }
    }

    // Validate pickup time for pickup orders
    if (checkoutProvider.deliveryMethod == DeliveryMethod.pickup) {
      if (_selectedPickupTime == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a pickup time')),
        );
        return;
      }
    }

    final order = await checkoutProvider.createOrder(cartProvider.totalPrice);
    
    if (order != null) {
      // Clear cart
      await cartProvider.clearCart();
      
      // Navigate to order confirmation
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          AppRouter.orderConfirmation,
          arguments: order,
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(checkoutProvider.orderError ?? 'Failed to create order'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}