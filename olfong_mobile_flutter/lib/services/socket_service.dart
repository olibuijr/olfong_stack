import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

class SocketService {
  static SocketService? _instance;
  static SocketService get instance => _instance ??= SocketService._();
  
  SocketService._();

  IO.Socket? _socket;
  bool _isConnected = false;
  final StreamController<Map<String, dynamic>> _messageController = 
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<Map<String, dynamic>> _typingController = 
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<Map<String, dynamic>> _conversationController = 
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get conversationStream => _conversationController.stream;

  bool get isConnected => _isConnected;

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    if (token == null) {
      throw Exception('No auth token found');
    }

    _socket = IO.io('http://192.168.8.62:5000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {
        'token': token,
      },
    });

    _socket!.onConnect((_) {
      _isConnected = true;
      print('Socket connected');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('Socket disconnected');
    });

    _socket!.onConnectError((error) {
      _isConnected = false;
      print('Socket connection error: $error');
    });

    // Chat event listeners
    _socket!.on('new-message', (data) {
      _messageController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('user-typing', (data) {
      _typingController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('conversation-updated', (data) {
      _conversationController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('chat-notification', (data) {
      _messageController.add(Map<String, dynamic>.from(data));
    });

    _socket!.connect();
  }

  Future<void> disconnect() async {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  // Chat methods
  void joinConversation(String conversationId) {
    if (_socket?.connected == true) {
      _socket!.emit('join-conversation', {'conversationId': conversationId});
    }
  }

  void leaveConversation(String conversationId) {
    if (_socket?.connected == true) {
      _socket!.emit('leave-conversation', {'conversationId': conversationId});
    }
  }

  void emitTypingStart(String conversationId, int userId) {
    if (_socket?.connected == true) {
      _socket!.emit('typing-start', {
        'conversationId': conversationId,
        'userId': userId,
      });
    }
  }

  void emitTypingStop(String conversationId, int userId) {
    if (_socket?.connected == true) {
      _socket!.emit('typing-stop', {
        'conversationId': conversationId,
        'userId': userId,
      });
    }
  }

  void emitMessageRead(String conversationId, int messageId) {
    if (_socket?.connected == true) {
      _socket!.emit('message-read', {
        'conversationId': conversationId,
        'messageId': messageId,
      });
    }
  }

  void dispose() {
    _messageController.close();
    _typingController.close();
    _conversationController.close();
    disconnect();
  }
}
