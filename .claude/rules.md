# Project Rules

## Process Management

Always use the process management script for all process operations. Never use `npm start`, `npm run dev`, or manual process commands.

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

The process manager handles both frontend and backend services automatically.

## Browser Automation

Always attempt to use Playwright for browser automation tasks, but **never run it in non-headless mode**. Always use headless mode (`headless: true`) and 2K resolution (2560x1440). If Playwright encounters an error, report it clearly and suggest alternatives if applicable.

## Translation Strings

Always create translation strings via the API when creating new strings not already available. Do not hardcode text strings in the application - they must be registered in the translation system to support multi-language functionality.

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
