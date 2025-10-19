import 'cart_item.dart';

enum OrderStatus {
  pending,
  confirmed,
  processing,
  shipped,
  delivered,
  cancelled,
  pickedUp,
}

enum DeliveryMethod {
  delivery,
  pickup,
}

enum PaymentMethod {
  valitor,
  cashOnDelivery,
  payOnPickup,
}

class Order {
  final String id;
  final String userId;
  final List<CartItem> items;
  final double totalAmount;
  final OrderStatus status;
  final DeliveryMethod deliveryMethod;
  final PaymentMethod paymentMethod;
  final String? deliveryAddress;
  final String? pickupTime;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? notes;

  Order({
    required this.id,
    required this.userId,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.deliveryMethod,
    required this.paymentMethod,
    this.deliveryAddress,
    this.pickupTime,
    required this.createdAt,
    this.updatedAt,
    this.notes,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'].toString(),
      userId: json['userId'].toString(),
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      totalAmount: (json['totalAmount'] ?? 0.0).toDouble(),
      status: _parseOrderStatus(json['status']),
      deliveryMethod: _parseDeliveryMethod(json['deliveryMethod']),
      paymentMethod: _parsePaymentMethod(json['paymentMethod']),
      deliveryAddress: json['deliveryAddress'],
      pickupTime: json['pickupTime'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'items': items.map((item) => item.toJson()).toList(),
      'totalAmount': totalAmount,
      'status': status.name,
      'deliveryMethod': deliveryMethod.name,
      'paymentMethod': paymentMethod.name,
      'deliveryAddress': deliveryAddress,
      'pickupTime': pickupTime,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'notes': notes,
    };
  }

  static OrderStatus _parseOrderStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return OrderStatus.pending;
      case 'confirmed':
        return OrderStatus.confirmed;
      case 'processing':
        return OrderStatus.processing;
      case 'shipped':
        return OrderStatus.shipped;
      case 'delivered':
        return OrderStatus.delivered;
      case 'cancelled':
        return OrderStatus.cancelled;
      case 'picked_up':
        return OrderStatus.pickedUp;
      default:
        return OrderStatus.pending;
    }
  }

  static DeliveryMethod _parseDeliveryMethod(String method) {
    switch (method.toLowerCase()) {
      case 'delivery':
        return DeliveryMethod.delivery;
      case 'pickup':
        return DeliveryMethod.pickup;
      default:
        return DeliveryMethod.delivery;
    }
  }

  static PaymentMethod _parsePaymentMethod(String method) {
    switch (method.toLowerCase()) {
      case 'valitor':
        return PaymentMethod.valitor;
      case 'cash_on_delivery':
        return PaymentMethod.cashOnDelivery;
      case 'pay_on_pickup':
        return PaymentMethod.payOnPickup;
      default:
        return PaymentMethod.valitor;
    }
  }

  String get statusDisplayName {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.processing:
        return 'Processing';
      case OrderStatus.shipped:
        return 'Shipped';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      case OrderStatus.pickedUp:
        return 'Picked Up';
    }
  }

  String get deliveryMethodDisplayName {
    switch (deliveryMethod) {
      case DeliveryMethod.delivery:
        return 'Delivery';
      case DeliveryMethod.pickup:
        return 'Pickup';
    }
  }

  String get paymentMethodDisplayName {
    switch (paymentMethod) {
      case PaymentMethod.valitor:
        return 'Valitor Payment';
      case PaymentMethod.cashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethod.payOnPickup:
        return 'Pay on Pickup';
    }
  }
}