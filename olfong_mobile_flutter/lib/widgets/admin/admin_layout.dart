import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';

class AdminLayout extends StatefulWidget {
  final Widget child;
  final String title;
  final List<Widget>? actions;

  const AdminLayout({
    Key? key,
    required this.child,
    required this.title,
    this.actions,
  }) : super(key: key);

  @override
  State<AdminLayout> createState() => _AdminLayoutState();
}

class _AdminLayoutState extends State<AdminLayout> {
  int _selectedIndex = 0;
  bool _isDrawerOpen = false;

  List<AdminNavItem> _getNavItems(AppLocalizations l10n) => [
    AdminNavItem(
      icon: Icons.dashboard,
      title: l10n.adminDashboard,
      route: '/admin',
    ),
    AdminNavItem(
      icon: Icons.inventory,
      title: l10n.adminProductsManagement,
      route: '/admin/products',
    ),
    AdminNavItem(
      icon: Icons.shopping_cart,
      title: l10n.adminOrdersManagement,
      route: '/admin/orders',
    ),
    AdminNavItem(
      icon: Icons.people,
      title: l10n.adminCustomersManagement,
      route: '/admin/customers',
    ),
    AdminNavItem(
      icon: Icons.analytics,
      title: l10n.adminAnalytics,
      route: '/admin/analytics',
    ),
    AdminNavItem(
      icon: Icons.assessment,
      title: l10n.adminReports,
      route: '/admin/reports',
    ),
    AdminNavItem(
      icon: Icons.chat,
      title: l10n.adminChat,
      route: '/admin/chat',
    ),
    AdminNavItem(
      icon: Icons.settings,
      title: l10n.adminSettings,
      route: '/admin/settings',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final navItems = _getNavItems(l10n);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Notifications
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 12,
                      minHeight: 12,
                    ),
                    child: const Text(
                      '3',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () {
              // TODO: Implement notifications
            },
          ),
          // User menu
          PopupMenuButton<String>(
            icon: CircleAvatar(
              radius: 16,
              backgroundColor: Colors.white,
              child: Text(
                user?.displayName.isNotEmpty == true 
                    ? user!.displayName[0].toUpperCase() 
                    : 'A',
                style: const TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  context.go('/profile');
                  break;
                case 'logout':
                  authProvider.logout();
                  context.go('/login');
                  break;
              }
            },
            itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'profile',
                        child: Row(
                          children: [
                            const Icon(Icons.person),
                            const SizedBox(width: 8),
                            Text(l10n.adminProfile),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'logout',
                        child: Row(
                          children: [
                            const Icon(Icons.logout),
                            const SizedBox(width: 8),
                            Text(l10n.adminLogout),
                          ],
                        ),
                      ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            // Header
            Container(
              height: 200,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).primaryColor,
                    Theme.of(context).primaryColor.withOpacity(0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: Colors.white,
                        child: Text(
                          user?.displayName.isNotEmpty == true 
                              ? user!.displayName[0].toUpperCase() 
                              : 'A',
                          style: TextStyle(
                            color: Theme.of(context).primaryColor,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        user?.displayName ?? 'Admin',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        user?.email ?? 'admin@olfong.is',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Navigation items
            Expanded(
              child: ListView.builder(
                itemCount: navItems.length,
                itemBuilder: (context, index) {
                  final item = navItems[index];
                  final isSelected = _selectedIndex == index;
                  
                  return ListTile(
                    leading: Icon(
                      item.icon,
                      color: isSelected 
                          ? Theme.of(context).primaryColor 
                          : Colors.grey[600],
                    ),
                    title: Text(
                      item.title,
                      style: TextStyle(
                        color: isSelected 
                            ? Theme.of(context).primaryColor 
                            : Colors.grey[800],
                        fontWeight: isSelected 
                            ? FontWeight.bold 
                            : FontWeight.normal,
                      ),
                    ),
                    selected: isSelected,
                    onTap: () {
                      setState(() {
                        _selectedIndex = index;
                      });
                      Navigator.pop(context);
                      context.go(item.route);
                    },
                  );
                },
              ),
            ),
            // Footer
            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Divider(),
                          ListTile(
                            leading: const Icon(Icons.help_outline),
                            title: Text(l10n.adminHelpSupport),
                            onTap: () {
                              // TODO: Implement help
                            },
                          ),
                          ListTile(
                            leading: const Icon(Icons.info_outline),
                            title: Text(l10n.adminAbout),
                            onTap: () {
                              // TODO: Implement about
                            },
                          ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Row(
        children: [
          // Desktop sidebar (hidden on mobile)
          if (MediaQuery.of(context).size.width > 768)
            Container(
              width: 250,
              decoration: BoxDecoration(
                color: Colors.grey[50],
                border: Border(
                  right: BorderSide(
                    color: Colors.grey[300]!,
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Logo
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(
                          Icons.admin_panel_settings,
                          color: Theme.of(context).primaryColor,
                          size: 24,
                        ),
                        const SizedBox(width: 8),
                                Text(
                                  l10n.adminPanel,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                      ],
                    ),
                  ),
                  const Divider(),
                  // Navigation items
                  Expanded(
                    child: ListView.builder(
                      itemCount: navItems.length,
                      itemBuilder: (context, index) {
                        final item = navItems[index];
                        final isSelected = _selectedIndex == index;
                        
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          child: ListTile(
                            leading: Icon(
                              item.icon,
                              color: isSelected 
                                  ? Theme.of(context).primaryColor 
                                  : Colors.grey[600],
                            ),
                            title: Text(
                              item.title,
                              style: TextStyle(
                                color: isSelected 
                                    ? Theme.of(context).primaryColor 
                                    : Colors.grey[800],
                                fontWeight: isSelected 
                                    ? FontWeight.bold 
                                    : FontWeight.normal,
                              ),
                            ),
                            selected: isSelected,
                            selectedTileColor: Theme.of(context).primaryColor.withOpacity(0.1),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            onTap: () {
                              setState(() {
                                _selectedIndex = index;
                              });
                              context.go(item.route);
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          // Main content
          Expanded(
            child: Container(
              color: Colors.grey[50],
              child: widget.child,
            ),
          ),
        ],
      ),
    );
  }
}

class AdminNavItem {
  final IconData icon;
  final String title;
  final String route;

  AdminNavItem({
    required this.icon,
    required this.title,
    required this.route,
  });
}
