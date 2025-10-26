# Project Rules

## Process Management

Always use the process management script for all process operations. Never use `npm start`, `npm run dev`, or manual process commands. The process manager handles both frontend and backend services automatically.

### Basic Operations

**Start all services:**
```bash
./process-manager.sh start
```

**Stop all services:**
```bash
./process-manager.sh stop
```

**Restart all services:**
```bash
./process-manager.sh restart
```

**View logs:**
```bash
./process-manager.sh logs
```

## Testing and Verification

**Do NOT run any tests, linting, or builds unless explicitly asked by the user.** Only perform testing operations when the user specifically requests them.

When testing IS requested, use only the following commands:
- `npm run lint` - For linting (code quality checks)
- `npm test` - For running tests
- `npm run build` - For building the project

**Never use the dev server** (`npm run dev` or `npm run dev:android`, etc.) for verification or testing. The dev server is for development convenience only and should not be used for CI/CD-like processes. Use the process management script instead for any service operations.

## Browser Automation

Always attempt to use Playwright for browser automation tasks, but **never run it in non-headless mode**. Always use headless mode (`headless: true`) and 2K resolution (2560x1440). If Playwright encounters an error, report it clearly and suggest alternatives if applicable.

## Translation Management

Always create translation strings via the translation system when creating new strings not already available. Do not hardcode text strings in the application - they must be registered to support multi-language functionality.

**IMPORTANT**: All translations MUST be added to the seed file (`backend/prisma/database-export.json`) to ensure they persist across database resets and are available in all environments.

### When Adding New Translation Keys

1. **Use translation keys in UI**: Always reference translations via `t('key.name')` in components, never hardcode text.

2. **Use correct key format**: Follow the naming convention `section.key` (e.g., `adminSettings.logoColorMode`, `forms.submit`, `errors.validation`).

3. **Always provide both languages**: Every translation key must have both English (`en`) and Icelandic (`is`) translations.

### Adding Translations - Complete Workflow

#### Step 1: Add Keys to Seed File

**REQUIRED**: Add translations directly to `/backend/prisma/database-export.json`:

```json
{
  "langs": [
    {
      "id": "unique-uuid-here",
      "key": "feature.key",
      "locale": "en",
      "value": "English text"
    },
    {
      "id": "unique-uuid-here",
      "key": "feature.key",
      "locale": "is",
      "value": "Icelandic text"
    }
  ]
}
```

