import 'chat_message.dart';

class Conversation {
  final int id;
  final String? title;
  final String type;
  final String status;
  final String priority;
  final DateTime? lastMessageAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ConversationParticipant> participants;
  final List<ChatMessage> messages;

  Conversation({
    required this.id,
    this.title,
    required this.type,
    required this.status,
    required this.priority,
    this.lastMessageAt,
    required this.createdAt,
    required this.updatedAt,
    required this.participants,
    required this.messages,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      title: json['title'],
      type: json['type'],
      status: json['status'],
      priority: json['priority'],
      lastMessageAt: json['lastMessageAt'] != null 
          ? DateTime.parse(json['lastMessageAt']) 
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      participants: (json['participants'] as List<dynamic>?)
          ?.map((p) => ConversationParticipant.fromJson(p))
          .toList() ?? [],
      messages: (json['messages'] as List<dynamic>?)
          ?.map((m) => ChatMessage.fromJson(m))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'status': status,
      'priority': priority,
      'lastMessageAt': lastMessageAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'participants': participants.map((p) => p.toJson()).toList(),
      'messages': messages.map((m) => m.toJson()).toList(),
    };
  }

  Conversation copyWith({
    int? id,
    String? title,
    String? type,
    String? status,
    String? priority,
    DateTime? lastMessageAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<ConversationParticipant>? participants,
    List<ChatMessage>? messages,
  }) {
    return Conversation(
      id: id ?? this.id,
      title: title ?? this.title,
      type: type ?? this.type,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      participants: participants ?? this.participants,
      messages: messages ?? this.messages,
    );
  }
}

class ConversationParticipant {
  final int id;
  final int conversationId;
  final int userId;
  final String role;
  final DateTime joinedAt;
  final DateTime? lastReadAt;
  final bool isActive;
  final User? user;

  ConversationParticipant({
    required this.id,
    required this.conversationId,
    required this.userId,
    required this.role,
    required this.joinedAt,
    this.lastReadAt,
    required this.isActive,
    this.user,
  });

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) {
    return ConversationParticipant(
      id: json['id'],
      conversationId: json['conversationId'],
      userId: json['userId'],
      role: json['role'],
      joinedAt: DateTime.parse(json['joinedAt']),
      lastReadAt: json['lastReadAt'] != null 
          ? DateTime.parse(json['lastReadAt']) 
          : null,
      isActive: json['isActive'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'userId': userId,
      'role': role,
      'joinedAt': joinedAt.toIso8601String(),
      'lastReadAt': lastReadAt?.toIso8601String(),
      'isActive': isActive,
      'user': user?.toJson(),
    };
  }
}

class User {
  final int id;
  final String name;
  final String email;
  final String? avatar;
  final String role;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      avatar: json['avatar'],
      role: json['role'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar': avatar,
      'role': role,
    };
  }
}
