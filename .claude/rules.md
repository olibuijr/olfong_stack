# Project Rules

## URL Configuration - CRITICAL OVERRIDE

**ALL frontend and backend services MUST use `https://olfong.olibuijr.com` as the base URL:**
- Frontend (React): Available at `https://olfong.olibuijr.com`
- Backend API: Available at `https://olfong.olibuijr.com/api`
- Media/Uploads: Served through `https://olfong.olibuijr.com`

**NEVER use localhost, 127.0.0.1, or any other hostname.** This rule overrides any other configuration that references different hostnames or ports.

When encountering code with localhost or other hostnames, update to use `https://olfong.olibuijr.com` instead.

## MCP Servers - NEVER USE

**Do NOT use MCP servers (e.g., Playwright MCP browser automation) under any circumstances.**

- Only use E2E tests with Playwright via `npx playwright test`
- Never use browser automation through MCP tools like `mcp__playwright__*`
- All testing and automation must be done through standard E2E test files
- Configuration files: `/web-tests/playwright.config.ts`
- Test files location: `/web-tests/e2e/**/*.spec.ts`

This keeps testing consistent, reproducible, and follows standard CI/CD practices.

## Development Workflow - Incremental & Self-Healing

**CRITICAL: Follow this workflow for maximum efficiency and reliability:**

### 1. Incremental Development
- Build features in small, testable increments
- Don't try to build everything at once - work step by step
- Each increment should be functional and testable on its own
- Commit working increments frequently

### 2. Test As You Go
- Write code → Write tests → Run tests → Fix issues immediately
- **Never wait until the end to test** - test each piece as it's built
- Run tests after each increment to catch issues early
- Use test failures as immediate feedback to guide fixes

### 3. Self-Healing Approach
- When tests fail, **automatically analyze and fix the errors**
- Read error messages carefully and fix the root cause
- Re-run tests after fixes to verify the solution works
- Iterate quickly: fix → test → fix → test until all tests pass
- Don't ask for permission to fix test failures - just fix them

### 4. Fast Iteration Cycle
The ideal workflow is:
1. Look up documentation (use Context7)
2. Write a small increment of code
3. Write tests for that increment
4. Run tests
5. If tests fail: analyze errors → fix code → re-run tests
6. If tests pass: move to next increment
7. Repeat until feature is complete

### 5. Efficiency Through Testing
- Tests save time by catching issues immediately
- Self-healing through automated test-fix cycles is faster than manual debugging
- Each passing test is proof the code works correctly
- Build confidence incrementally rather than hoping everything works at the end

**Goal: Make functionality work as fast as possible through rapid iteration and automatic error correction.**

## Context7 - Always Look Up Documentation First

**CRITICAL: Before writing any code for a requested framework or feature, ALWAYS use Context7 to look up the latest documentation and best practices.**

- Use Context7 to fetch up-to-date API references, examples, and documentation
- Include "use context7" in your internal process when researching frameworks, libraries, or features
- Verify current syntax, methods, and patterns before implementing
- Check for deprecated features or breaking changes in newer versions
- This ensures code is using the latest, correct approaches rather than outdated patterns

**How to use Context7:**
- Simply mention "use context7" when you need to look up documentation
- Context7 provides version-specific API references from official sources
- Always prioritize Context7 documentation over knowledge cutoff information

**Fallback Strategy:**
- **If Context7 lookup fails**, immediately fall back to WebSearch
- Search for official documentation, API references, and best practices
- Prioritize official docs (e.g., "React official docs 2025", "Playwright API reference 2025")
- Use web search results to get the same up-to-date information Context7 would provide
- Never skip the documentation lookup step - always try Context7 first, then WebSearch if needed

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

## E2E Testing

When asked to fix or implement a feature, **ALWAYS provide both the code implementation and Playwright e2e tests** unless explicitly told otherwise.

- Write comprehensive e2e tests that verify the feature works correctly
- Run the tests to ensure they pass: `npx playwright test`
- Include tests as part of the feature delivery, not as an afterthought
- Tests should cover the main user flows and edge cases for the feature
- Never use Playwright MCP browser automation - only use standard E2E tests

### Debugging E2E Test Failures

When E2E tests fail, **ALWAYS check the process manager logs** for backend or frontend errors:

```bash
./process-manager.sh logs backend | tail -100
./process-manager.sh logs frontend | tail -100
```

This helps identify:
- Backend API errors that caused the failure
- Frontend rendering or state issues
- Missing translations or configuration
- Database connection problems
- Service communication issues

Always correlate test failures with process logs to identify root causes before fixing tests.

### Test Files Location

- **Playwright Config**: `/web-tests/playwright.config.ts`
- **E2E Tests Root**: `/web-tests/e2e/`
- **Admin Tests**: `/web-tests/e2e/admin/` (includes ATVR import, products, media management)
- **Product Tests**: `/web-tests/e2e/products/`
- **Auth Tests**: `/web-tests/e2e/auth/`
- **Checkout Tests**: `/web-tests/e2e/checkout/`
- **User Tests**: `/web-tests/e2e/user/`
- **Integration Tests**: `/web-tests/e2e/integration/`
- **FLUX Image Generation Tests**: `/web-tests/e2e/admin/flux-image-generation.spec.ts`

