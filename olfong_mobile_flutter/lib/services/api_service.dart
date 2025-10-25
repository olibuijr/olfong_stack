import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.8.62:5000/api';
  
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth endpoints
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  // Kenni IDP login
  static Future<Map<String, dynamic>> kenniLogin(String idToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/kenni/login'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'idToken': idToken,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Kenni login failed: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  // Product endpoints
  static Future<List<dynamic>> getProducts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/products'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['data'] != null) {
        return data['data']['products'] ?? [];
      } else {
        throw Exception('API returned error: ${data['message'] ?? 'Unknown error'}');
      }
    } else {
      throw Exception('Failed to load products: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getProduct(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/products/$id'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['data'] != null) {
        return data['data'];
      } else {
        throw Exception('API returned error: ${data['message'] ?? 'Unknown error'}');
      }
    } else {
      throw Exception('Failed to load product: ${response.body}');
    }
  }

  // Cart endpoints
  static Future<List<dynamic>> getCart() async {
    final response = await http.get(
      Uri.parse('$baseUrl/cart'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load cart: ${response.body}');
    }
  }

  static Future<void> addToCart(String productId, int quantity) async {
    final response = await http.post(
      Uri.parse('$baseUrl/cart'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'productId': productId,
        'quantity': quantity,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to add to cart: ${response.body}');
    }
  }

  static Future<void> updateCartItem(String productId, int quantity) async {
    final response = await http.put(
      Uri.parse('$baseUrl/cart/$productId'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'quantity': quantity,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update cart: ${response.body}');
    }
  }

  static Future<void> removeFromCart(String productId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/cart/$productId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to remove from cart: ${response.body}');
    }
  }

  static Future<void> clearCart() async {
    final response = await http.delete(
      Uri.parse('$baseUrl/cart'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to clear cart: ${response.body}');
    }
  }

  // Payment Gateway endpoints
  static Future<List<dynamic>> getEnabledPaymentGateways() async {
    final response = await http.get(
      Uri.parse('$baseUrl/payment-gateways/config'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load payment gateways: ${response.body}');
    }
  }

  // Order endpoints
  static Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: await _getHeaders(),
      body: jsonEncode(orderData),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create order: ${response.body}');
    }
  }

  static Future<List<dynamic>> getOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load orders: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getOrder(String orderId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/$orderId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load order: ${response.body}');
    }
  }

  // Chat endpoints
  static Future<List<dynamic>> getConversations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/chat/conversations'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] ?? [];
    } else {
      throw Exception('Failed to load conversations: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createConversation() async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat/conversations'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'type': 'SUPPORT',
        'status': 'ACTIVE',
        'priority': 'NORMAL',
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to create conversation: ${response.body}');
    }
  }

  static Future<List<dynamic>> getMessages(String conversationId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/chat/conversations/$conversationId/messages'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] ?? [];
    } else {
      throw Exception('Failed to load messages: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> sendMessage(
    String conversationId,
    String content,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat/conversations/$conversationId/messages'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'content': content,
        'messageType': 'TEXT',
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> joinConversation(String conversationId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat/conversations/$conversationId/join'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to join conversation: ${response.body}');
    }
  }

  static Future<int> getUnreadCount() async {
    final response = await http.get(
      Uri.parse('$baseUrl/chat/unread-count'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['unreadCount'] ?? 0;
    } else {
      return 0;
    }
  }
}
