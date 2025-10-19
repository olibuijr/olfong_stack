class User {
  final String id;
  final String username;
  final String? email;
  final String? fullName;
  final String? phone;
  final String role;
  final int? age;
  // Kenni IDP fields
  final String? kennitala;
  final DateTime? dob;
  final String? idpProvider;
  final String? idpSubject;
  final String? idpPhone;
  final String? idpRaw;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.username,
    this.email,
    this.fullName,
    this.phone,
    required this.role,
    this.age,
    this.kennitala,
    this.dob,
    this.idpProvider,
    this.idpSubject,
    this.idpPhone,
    this.idpRaw,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      username: json['username'] ?? '',
      email: json['email'],
      fullName: json['fullName'],
      phone: json['phone'],
      role: json['role'] ?? 'CUSTOMER',
      age: json['age'],
      kennitala: json['kennitala'],
      dob: json['dob'] != null ? DateTime.parse(json['dob']) : null,
      idpProvider: json['idpProvider'],
      idpSubject: json['idpSubject'],
      idpPhone: json['idpPhone'],
      idpRaw: json['idpRaw'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'role': role,
      'age': age,
      'kennitala': kennitala,
      'dob': dob?.toIso8601String(),
      'idpProvider': idpProvider,
      'idpSubject': idpSubject,
      'idpPhone': idpPhone,
      'idpRaw': idpRaw,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper getters
  String get displayName => fullName ?? username;
  bool get isAdmin => role == 'ADMIN';
  bool get isDelivery => role == 'DELIVERY';
  bool get isCustomer => role == 'CUSTOMER';
  bool get isKenniUser => idpProvider == 'kenni';
}
