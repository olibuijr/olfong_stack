**Task:** Overhaul the translation system to use only Icelandic, store translations in a new `Lang` database table, and update the admin translations page to reflect these changes.

**Steps Taken:**

1.  **Backend Schema Modification:**
    *   Identified `backend/prisma/schema.prisma` as the database schema definition.
    *   Removed the old `Translation` model from `schema.prisma`.
    *   Added a new `Lang` model to `schema.prisma` with `id`, `key`, `locale`, and `value` fields, ensuring PostgreSQL compatibility (using `uuid()` for `id` and `@@unique([key, locale])`).
    *   Removed the `TranslationHistory` model from `schema.prisma`.
    *   Applied schema changes to the database using `npx prisma db push`.
2.  **Backend Logic Refactoring:**
    *   Rewrote `backend/src/services/translationService.js` to interact with the new `Lang` model, support only Icelandic, and remove all old translation-related functionalities (history, stats, import/export, multi-language logic).
    *   Rewrote `backend/src/controllers/translationController.js` to use the simplified `translationService` and handle only basic CRUD operations for Icelandic translations.
    *   Rewrote `backend/src/routes/translations.js` to expose simplified API endpoints for Icelandic translations.
3.  **Frontend Logic Refactoring:**
    *   Created a new `web/src/contexts/LanguageContext.tsx` to provide a simplified `useLanguage` hook for Icelandic-only translations, fetching data directly from the new backend API.
    *   Updated `web/src/pages/admin/Translations.jsx` to use the new `useLanguage` hook, remove old translation-related components (`TranslationImport`, `TranslationStats`), and simplify the UI for Icelandic-only translations.
    *   Updated `web/src/components/admin/TranslationEditor.jsx` to use the new `useLanguage` hook and simplify its form fields to only `key` and `value`.
    *   Updated `web/src/App.jsx` to wrap the entire application with `LanguageProvider` and use the new `useLanguage` hook.
    *   Deleted the old `web/src/hooks/useTranslation.ts` file.
    *   Systematically replaced all imports and usages of the old `useTranslation` hook with the new `useLanguage` hook across numerous frontend files.
    *   Removed all conditional rendering based on `currentLanguage` in `web/src/components/layout/Navbar.jsx` and `web/src/pages/delivery/Dashboard.jsx`, replacing them with hardcoded Icelandic strings.
    *   Removed the language switcher button from `web/src/components/layout/Navbar.jsx`.
    *   Removed unused state variables and imports in various files (`web/src/App.jsx`, `web/src/pages/admin/Reports.jsx`, `web/src/pages/admin/chat/components/ChatArea.jsx`, `web/src/pages/admin/chat/components/MessageItem.jsx`, `web/src/pages/admin/settings/ReceiptSettings.jsx`, `web/src/pages/admin/settings/SMTPSettings.jsx`, `web/src/pages/delivery/Dashboard.jsx`).
    *   Fixed `react/no-unescaped-entities` errors by replacing unescaped apostrophes with `&apos;` in `web/src/pages/delivery/Dashboard.jsx`.