Generate UUIDs using this pattern: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` where `x` = random hex digit, `y` = hex digit 8-b.

#### Step 2: Use icelandic-text-generator for Icelandic Text

For Icelandic translations, **ALWAYS use the `icelandic-text-generator` agent** to generate professional, contextually appropriate text:
- Use the agent to translate English strings to Icelandic
- Maintain professional tone appropriate for e-commerce
- Preserve original intent and meaning

#### Step 3: Reseed the Database

After adding to the seed file, run the seed script to populate the database:

```bash
npm run seed
# OR
node prisma/seed.js
```

Expected output:
```
✅ Seeded 1457 translations (or higher if new ones were added)
```

#### Step 4: Verify in UI

Test the UI to ensure translations appear correctly in both English and Icelandic.

#### Step 5: Commit Together

Commit the changes to the seed file along with the component changes:
```bash
git add web/src/pages/... backend/prisma/database-export.json
git commit -m "Add feature translations to UI and seed file"
```

### Translation Key Naming Conventions

- `adminSettings.*` - Admin settings page labels and options
- `forms.*` - Form labels and messages
- `errors.*` - Error messages
- `success.*` - Success notifications
- `buttons.*` - Button labels
- `labels.*` - General labels
- `messages.*` - General messages and status text
- `adminMedia.*` - Media management
- `adminAnalytics.*` - Analytics dashboard
- `checkout.*` - Checkout page elements
- `chat.*` - Chat system messages
- `categories.*` - Product category names
- `subscriptions.*` - Subscription management

### Example Workflow

1. **Component**: Add translation key `{t('adminSettings.newFeature')}`
2. **Seed File**: Add both English and Icelandic entries to `database-export.json`:
   ```json
   { "id": "uuid1", "key": "adminSettings.newFeature", "locale": "en", "value": "New Feature Label" },
   { "id": "uuid2", "key": "adminSettings.newFeature", "locale": "is", "value": "Ný aðgerð merkimiði" }
   ```
3. **Database**: Run `npm run seed` to load into database
4. **Verify**: Check UI displays correct text
5. **Commit**: Commit component changes + seed file updates together

### Seed File is Source of Truth

The `backend/prisma/database-export.json` file is the **permanent source of truth** for all translations:
- ✅ Version controlled (backed up in git)
- ✅ Reproducible across all environments (dev, staging, production)
- ✅ Safe for database resets (seed file protects data)
- ✅ New databases automatically get all 1,457+ translations when seeded
- ✅ No manual work needed - all translations persist automatically

**Never rely on database-only translations. Always add to the seed file first.**

## Code Cleanup

Never create summary documents, analysis files, or documentation files (*.md, *.txt) in the codebase root unless explicitly requested. This keeps the codebase clean and organized. Examples of files to avoid creating:
- SUMMARY.md, ANALYSIS.md, REPORT.md, etc.
- FIX_SUMMARY.txt, VERIFICATION_REPORT.md, etc.
- Architecture or code fix documentation files

Only create documentation when the user explicitly asks for it.

## Frontend Development

The frontend has hot reload enabled. You do NOT need to restart the frontend service when making CSS or component changes - the changes will be automatically reflected in the browser when you save files. Only restart if you encounter issues or if changes don't appear after saving.

## Icelandic Text Generation

When requested to generate Icelandic text or translations, always use the `icelandic-text-generator` agent. This agent has the following rules:

- **Preserve capitalization**: Always respect the capitalization pattern of the input text:
  - Capitalized input → Capitalized Icelandic output
  - Lowercase input → Lowercase Icelandic output
  - ALL CAPS input → ALL CAPS Icelandic output
- Generate authentic, contextually appropriate Icelandic text
- Maintain linguistic accuracy and natural phrasing
- For translations: Preserve the original intent and nuance while adapting to Icelandic grammar and structure

## Database Operations

Always use the PostgreSQL MCP server for database operations on this project. Use the `mcp__postgres__query` tool to run SQL queries instead of using Bash commands or manual database connections. This provides:

- Direct database access through the MCP interface
- Read-only query execution for safety
- Better integration with Claude Code workflows

When you need to query the database, use the MCP tool rather than `psql` or other CLI tools.

### CRITICAL: NEVER RESET THE DATABASE

**NEVER EVER run `prisma migrate reset` or `prisma db push --force` or any command that wipes the database.** This will destroy all data including:
- All translations
- All products and product data
- All orders and customer data
- All settings and configurations
- All uploaded media

If you need to apply schema changes, use `npx prisma migrate create` followed by `npx prisma migrate deploy` to create and apply migrations without data loss. Always create proper migrations for schema changes.

### Database Backup Strategy

**BEFORE making ANY database changes or migrations:**

1. **Export current state**: Run `node scripts/export-db-state.js` to create a timestamped backup in `backups/db-exports/`
2. **Save to seed.js**: Copy the exported data to `prisma/database-export.json` so it becomes part of the seed data
3. **Commit backup**: Add the database-export.json to git so you can revert if needed

**AFTER successful changes:**

1. Keep the backup in the backups folder
2. Update the seed.js to include new translations and data
3. Never delete backup files - they're your safety net

**IF disaster happens:**

Use `node scripts/restore-db-from-backup.js backup-name.json` to restore from a backup file

## Frontend Pages Reference

### Customer-Facing Pages
- `web/src/pages/Home.jsx` - Homepage with hero banner, featured products, and category products
- `web/src/pages/Products.jsx` - Product listing with filters, search, and category navigation
- `web/src/pages/ProductDetail.jsx` - Individual product details page
- `web/src/pages/Cart.jsx` - Shopping cart with checkout flow
- `web/src/pages/Orders.jsx` - Customer order history
- `web/src/pages/OrderDetail.jsx` - Individual order details
- `web/src/pages/Profile.jsx` - Customer profile management
- `web/src/pages/Login.jsx` - Customer login page
- `web/src/pages/Register.jsx` - Customer registration page
- `web/src/pages/AuthCallback.jsx` - OAuth authentication callback handler

### Admin Pages
- `web/src/pages/admin/Dashboard.jsx` - Admin dashboard overview (wrapper)
- `web/src/pages/admin/dashboard/Dashboard.jsx` - Main admin dashboard with stats and charts
- `web/src/pages/admin/Products.jsx` - Product management (CRUD, ATVR import)
- `web/src/pages/admin/Orders.jsx` - Order management and status updates
- `web/src/pages/admin/Categories.jsx` - Category and subcategory management
- `web/src/pages/admin/Customers.jsx` - Customer management
- `web/src/pages/admin/Chat.jsx` - Customer support chat (wrapper)
- `web/src/pages/admin/chat/Chat.jsx` - Main chat interface with conversations
- `web/src/pages/admin/Analytics.jsx` - Analytics dashboard
- `web/src/pages/admin/Banners.jsx` - Banner management
- `web/src/pages/admin/Media.jsx` - Media library management
- `web/src/pages/admin/MediaUpload.jsx` - Media upload interface
- `web/src/pages/admin/Notifications.jsx` - Notification management
- `web/src/pages/admin/Translations.jsx` - Translation management
- `web/src/pages/admin/Reports.jsx` - Reports generation
- `web/src/pages/admin/Settings.jsx` - Settings page (wrapper)
- `web/src/pages/admin/SettingsOverview.jsx` - Settings navigation/overview
- `web/src/pages/admin/DemoData.jsx` - Demo data generation
- `web/src/pages/admin/POSOrders.jsx` - Point of sale orders

### Admin Settings Pages
- `web/src/pages/admin/settings/GeneralSettings.jsx` - General store settings
- `web/src/pages/admin/settings/BusinessSettings.jsx` - Business information settings
- `web/src/pages/admin/settings/ReceiptSettings.jsx` - Receipt configuration
- `web/src/pages/admin/settings/ShippingSettings.jsx` - Shipping configuration
- `web/src/pages/admin/settings/VatSettings.jsx` - VAT/tax settings
- `web/src/pages/admin/settings/ApiKeysSettings.jsx` - API keys management
- `web/src/pages/admin/settings/SMTPSettings.jsx` - Email server configuration
- `web/src/pages/admin/settings/PaymentGatewaysSettings.jsx` - Payment gateway configuration (wrapper)
- `web/src/pages/admin/settings/PaymentGatewaysSettings/PaymentGatewaysSettings.jsx` - Payment gateways main page

### Delivery Pages
- `web/src/pages/delivery/Dashboard.jsx` - Delivery driver dashboard

### Other
- `web/src/pages/AdminLogin.jsx` - Admin login page
