import 'package:flutter/material.dart';
import '../models/order.dart';
import '../models/payment_gateway.dart';
import '../services/api_service.dart';

class CheckoutProvider extends ChangeNotifier {
  List<PaymentGateway> _enabledPaymentGateways = [];
  bool _isLoadingGateways = false;
  String? _gatewayError;
  
  DeliveryMethod _deliveryMethod = DeliveryMethod.delivery;
  PaymentMethod _paymentMethod = PaymentMethod.valitor;
  String? _deliveryAddress;
  String? _pickupTime;
  String? _orderNotes;
  bool _isCreatingOrder = false;
  String? _orderError;

  // Getters
  List<PaymentGateway> get enabledPaymentGateways => _enabledPaymentGateways;
  bool get isLoadingGateways => _isLoadingGateways;
  String? get gatewayError => _gatewayError;
  DeliveryMethod get deliveryMethod => _deliveryMethod;
  PaymentMethod get paymentMethod => _paymentMethod;
  String? get deliveryAddress => _deliveryAddress;
  String? get pickupTime => _pickupTime;
  String? get orderNotes => _orderNotes;
  bool get isCreatingOrder => _isCreatingOrder;
  String? get orderError => _orderError;

  // Payment gateway availability checks
  bool isValitorAvailable() {
    return _isPaymentMethodAvailable('valitor') && 
           _enabledPaymentGateways.any((gateway) => 
             gateway.provider == 'valitor' && 
             gateway.isAvailableForAmount(0)); // Amount will be checked during order creation
  }

  bool isCashOnDeliveryAvailable() {
    return _isPaymentMethodAvailable('cash_on_delivery') && 
           _deliveryMethod == DeliveryMethod.delivery &&
           _enabledPaymentGateways.any((gateway) => 
             gateway.provider == 'cash_on_delivery' && 
             gateway.isAvailableForDelivery());
  }

  bool isPayOnPickupAvailable() {
    return _isPaymentMethodAvailable('pay_on_pickup') && 
           _deliveryMethod == DeliveryMethod.pickup &&
           _enabledPaymentGateways.any((gateway) => 
             gateway.provider == 'pay_on_pickup' && 
             gateway.isAvailableForPickup());
  }

  bool _isPaymentMethodAvailable(String provider) {
    return _enabledPaymentGateways.any((gateway) => 
      gateway.provider == provider && 
      gateway.isEnabled && 
      gateway.isActive);
  }

  // Load enabled payment gateways
  Future<void> loadEnabledPaymentGateways() async {
    _isLoadingGateways = true;
    _gatewayError = null;
    notifyListeners();

    try {
      final response = await ApiService.getEnabledPaymentGateways();
      _enabledPaymentGateways = response
          .map((json) => PaymentGateway.fromJson(json))
          .toList();
      _isLoadingGateways = false;
      notifyListeners();
    } catch (e) {
      _gatewayError = e.toString();
      _isLoadingGateways = false;
      notifyListeners();
    }
  }

  // Update delivery method
  void setDeliveryMethod(DeliveryMethod method) {
    _deliveryMethod = method;
    
    // Reset payment method if it's not available for the new delivery method
    if (method == DeliveryMethod.delivery && _paymentMethod == PaymentMethod.payOnPickup) {
      _paymentMethod = PaymentMethod.valitor;
    } else if (method == DeliveryMethod.pickup && _paymentMethod == PaymentMethod.cashOnDelivery) {
      _paymentMethod = PaymentMethod.valitor;
    }
    
    notifyListeners();
  }

  // Update payment method
  void setPaymentMethod(PaymentMethod method) {
    _paymentMethod = method;
    notifyListeners();
  }

  // Update delivery address
  void setDeliveryAddress(String? address) {
    _deliveryAddress = address;
    notifyListeners();
  }

  // Update pickup time
  void setPickupTime(String? time) {
    _pickupTime = time;
    notifyListeners();
  }

  // Update order notes
  void setOrderNotes(String? notes) {
    _orderNotes = notes;
    notifyListeners();
  }

  // Create order
  Future<Order?> createOrder(double totalAmount) async {
    _isCreatingOrder = true;
    _orderError = null;
    notifyListeners();

    try {
      final orderData = {
        'deliveryMethod': _deliveryMethod.name,
        'paymentMethod': _paymentMethod.name,
        'deliveryAddress': _deliveryAddress,
        'pickupTime': _pickupTime,
        'notes': _orderNotes,
        'totalAmount': totalAmount,
      };

      final response = await ApiService.createOrder(orderData);
      final order = Order.fromJson(response);
      
      _isCreatingOrder = false;
      notifyListeners();
      
      return order;
    } catch (e) {
      _orderError = e.toString();
      _isCreatingOrder = false;
      notifyListeners();
      return null;
    }
  }

  // Clear errors
  void clearGatewayError() {
    _gatewayError = null;
    notifyListeners();
  }

  void clearOrderError() {
    _orderError = null;
    notifyListeners();
  }

  // Reset checkout state
  void reset() {
    _deliveryMethod = DeliveryMethod.delivery;
    _paymentMethod = PaymentMethod.valitor;
    _deliveryAddress = null;
    _pickupTime = null;
    _orderNotes = null;
    _isCreatingOrder = false;
    _orderError = null;
    notifyListeners();
  }
}