import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OidcUtils {
  static const String _stateKey = 'kenni_oidc_state';
  static const String _nonceKey = 'kenni_oidc_nonce';

  /// Generate a random string for OIDC state and nonce
  static String _generateRandomString(int length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    final random = Random.secure();
    return String.fromCharCodes(
      Iterable.generate(length, (_) => chars.codeUnitAt(random.nextInt(chars.length))),
    );
  }

  /// Build Kenni authorization URL
  static Future<String> buildKenniAuthorizeUrl() async {
    const issuer = String.fromEnvironment('KENNI_ISSUER', defaultValue: 'https://kenni.is');
    const clientId = String.fromEnvironment('KENNI_CLIENT_ID', defaultValue: 'olfong-mobile');
    const redirectUri = String.fromEnvironment('KENNI_REDIRECT_URI', defaultValue: 'olfong://auth/callback');
    const scope = String.fromEnvironment('KENNI_SCOPE', defaultValue: 'openid profile phone');
    const responseType = String.fromEnvironment('KENNI_RESPONSE_TYPE', defaultValue: 'id_token');
    const responseMode = String.fromEnvironment('KENNI_RESPONSE_MODE', defaultValue: 'fragment');

    if (issuer.isEmpty || clientId.isEmpty) {
      throw Exception('Kenni OIDC not configured. Please set KENNI_ISSUER and KENNI_CLIENT_ID environment variables.');
    }

    final state = _generateRandomString(24);
    final nonce = _generateRandomString(24);
    
    // Store state and nonce for validation
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_stateKey, state);
    await prefs.setString(_nonceKey, nonce);

    final params = {
      'client_id': clientId,
      'redirect_uri': redirectUri,
      'scope': scope,
      'response_type': responseType,
      'response_mode': responseMode,
      'state': state,
      'nonce': nonce,
    };

    final queryString = params.entries
        .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
        .join('&');

    return '$issuer/authorize?$queryString';
  }

  /// Launch Kenni authorization URL
  static Future<bool> launchKenniAuth() async {
    try {
      final url = await buildKenniAuthorizeUrl();
      final uri = Uri.parse(url);
      
      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw Exception('Could not launch Kenni authorization URL');
      }
    } catch (e) {
      debugPrint('Error launching Kenni auth: $e');
      return false;
    }
  }

  /// Parse OIDC fragment response
  static Map<String, String> parseFragment(String fragment) {
    final trimmed = fragment.startsWith('#') ? fragment.substring(1) : fragment;
    final params = <String, String>{};
    
    for (final pair in trimmed.split('&')) {
      final keyValue = pair.split('=');
      if (keyValue.length == 2) {
        params[Uri.decodeComponent(keyValue[0])] = Uri.decodeComponent(keyValue[1]);
      }
    }
    
    return params;
  }

  /// Validate OIDC state parameter
  static Future<bool> validateState(String state) async {
    final prefs = await SharedPreferences.getInstance();
    final storedState = prefs.getString(_stateKey);
    return storedState == state;
  }

  /// Get stored nonce
  static Future<String?> getStoredNonce() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_nonceKey);
  }

  /// Clear stored OIDC parameters
  static Future<void> clearStoredParams() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_stateKey);
    await prefs.remove(_nonceKey);
  }

  /// Decode JWT token (basic implementation - in production use a proper JWT library)
  static Map<String, dynamic>? decodeJwtToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      
      // Add padding if needed
      String payload = parts[1];
      final padding = 4 - (payload.length % 4);
      if (padding != 4) {
        payload += '=' * padding;
      }
      
      final decoded = utf8.decode(base64Url.decode(payload));
      return jsonDecode(decoded);
    } catch (e) {
      debugPrint('Error decoding JWT token: $e');
      return null;
    }
  }
}
