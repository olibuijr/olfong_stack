import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'bottom_nav.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;

    // Don't show bottom nav on certain screens
    final hideBottomNav = location.startsWith('/admin') ||
        location.startsWith('/delivery') ||
        location == '/register' ||
        location == '/auth-callback' ||
        location.startsWith('/checkout');

    return Scaffold(
      body: child,
      bottomNavigationBar: hideBottomNav ? null : BottomNav(currentRoute: location),
    );
  }
}
