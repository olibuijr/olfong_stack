import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../providers/theme_provider.dart';
import '../../providers/language_provider.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final Widget? leading;

  const CustomAppBar({
    super.key,
    this.title,
    this.actions,
    this.showBackButton = true,
    this.onBackPressed,
    this.leading,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final languageProvider = Provider.of<LanguageProvider>(context);

    return AppBar(
      title: title != null ? Text(title!) : null,
      leading: leading ?? (showBackButton ? _buildBackButton(context) : null),
      actions: [
        // Language toggle
        IconButton(
          icon: Icon(
            languageProvider.isIcelandic ? Icons.language : Icons.translate,
            color: languageProvider.isIcelandic ? Colors.blue : Colors.green,
          ),
          onPressed: () => languageProvider.toggleLanguage(),
          tooltip: l10n.commonLanguage,
        ),
        // Theme toggle
        IconButton(
          icon: Icon(
            themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
          ),
          onPressed: () => themeProvider.toggleTheme(),
          tooltip: themeProvider.isDarkMode ? 'Light Mode' : 'Dark Mode',
        ),
        // Custom actions
        if (actions != null) ...actions!,
      ],
      elevation: 0,
      centerTitle: true,
    );
  }

  Widget _buildBackButton(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back_ios),
      onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
