import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/admin/admin_layout.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({Key? key}) : super(key: key);

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return AdminLayout(
      title: l10n.adminDashboard,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              margin: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.adminDashboardOverview,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${l10n.adminDashboardWelcomeBack}, ${user?.displayName ?? 'Admin'}',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),

                    // Quick Actions
                    Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.adminQuickActions,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: MediaQuery.of(context).size.width > 768 ? 6 : 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    children: [
                      _buildQuickActionCard(
                        context,
                        icon: Icons.add_box,
                        title: l10n.adminDashboardAddProduct,
                        color: Colors.blue,
                        onTap: () => context.go('/admin/products'),
                      ),
                      _buildQuickActionCard(
                        context,
                        icon: Icons.people,
                        title: l10n.adminDashboardManageUsers,
                        color: Colors.green,
                        onTap: () => context.go('/admin/customers'),
                      ),
                      _buildQuickActionCard(
                        context,
                        icon: Icons.analytics,
                        title: l10n.adminDashboardViewAnalytics,
                        color: Colors.purple,
                        onTap: () => context.go('/admin/analytics'),
                      ),
                      _buildQuickActionCard(
                        context,
                        icon: Icons.assessment,
                        title: l10n.adminDashboardReports,
                        color: Colors.orange,
                        onTap: () => context.go('/admin/reports'),
                      ),
                      _buildQuickActionCard(
                        context,
                        icon: Icons.download,
                        title: l10n.adminDashboardExport,
                        color: Colors.teal,
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('${l10n.adminDashboardExport} - Coming soon')),
                          );
                        },
                      ),
                      _buildQuickActionCard(
                        context,
                        icon: Icons.add_shopping_cart,
                        title: l10n.adminDashboardNewOrder,
                        color: Theme.of(context).primaryColor,
                        onTap: () => context.go('/admin/orders'),
                        isPrimary: true,
                      ),
                    ],
                  ),
                ],
              ),
            ),

                    // Stats Grid
                    Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.adminStatistics,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: MediaQuery.of(context).size.width > 768 ? 4 : 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    children: [
                      _buildStatCard(
                        context,
                        title: l10n.adminDashboardTotalRevenue,
                        value: '1,234,567 ISK',
                        growth: '+12.5%',
                        icon: Icons.attach_money,
                        color: Colors.green,
                      ),
                      _buildStatCard(
                        context,
                        title: l10n.adminDashboardTotalOrders,
                        value: '1,247',
                        growth: '+8.2%',
                        icon: Icons.shopping_cart,
                        color: Colors.blue,
                      ),
                      _buildStatCard(
                        context,
                        title: l10n.adminDashboardTotalProducts,
                        value: '89',
                        growth: '+5.1%',
                        icon: Icons.inventory,
                        color: Colors.purple,
                      ),
                      _buildStatCard(
                        context,
                        title: l10n.adminDashboardTotalCustomers,
                        value: '342',
                        growth: '+15.3%',
                        icon: Icons.people,
                        color: Colors.indigo,
                      ),
                    ],
                  ),
                ],
              ),
            ),

                    // Recent Orders
                    Container(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                l10n.adminRecentOrders,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.go('/admin/orders'),
                                child: Text(l10n.adminViewAll),
                              ),
                            ],
                          ),
                  const SizedBox(height: 16),
                  Card(
                    child: Column(
                      children: [
                        _buildOrderRow(
                          context,
                          orderNumber: '#12345',
                          customer: 'Jón Jónsson',
                          amount: '15,500 ISK',
                          status: 'Pending',
                          statusColor: Colors.orange,
                          date: '2024-01-15',
                        ),
                        const Divider(),
                        _buildOrderRow(
                          context,
                          orderNumber: '#12344',
                          customer: 'Anna Anna',
                          amount: '8,200 ISK',
                          status: 'Confirmed',
                          statusColor: Colors.blue,
                          date: '2024-01-15',
                        ),
                        const Divider(),
                        _buildOrderRow(
                          context,
                          orderNumber: '#12343',
                          customer: 'Pétur Pétursson',
                          amount: '22,100 ISK',
                          status: 'Shipped',
                          statusColor: Colors.purple,
                          date: '2024-01-14',
                        ),
                        const Divider(),
                        _buildOrderRow(
                          context,
                          orderNumber: '#12342',
                          customer: 'Sigríður Sigríðsdóttir',
                          amount: '12,300 ISK',
                          status: 'Delivered',
                          statusColor: Colors.green,
                          date: '2024-01-14',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
    bool isPrimary = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: isPrimary ? color : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isPrimary ? color : Colors.grey[300]!,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: isPrimary ? Colors.white : color,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: isPrimary ? Colors.white : Colors.grey[800],
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required String growth,
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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    growth,
                    style: TextStyle(
                      color: Colors.green[700],
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
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

  Widget _buildOrderRow(
    BuildContext context, {
    required String orderNumber,
    required String customer,
    required String amount,
    required String status,
    required Color statusColor,
    required String date,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  orderNumber,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  customer,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              amount,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                status,
                style: TextStyle(
                  color: statusColor,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(
              date,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
