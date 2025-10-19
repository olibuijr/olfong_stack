import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../utils/oidc.dart';

class AuthCallbackScreen extends StatefulWidget {
  const AuthCallbackScreen({Key? key}) : super(key: key);

  @override
  State<AuthCallbackScreen> createState() => _AuthCallbackScreenState();
}

class _AuthCallbackScreenState extends State<AuthCallbackScreen> {
  @override
  void initState() {
    super.initState();
    _handleAuthCallback();
  }

  Future<void> _handleAuthCallback() async {
    try {
      // Get the URL fragment from the deep link
      // In a real implementation, you would get this from the deep link handler
      // For now, we'll simulate the callback handling
      final fragment = '#id_token=example_token&state=example_state';
      final params = OidcUtils.parseFragment(fragment);
      
      final idToken = params['id_token'];
      final state = params['state'];
      final error = params['error'];

      if (error != null) {
        _navigateToLogin('Authentication error: $error');
        return;
      }

      if (idToken == null || state == null) {
        _navigateToLogin('Invalid authentication response');
        return;
      }

      // Validate state
      final isValidState = await OidcUtils.validateState(state);
      if (!isValidState) {
        _navigateToLogin('Invalid state parameter');
        return;
      }

      // Clear stored OIDC parameters
      await OidcUtils.clearStoredParams();

      // Login with Kenni IDP
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.kenniLogin(idToken);

      if (authProvider.isAuthenticated && mounted) {
        context.go('/');
      } else if (mounted) {
        _navigateToLogin(authProvider.error ?? 'Authentication failed');
      }
    } catch (e) {
      _navigateToLogin('Authentication error: $e');
    }
  }

  void _navigateToLogin(String error) {
    if (mounted) {
      context.go('/login', extra: {'error': error});
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            Text(
              l10n.authProcessing,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.authProcessingDescription,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
