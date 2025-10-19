import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../widgets/admin/admin_layout.dart';

class AdminOrders extends StatefulWidget {
  const AdminOrders({Key? key}) : super(key: key);

  @override
  State<AdminOrders> createState() => _AdminOrdersState();
}

class _AdminOrdersState extends State<AdminOrders> {
  String _selectedStatus = 'All';
  String _sortBy = 'date';

  // Mock orders data
  final List<Map<String, dynamic>> _orders = [
    {
      'id': '1',
      'orderNumber': '#12345',
      'customer': 'Jón Jónsson',
      'email': 'jon@example.com',
      'phone': '+354 123 4567',
      'status': 'PENDING',
      'total': 15500,
      'items': 3,
      'createdAt': '2024-01-15 14:30',
      'deliveryMethod': 'DELIVERY',
      'address': 'Laugavegur 12, 101 Reykjavík',
    },
    {
      'id': '2',
      'orderNumber': '#12344',
      'customer': 'Anna Anna',
      'email': 'anna@example.com',
      'phone': '+354 987 6543',
      'status': 'CONFIRMED',
      'total': 8200,
      'items': 2,
      'createdAt': '2024-01-15 12:15',
      'deliveryMethod': 'PICKUP',
      'address': null,
    },
    {
      'id': '3',
      'orderNumber': '#12343',
      'customer': 'Pétur Pétursson',
      'email': 'petur@example.com',
      'phone': '+354 555 1234',
      'status': 'SHIPPED',
      'total': 22100,
      'items': 5,
      'createdAt': '2024-01-14 16:45',
      'deliveryMethod': 'DELIVERY',
      'address': 'Hverfisgata 45, 101 Reykjavík',
    },
    {
      'id': '4',
      'orderNumber': '#12342',
      'customer': 'Sigríður Sigríðsdóttir',
      'email': 'sigridur@example.com',
      'phone': '+354 777 8888',
      'status': 'DELIVERED',
      'total': 12300,
      'items': 2,
      'createdAt': '2024-01-14 10:20',
      'deliveryMethod': 'DELIVERY',
      'address': 'Skólavörðustígur 8, 101 Reykjavík',
    },
    {
      'id': '5',
      'orderNumber': '#12341',
      'customer': 'Guðrún Guðrúnsdóttir',
      'email': 'gudrun@example.com',
      'phone': '+354 999 1111',
      'status': 'CANCELLED',
      'total': 7500,
      'items': 1,
      'createdAt': '2024-01-13 18:30',
      'deliveryMethod': 'PICKUP',
      'address': null,
    },
  ];

  List<Map<String, dynamic>> get filteredOrders {
    var filtered = _orders;
    
    if (_selectedStatus != 'All') {
      filtered = filtered.where((order) => order['status'] == _selectedStatus).toList();
    }
    
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return AdminLayout(
      title: l10n.adminOrdersManagement,
      child: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedStatus,
                        decoration: InputDecoration(
                          labelText: l10n.adminStatus,
                      border: OutlineInputBorder(),
                    ),
                    items: [
                      l10n.adminAll,
                      l10n.adminPending,
                      l10n.adminConfirmed,
                      l10n.adminShipped,
                      l10n.adminDelivered,
                      l10n.adminCancelled,
                    ].map((status) {
                      return DropdownMenuItem(
                        value: status,
                        child: Text(status),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedStatus = value!;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _sortBy,
                        decoration: InputDecoration(
                          labelText: l10n.adminSortBy,
                      border: OutlineInputBorder(),
                    ),
                        items: [
                          {'value': 'date', 'label': l10n.adminDate},
                          {'value': 'total', 'label': l10n.adminTotal},
                          {'value': 'status', 'label': l10n.adminStatus},
                          {'value': 'customer', 'label': l10n.adminCustomer},
                        ].map((item) {
                      return DropdownMenuItem(
                        value: item['value'],
                        child: Text(item['label']!),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _sortBy = value!;
                      });
                    },
                  ),
                ),
              ],
            ),
          ),
          // Orders list
          Expanded(
            child: filteredOrders.isEmpty
                ? _buildEmptyState()
                : _buildOrdersList(),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    final l10n = AppLocalizations.of(context)!;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            l10n.adminNoOrdersFound,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.adminOrdersWillAppear,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filteredOrders.length,
      itemBuilder: (context, index) {
        final order = filteredOrders[index];
        return _buildOrderCard(context, order);
      },
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
                      'Order ${order['orderNumber']}',
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
                const SizedBox(width: 16),
                Icon(Icons.email, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  order['email'],
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
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
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
                const SizedBox(width: 16),
                Icon(
                  order['deliveryMethod'] == 'DELIVERY' 
                      ? Icons.local_shipping 
                      : Icons.store,
                  size: 16, 
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 8),
                Text(
                  order['deliveryMethod'] == 'DELIVERY' ? 'Delivery' : 'Pickup',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
            if (order['address'] != null) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      order['address'],
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),

            // Order details and actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${order['items']} items • ${order['total']} ISK',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                Row(
                  children: [
                    TextButton(
                      onPressed: () => _viewOrderDetails(order),
                      child: Text(l10n.adminView),
                    ),
                    const SizedBox(width: 8),
                    if (status == 'PENDING')
                      ElevatedButton(
                        onPressed: () => _updateOrderStatus(order, 'CONFIRMED'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                        ),
                        child: Text(l10n.adminConfirm),
                      ),
                    if (status == 'CONFIRMED')
                      ElevatedButton(
                        onPressed: () => _updateOrderStatus(order, 'SHIPPED'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                        ),
                        child: Text(l10n.adminShip),
                      ),
                    if (status == 'SHIPPED')
                      ElevatedButton(
                        onPressed: () => _updateOrderStatus(order, 'DELIVERED'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                        child: Text(l10n.adminDeliver),
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
      case 'PENDING':
        return Colors.orange;
      case 'CONFIRMED':
        return Colors.blue;
      case 'SHIPPED':
        return Colors.purple;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status, AppLocalizations l10n) {
    switch (status) {
      case 'PENDING':
        return l10n.adminPending;
      case 'CONFIRMED':
        return l10n.adminConfirmed;
      case 'SHIPPED':
        return l10n.adminShipped;
      case 'DELIVERED':
        return l10n.adminDelivered;
      case 'CANCELLED':
        return l10n.adminCancelled;
      default:
        return l10n.adminUnknown;
    }
  }

  void _viewOrderDetails(Map<String, dynamic> order) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminOrderDetails(order['orderNumber'])),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${l10n.adminCustomer}: ${order['customer']}'),
              Text('Email: ${order['email']}'),
              Text('Phone: ${order['phone']}'),
              Text('${l10n.adminTotal}: ${order['total']} ISK'),
              Text('${l10n.adminItems}: ${order['items']}'),
              Text('${l10n.adminStatus}: ${_getStatusText(order['status'], l10n)}'),
              Text('${l10n.adminDeliveryMethod}: ${order['deliveryMethod']}'),
              if (order['address'] != null) Text('${l10n.adminAddress}: ${order['address']}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.adminClose),
          ),
        ],
      ),
    );
  }

  void _updateOrderStatus(Map<String, dynamic> order, String newStatus) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminUpdateOrderStatus),
        content: Text(l10n.adminUpdateOrderConfirmation(order['orderNumber'], _getStatusText(newStatus, l10n))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.adminCancel),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                order['status'] = newStatus;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(l10n.adminOrderUpdated(order['orderNumber'], _getStatusText(newStatus, l10n))),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text(l10n.adminUpdate),
          ),
        ],
      ),
    );
  }
}
