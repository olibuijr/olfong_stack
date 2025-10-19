class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? discountedPrice;
  final int? discountPercentage;
  final String? imageUrl;
  final String category;
  final bool ageRestricted;
  final int stock;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.discountedPrice,
    this.discountPercentage,
    this.imageUrl,
    required this.category,
    required this.ageRestricted,
    required this.stock,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num).toDouble(),
      discountedPrice: json['discountedPrice'] != null ? (json['discountedPrice'] as num).toDouble() : null,
      discountPercentage: json['discountPercentage'] != null ? (json['discountPercentage'] as num).toInt() : null,
      imageUrl: json['imageUrl'],
      category: json['category']?['name'] ?? 'Unknown',
      ageRestricted: json['ageRestriction'] != null && json['ageRestriction'] > 0,
      stock: json['stock'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'discountedPrice': discountedPrice,
      'discountPercentage': discountPercentage,
      'imageUrl': imageUrl,
      'category': category,
      'ageRestricted': ageRestricted,
      'stock': stock,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
