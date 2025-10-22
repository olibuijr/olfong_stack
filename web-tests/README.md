# Ölföng E2E Test Suite

Comprehensive end-to-end testing suite for the Ölföng e-commerce platform using Playwright.

## Test Categories

### Admin Tests
- **Admin Settings Management**: Tests for all admin settings pages (General, Business, VAT, API Keys, Payment Gateways, Shipping)
- **Shipping Management**: CRUD operations for shipping options
- **Age Restriction Management**: Configuration and validation of age restrictions
- **Product Management**: Admin product CRUD operations

### User Tests
- **User Experience**: Homepage, navigation, responsive design, language switching
- **Authentication**: Login, logout, user session management
- **Product Browsing**: Product catalog, search, product details
- **Cart Management**: Add to cart, cart operations
- **Checkout Process**: Order placement and payment flow
- **Real-time Features**: Live updates and notifications

## Quick Start

### Prerequisites
- Node.js 16+
- Running backend and frontend servers
- Playwright browsers installed

### Installation
```bash
cd web-tests
npm install
npm run install-browsers
```

### Running Tests

#### Run All Tests
```bash
npm test
# or
npm run test:runner -- --all
```

#### Run Specific Test Categories
```bash
# Admin tests
npm run test:admin

# User experience tests
npm run test:user

# Authentication tests
npm run test:auth

# Cart tests
npm run test:cart

# Using the test runner
node test-runner.js "Admin Settings"
node test-runner.js "Shipping Management"
node test-runner.js "User Experience"
```

#### Development Mode
```bash
# Run tests in headed mode (visible browser)
npm run test:headed

# Debug mode
npm run test:debug

# UI mode (Playwright Test UI)
npm run test:ui
```

## Test Configuration

### Test Data
Test users and data are defined in `fixtures/test-data.ts`:
- Admin user: `admin` / `admin`
- Test customer: `test@example.com` / `password123`
- Delivery user: `delivery1` / `delivery123`

### Test Utilities
Enhanced test utilities in `fixtures/test-utils.ts`:
- Smart element waiting with multiple selectors
- Retry mechanisms for flaky operations
- Enhanced click and typing functions
- Service health checks

### Playwright Configuration
- Base URL: `http://localhost:3001` (frontend)
- Backend URL: `http://localhost:5000` (API)
- Automatic server startup/teardown
- Cross-browser testing (Chromium, Firefox)
- Screenshot and video capture on failures

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { waitForElement, clickElement, typeText, logTestStep } from '../../fixtures/test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (login, navigation, etc.)
  });

  test('should perform specific action', async ({ page }) => {
    logTestStep('Starting test action');

    // Test implementation
    await clickElement(page, ['selector1', 'selector2']);
    await typeText(page, ['input-selector'], 'test data');

    // Assertions
    await expect(page.locator('result-selector')).toBeVisible();

    logTestStep('Test action completed');
  });
});
```

### Best Practices
- Use `logTestStep()` for clear test logging
- Prefer `waitForElement()` and `clickElement()` over direct Playwright methods
- Use multiple selectors for resilience: `['primary-selector', 'fallback-selector']`
- Test both success and error scenarios
- Include proper cleanup in `afterEach` if needed

## Test Reports

### HTML Report
```bash
npm run report
# or
npx playwright show-report
```

### JSON Report
Test results are automatically saved to `test-results.json`

## Troubleshooting

### Common Issues

1. **Services not running**
   ```bash
   # Start backend
   cd backend && npm run dev

   # Start frontend
   cd web && npm run dev
   ```

2. **Browser installation**
   ```bash
   npm run install-browsers
   ```

3. **Test timeouts**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Ensure services are responsive

4. **Flaky tests**
   - Use retry mechanisms in test utilities
   - Add proper wait conditions
   - Check for race conditions

### Debug Mode
```bash
# Run specific test in debug mode
npx playwright test e2e/admin/admin-settings.spec.ts --debug

# Run with headed browser
npx playwright test --headed --grep "specific test name"
```

## CI/CD Integration

The test suite is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    cd web-tests
    npm ci
    npm run install-browsers
    npm test
```

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Add appropriate test data to `fixtures/test-data.ts`
3. Update this README if adding new test categories
4. Ensure tests are resilient and use the utility functions
5. Add proper logging with `logTestStep()`

## Test Coverage

Current test coverage includes:
- ✅ Admin settings management (all pages)
- ✅ Shipping options CRUD
- ✅ Age restriction configuration
- ✅ User authentication
- ✅ Product browsing
- ✅ Cart operations
- ✅ Checkout flow
- ✅ Real-time features
- ✅ Responsive design
- ✅ Multi-language support</content>
</xai:function_call">