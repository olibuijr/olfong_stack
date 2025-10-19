import 'dart:convert';

class PaymentGateway {
  final String id;
  final String name;
  final String displayName;
  final String provider;
  final bool isEnabled;
  final bool isActive;
  final Map<String, dynamic> config;
  final List<String> supportedMethods;
  final List<String> supportedCurrencies;
  final List<String> supportedCountries;
  final String? description;
  final String? logoUrl;

  PaymentGateway({
    required this.id,
    required this.name,
    required this.displayName,
    required this.provider,
    required this.isEnabled,
    required this.isActive,
    required this.config,
    required this.supportedMethods,
    required this.supportedCurrencies,
    required this.supportedCountries,
    this.description,
    this.logoUrl,
  });

  factory PaymentGateway.fromJson(Map<String, dynamic> json) {
    return PaymentGateway(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      displayName: json['displayName'] ?? json['name'] ?? '',
      provider: json['provider'] ?? '',
      isEnabled: json['isEnabled'] ?? false,
      isActive: json['isActive'] ?? false,
      config: json['config'] is String 
          ? Map<String, dynamic>.from(jsonDecode(json['config']))
          : Map<String, dynamic>.from(json['config'] ?? {}),
      supportedMethods: List<String>.from(json['supportedMethods'] ?? []),
      supportedCurrencies: List<String>.from(json['supportedCurrencies'] ?? []),
      supportedCountries: List<String>.from(json['supportedCountries'] ?? []),
      description: json['description'],
      logoUrl: json['logoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'displayName': displayName,
      'provider': provider,
      'isEnabled': isEnabled,
      'isActive': isActive,
      'config': config,
      'supportedMethods': supportedMethods,
      'supportedCurrencies': supportedCurrencies,
      'supportedCountries': supportedCountries,
      'description': description,
      'logoUrl': logoUrl,
    };
  }

  bool isAvailableForDelivery() {
    if (!isEnabled || !isActive) return false;
    
    final supportedDeliveryMethods = config['supportedDeliveryMethods'] as List<dynamic>?;
    if (supportedDeliveryMethods == null) return true;
    
    return supportedDeliveryMethods.contains('DELIVERY') || 
           supportedDeliveryMethods.contains('delivery');
  }

  bool isAvailableForPickup() {
    if (!isEnabled || !isActive) return false;
    
    final supportedDeliveryMethods = config['supportedDeliveryMethods'] as List<dynamic>?;
    if (supportedDeliveryMethods == null) return true;
    
    return supportedDeliveryMethods.contains('PICKUP') || 
           supportedDeliveryMethods.contains('pickup');
  }

  bool isAvailableForAmount(double amount) {
    if (!isEnabled || !isActive) return false;
    
    final maxAmount = config['maxAmount'] as num?;
    if (maxAmount == null) return true;
    
    return amount <= maxAmount.toDouble();
  }
}