import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/conversation.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

// Events
abstract class ChatEvent {}

class LoadConversations extends ChatEvent {}
class CreateConversation extends ChatEvent {}
class LoadMessages extends ChatEvent {
  final String conversationId;
  LoadMessages(this.conversationId);
}
class SendMessage extends ChatEvent {
  final String conversationId;
  final String content;
  SendMessage(this.conversationId, this.content);
}
class JoinConversation extends ChatEvent {
  final String conversationId;
  JoinConversation(this.conversationId);
}
class NewMessageReceived extends ChatEvent {
  final Map<String, dynamic> messageData;
  NewMessageReceived(this.messageData);
}
class UserTyping extends ChatEvent {
  final Map<String, dynamic> typingData;
  UserTyping(this.typingData);
}
class ConversationUpdated extends ChatEvent {
  final Map<String, dynamic> conversationData;
  ConversationUpdated(this.conversationData);
}
class LoadUnreadCount extends ChatEvent {}

// States
abstract class ChatState {}

class ChatInitial extends ChatState {}
class ChatLoading extends ChatState {}
class ConversationsLoaded extends ChatState {
  final List<Conversation> conversations;
  final int unreadCount;
  ConversationsLoaded(this.conversations, this.unreadCount);
}
class MessagesLoaded extends ChatState {
  final List<ChatMessage> messages;
  MessagesLoaded(this.messages);
}
class MessageSent extends ChatState {
  final ChatMessage message;
  MessageSent(this.message);
}
class NewMessageReceivedState extends ChatState {
  final ChatMessage message;
  NewMessageReceivedState(this.message);
}
class UserTypingState extends ChatState {
  final bool isTyping;
  final int userId;
  UserTypingState(this.isTyping, this.userId);
}
class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}