### Test Execution & Reporting Rules

**CRITICAL: NEVER open browser reports. Always analyze test results programmatically.**

- After running tests with `npx playwright test`, analyze `/web-tests/test-results.json`
- Extract test failures and errors from the JSON report automatically
- Use the error messages and logs to identify and fix issues
- Self-heal: Fix code → Re-run tests → Verify → Repeat
- Never manually inspect HTML reports in browser
- Document final results in code comments or commit messages, not in browser
- Only mention test results in commit messages or code when necessary

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

Always use `psql` commands for all database operations on this project. The database connection details are stored in `backend/.env`:

- **Database**: `olfong_db`
- **User**: `olfong_user`
- **Password**: `olfong_password`
- **Host**: `localhost`
- **Port**: `5432`

### Running SQL Queries

Use the `PGPASSWORD` environment variable to avoid password prompts:

```bash
PGPASSWORD="olfong_password" psql -U olfong_user -d olfong_db -h localhost -c "SELECT * FROM \"Setting\" LIMIT 5;"
```

For multi-line queries or complex operations, use heredoc syntax:

```bash
PGPASSWORD="olfong_password" psql -U olfong_user -d olfong_db -h localhost <<EOF
SELECT key, value, category
FROM "Setting"
WHERE category = 'API_KEYS';
EOF
```

### Common Database Tasks

- **Query data**: Use `-c "SQL QUERY"` for single-line queries
- **List tables**: `\dt` in interactive mode or `-c "\dt"`
- **Describe table**: `\d "TableName"` or `-c "\d \"TableName\""`
- **Export data**: Use `-c "COPY (...) TO STDOUT"` with output redirection
- **Import data**: Use `COPY` commands or pipe SQL files

### Safety Notes

- Always use double quotes for table and column names (e.g., `"Setting"`, `"User"`)
- Use parameterized queries when possible to prevent SQL injection
- Prefer SELECT queries for data inspection
- Be cautious with UPDATE/DELETE operations - always include WHERE clauses

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

## API Integrations

### OpenRouter Integration

OpenRouter is integrated into the system to provide unified access to multiple AI models (GPT-4, Claude, Gemini, Llama, etc.) through a single API endpoint.

#### Configuration Location

The OpenRouter API key and model selection can be configured at:
- **Admin UI**: `https://olfong.olibuijr.com/admin/settings/api-keys`
- **Frontend Component**: `web/src/pages/admin/settings/ApiKeysSettings.jsx`

#### Database Settings

Two settings are stored in the `Setting` table under the `API_KEYS` category:

1. **`openrouter`** (API Key)
   - Category: `API_KEYS`
   - Encrypted: `true`
   - Public: `false`
   - Description: "OpenRouter API key for accessing multiple AI models"

2. **`openrouterModel`** (Selected Model)
   - Category: `API_KEYS`
   - Encrypted: `false`
   - Public: `false`
   - Description: "Selected OpenRouter model for AI operations"

#### Retrieving Settings in Code

To use OpenRouter in your backend code:

```javascript
// Get OpenRouter settings
const settings = await prisma.setting.findMany({
  where: {
    key: { in: ['openrouter', 'openrouterModel'] }
  }
});

const apiKey = settings.find(s => s.key === 'openrouter')?.value;
const model = settings.find(s => s.key === 'openrouterModel')?.value;
```

Or via the settings API endpoint:

```javascript
const response = await fetch('/api/settings?category=API_KEYS', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
const openrouterKey = data.data.settings.API_KEYS.find(s => s.key === 'openrouter')?.value;
const openrouterModel = data.data.settings.API_KEYS.find(s => s.key === 'openrouterModel')?.value;
```

#### Making OpenRouter API Calls

OpenRouter uses the OpenAI SDK-compatible format. Example usage:

```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://olfong.olibuijr.com', // Optional: for rankings
    'X-Title': 'Ölföng' // Optional: app name
  },
  body: JSON.stringify({
    model: model, // e.g., 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet'
    messages: [
      { role: 'user', content: 'Your prompt here' }
    ]
  })
});

const data = await response.json();
```

#### Available Models

The UI includes a refresh button that fetches available models from OpenRouter's API. Popular models include:
- `openai/gpt-4o` - GPT-4o
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet
- `anthropic/claude-3-opus` - Claude 3 Opus
- `google/gemini-pro` - Gemini Pro
- `meta-llama/llama-3-70b-instruct` - Llama 3 70B

#### UI Features

The ApiKeysSettings component includes:
- Password-masked API key input with show/hide toggle
- Model selection dropdown
- Refresh button to fetch latest models from OpenRouter
- Active/Inactive status indicator
- Links to OpenRouter documentation
- Individual save buttons for API key and model

#### Documentation

- OpenRouter Docs: https://openrouter.ai/docs
- Get API Key: https://openrouter.ai/keys
- Available Models: https://openrouter.ai/models
