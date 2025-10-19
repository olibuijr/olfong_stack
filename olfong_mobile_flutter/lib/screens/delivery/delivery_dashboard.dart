import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';

class DeliveryDashboard extends StatefulWidget {
  const DeliveryDashboard({Key? key}) : super(key: key);

  @override
  State<DeliveryDashboard> createState() => _DeliveryDashboardState();
}

class _DeliveryDashboardState extends State<DeliveryDashboard> {
  bool _isTracking = false;
  String? _currentLocation;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    // TODO: Implement actual location tracking
    setState(() {
      _currentLocation = 'Reykjavík, Iceland';
    });
  }

  void _toggleTracking() {
    setState(() {
      _isTracking = !_isTracking;
    });
    
    final l10n = AppLocalizations.of(context)!;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isTracking 
            ? l10n.adminLocationTrackingStarted 
            : l10n.adminLocationTrackingStopped),
        backgroundColor: _isTracking ? Colors.green : Colors.orange,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    // Mock data for delivery orders
    final assignedOrders = [
      {
        'id': '1',
        'orderNumber': '#12345',
        'customer': 'Jón Jónsson',
        'phone': '+354 123 4567',
        'address': 'Laugavegur 12, 101 Reykjavík',
        'status': 'CONFIRMED',
        'amount': '15,500 ISK',
        'items': 3,
        'createdAt': '2024-01-15',
      },
      {
        'id': '2',
        'orderNumber': '#12344',
        'customer': 'Anna Anna',
        'phone': '+354 987 6543',
        'address': 'Skólavörðustígur 8, 101 Reykjavík',
        'status': 'OUT_FOR_DELIVERY',
        'amount': '8,200 ISK',
        'items': 2,
        'createdAt': '2024-01-15',
      },
      {
        'id': '3',
        'orderNumber': '#12343',
        'customer': 'Pétur Pétursson',
        'phone': '+354 555 1234',
        'address': 'Hverfisgata 45, 101 Reykjavík',
        'status': 'PREPARING',
        'amount': '22,100 ISK',
        'items': 5,
        'createdAt': '2024-01-14',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.deliveryTitle),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Location tracking toggle
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _isTracking ? Colors.green : Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  _isTracking ? l10n.adminActive : l10n.adminInactive,
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(_isTracking ? Icons.pause : Icons.play_arrow),
                  onPressed: _toggleTracking,
                ),
              ],
            ),
          ),
        ],
      ),
      body: Container(
        color: Colors.grey[50],
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome header
              Container(
                margin: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.adminWelcomeDelivery(user?.displayName ?? 'Delivery Person'),
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.adminManageDeliveries,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),

              // Stats cards
              Container(
                margin: const EdgeInsets.only(bottom: 24),
                child: GridView.count(
                  crossAxisCount: MediaQuery.of(context).size.width > 768 ? 4 : 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 1.5,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    _buildStatCard(
                      context,
                      title: l10n.adminAssignedOrders,
                      value: '${assignedOrders.length}',
                      icon: Icons.assignment,
                      color: Colors.blue,
                    ),
                    _buildStatCard(
                      context,
                      title: l10n.adminInDelivery,
                      value: '${assignedOrders.where((o) => o['status'] == 'OUT_FOR_DELIVERY').length}',
                      icon: Icons.local_shipping,
                      color: Colors.orange,
                    ),
                    _buildStatCard(
                      context,
                      title: l10n.adminCompletedToday,
                      value: '12',
                      icon: Icons.check_circle,
                      color: Colors.green,
                    ),
                    _buildStatCard(
                      context,
                      title: l10n.adminTotalEarnings,
                      value: '45,200 ISK',
                      icon: Icons.attach_money,
                      color: Colors.purple,
                    ),
                  ],
                ),
              ),

              // Orders section
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.adminYourOrders,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (assignedOrders.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          children: [
                            Icon(
                              Icons.local_shipping,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              l10n.adminNoOrdersAssigned,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              l10n.adminWillBeNotified,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[500],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: assignedOrders.length,
                        itemBuilder: (context, index) {
                          final order = assignedOrders[index];
                          return _buildOrderCard(context, order);
                        },
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 24,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, Map<String, dynamic> order) {
    final l10n = AppLocalizations.of(context)!;
    final status = order['status'] as String;
    final statusColor = _getStatusColor(status);
    final statusText = _getStatusText(status, l10n);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${l10n.adminOrder} ${order['orderNumber']}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      order['createdAt'],
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Customer info
            Row(
              children: [
                Icon(Icons.person, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  order['customer'],
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  order['phone'],
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    order['address'],
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Order details
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${order['items']} items • ${order['amount']}',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                Row(
                  children: [
                    if (status == 'CONFIRMED' || status == 'PREPARING')
                      ElevatedButton.icon(
                        onPressed: () => _startDelivery(order),
                        icon: const Icon(Icons.play_arrow, size: 16),
                        label: Text(l10n.adminStart),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        ),
                      ),
                    if (status == 'OUT_FOR_DELIVERY')
                      ElevatedButton.icon(
                        onPressed: () => _completeDelivery(order),
                        icon: const Icon(Icons.check, size: 16),
                        label: Text(l10n.adminComplete),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.blue;
      case 'PREPARING':
        return Colors.purple;
      case 'OUT_FOR_DELIVERY':
        return Colors.orange;
      case 'DELIVERED':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status, AppLocalizations l10n) {
    switch (status) {
      case 'CONFIRMED':
        return l10n.adminConfirmed;
      case 'PREPARING':
        return l10n.adminPreparing;
      case 'OUT_FOR_DELIVERY':
        return l10n.adminOutForDelivery;
      case 'DELIVERED':
        return l10n.adminDelivered;
      default:
        return l10n.adminUnknown;
    }
  }

  void _startDelivery(Map<String, dynamic> order) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminStartDelivery),
        content: Text(l10n.adminStartDeliveryConfirmation(order['orderNumber'])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Update order status
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Delivery started for order ${order['orderNumber']}'),
                  backgroundColor: Colors.green,
                ),
              );
            },
                        child: Text(l10n.adminStart),
          ),
        ],
      ),
    );
  }

  void _completeDelivery(Map<String, dynamic> order) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminCompleteDelivery),
        content: Text(l10n.adminCompleteDeliveryConfirmation(order['orderNumber'])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Update order status
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(l10n.adminOrderMarkedDelivered(order['orderNumber'])),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text(l10n.adminComplete),
          ),
        ],
      ),
    );
  }
}