// BLoC
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final SocketService _socketService = SocketService.instance;
  final List<Conversation> _conversations = [];
  final List<ChatMessage> _messages = [];
  int _unreadCount = 0;
  bool _isTyping = false;
  int? _currentUserId;
  String? _currentConversationId;

  ChatBloc() : super(ChatInitial()) {
    on<LoadConversations>(_onLoadConversations);
    on<CreateConversation>(_onCreateConversation);
    on<LoadMessages>(_onLoadMessages);
    on<SendMessage>(_onSendMessage);
    on<JoinConversation>(_onJoinConversation);
    on<NewMessageReceived>(_onNewMessageReceived);
    on<UserTyping>(_onUserTyping);
    on<ConversationUpdated>(_onConversationUpdated);
    on<LoadUnreadCount>(_onLoadUnreadCount);

    _initializeSocket();
  }

  void _initializeSocket() async {
    try {
      await _socketService.connect();
      
      // Listen to socket events
      _socketService.messageStream.listen((data) {
        add(NewMessageReceived(data));
      });

      _socketService.typingStream.listen((data) {
        add(UserTyping(data));
      });

      _socketService.conversationStream.listen((data) {
        add(ConversationUpdated(data));
      });

      // Get current user ID
      final prefs = await SharedPreferences.getInstance();
      _currentUserId = prefs.getInt('user_id');
    } catch (e) {
      print('Failed to initialize socket: $e');
    }
  }

  Future<void> _onLoadConversations(LoadConversations event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final conversationsData = await ApiService.getConversations();
      final conversations = conversationsData
          .map((json) => Conversation.fromJson(json))
          .toList();
      
      _conversations.clear();
      _conversations.addAll(conversations);
      
      final unreadCount = await ApiService.getUnreadCount();
      _unreadCount = unreadCount;
      
      emit(ConversationsLoaded(List.from(_conversations), _unreadCount));
    } catch (e) {
      emit(ChatError('Failed to load conversations: $e'));
    }
  }

  Future<void> _onCreateConversation(CreateConversation event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final conversationData = await ApiService.createConversation();
      final conversation = Conversation.fromJson(conversationData);
      
      _conversations.insert(0, conversation);
      emit(ConversationsLoaded(List.from(_conversations), _unreadCount));
    } catch (e) {
      emit(ChatError('Failed to create conversation: $e'));
    }
  }

  Future<void> _onLoadMessages(LoadMessages event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final messagesData = await ApiService.getMessages(event.conversationId);
      final messages = messagesData
          .map((json) => ChatMessage.fromJson(json))
          .toList();
      
      _messages.clear();
      _messages.addAll(messages);
      _currentConversationId = event.conversationId;
      
      emit(MessagesLoaded(List.from(_messages)));
    } catch (e) {
      emit(ChatError('Failed to load messages: $e'));
    }
  }

  Future<void> _onSendMessage(SendMessage event, Emitter<ChatState> emit) async {
    try {
      final messageData = await ApiService.sendMessage(event.conversationId, event.content);
      final message = ChatMessage.fromJson(messageData);
      
      _messages.add(message);
      emit(MessageSent(message));
    } catch (e) {
      emit(ChatError('Failed to send message: $e'));
    }
  }

  Future<void> _onJoinConversation(JoinConversation event, Emitter<ChatState> emit) async {
    try {
      await ApiService.joinConversation(event.conversationId);
      _socketService.joinConversation(event.conversationId);
      _currentConversationId = event.conversationId;
    } catch (e) {
      emit(ChatError('Failed to join conversation: $e'));
    }
  }

  void _onNewMessageReceived(NewMessageReceived event, Emitter<ChatState> emit) {
    try {
      final message = ChatMessage.fromJson(event.messageData);
      
      // Add message to current messages if it's for the current conversation
      if (_currentConversationId != null && 
          message.conversationId.toString() == _currentConversationId) {
        _messages.add(message);
        emit(NewMessageReceivedState(message));
      }
      
      // Update conversations list
      final conversationIndex = _conversations.indexWhere(
        (conv) => conv.id == message.conversationId,
      );
      
      if (conversationIndex != -1) {
        final conversation = _conversations[conversationIndex];
        final updatedConversation = conversation.copyWith(
          lastMessageAt: message.createdAt,
          messages: [...conversation.messages, message],
        );
        _conversations[conversationIndex] = updatedConversation;
        
        // Move to top
        _conversations.removeAt(conversationIndex);
        _conversations.insert(0, updatedConversation);
        
        emit(ConversationsLoaded(List.from(_conversations), _unreadCount));
      }
    } catch (e) {
      emit(ChatError('Failed to process new message: $e'));
    }
  }

  void _onUserTyping(UserTyping event, Emitter<ChatState> emit) {
    try {
      final isTyping = event.typingData['isTyping'] as bool;
      final userId = event.typingData['userId'] as int;
      
      if (_currentUserId != null && userId != _currentUserId) {
        _isTyping = isTyping;
        emit(UserTypingState(_isTyping, userId));
      }
    } catch (e) {
      emit(ChatError('Failed to process typing indicator: $e'));
    }
  }

  void _onConversationUpdated(ConversationUpdated event, Emitter<ChatState> emit) {
    try {
      final updatedConversation = Conversation.fromJson(event.conversationData);
      final index = _conversations.indexWhere(
        (conv) => conv.id == updatedConversation.id,
      );
      
      if (index != -1) {
        _conversations[index] = updatedConversation;
        emit(ConversationsLoaded(List.from(_conversations), _unreadCount));
      }
    } catch (e) {
      emit(ChatError('Failed to process conversation update: $e'));
    }
  }

  Future<void> _onLoadUnreadCount(LoadUnreadCount event, Emitter<ChatState> emit) async {
    try {
      final unreadCount = await ApiService.getUnreadCount();
      _unreadCount = unreadCount;
      
      if (_conversations.isNotEmpty) {
        emit(ConversationsLoaded(List.from(_conversations), _unreadCount));
      }
    } catch (e) {
      emit(ChatError('Failed to load unread count: $e'));
    }
  }

  void emitTypingStart(String conversationId) {
    if (_currentUserId != null) {
      _socketService.emitTypingStart(conversationId, _currentUserId!);
    }
  }

  void emitTypingStop(String conversationId) {
    if (_currentUserId != null) {
      _socketService.emitTypingStop(conversationId, _currentUserId!);
    }
  }

  @override
  Future<void> close() {
    _socketService.dispose();
    return super.close();
  }
}
