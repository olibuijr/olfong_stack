import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider extends ChangeNotifier {
  static const String _languageKey = 'language';
  
  Locale _locale = const Locale('is'); // Default to Icelandic
  
  Locale get locale => _locale;
  
  LanguageProvider() {
    _loadLanguage();
  }
  
  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_languageKey);
    
    if (languageCode != null) {
      _locale = Locale(languageCode);
      notifyListeners();
    }
  }
  
  Future<void> setLanguage(Locale locale) async {
    _locale = locale;
    notifyListeners();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, locale.languageCode);
  }
  
  void toggleLanguage() {
    if (_locale.languageCode == 'is') {
      setLanguage(const Locale('en'));
    } else {
      setLanguage(const Locale('is'));
    }
  }
  
  bool get isIcelandic => _locale.languageCode == 'is';
  bool get isEnglish => _locale.languageCode == 'en';
}
