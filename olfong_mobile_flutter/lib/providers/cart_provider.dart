import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _error;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  double get totalPrice => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  Future<void> loadCart() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.getCart();
      _items = response.map((json) => CartItem.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(Product product, int quantity) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.addToCart(product.id, quantity);
      
      // Update local cart
      final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
      if (existingIndex >= 0) {
        _items[existingIndex].quantity += quantity;
      } else {
        _items.add(CartItem(product: product, quantity: quantity));
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateQuantity(Product product, int quantity) async {
    if (quantity <= 0) {
      await removeFromCart(product);
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.updateCartItem(product.id, quantity);
      
      // Update local cart
      final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
      if (existingIndex >= 0) {
        _items[existingIndex].quantity = quantity;
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeFromCart(Product product) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.removeFromCart(product.id);
      
      // Update local cart
      _items.removeWhere((item) => item.product.id == product.id);
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.clearCart();
      _items.clear();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
