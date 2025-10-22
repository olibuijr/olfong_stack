#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Ölföng E2E Test Suite\n');

// Test categories in order of execution
const testCategories = [
  {
    name: 'Authentication',
    path: 'e2e/auth/',
    description: 'Login, logout, and authentication flows'
  },
  {
    name: 'Admin Settings',
    path: 'e2e/admin/admin-settings.spec.ts',
    description: 'Admin settings management (General, Business, VAT, API Keys, Payment)'
  },
  {
    name: 'Shipping Management',
    path: 'e2e/admin/shipping-management.spec.ts',
    description: 'Shipping options CRUD operations'
  },
  {
    name: 'Age Restrictions',
    path: 'e2e/admin/age-restriction.spec.ts',
    description: 'Age restriction configuration and validation'
  },
  {
    name: 'Product Management',
    path: 'e2e/admin/product-management.spec.ts',
    description: 'Admin product CRUD operations'
  },
  {
    name: 'User Experience',
    path: 'e2e/user/user-experience.spec.ts',
    description: 'User-facing features and navigation'
  },
  {
    name: 'Product Browsing',
    path: 'e2e/products/',
    description: 'Product catalog and search functionality'
  },
  {
    name: 'Cart Management',
    path: 'e2e/cart/',
    description: 'Shopping cart operations'
  },
  {
    name: 'Checkout Process',
    path: 'e2e/checkout/',
    description: 'Order checkout and payment flow'
  },
  {
    name: 'Real-time Features',
    path: 'e2e/realtime/',
    description: 'Live updates and notifications'
  }
];

function runTest(testPath, testName) {
  console.log(`\n📋 Running ${testName}...`);

  try {
    const command = `npx playwright test ${testPath} --reporter=line`;
    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname)
    });
    console.log(`✅ ${testName} completed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ ${testName} failed`);
    return false;
  }
}

function generateReport() {
  console.log('\n📊 Generating test report...');

  try {
    execSync('npx playwright show-report', {
      stdio: 'inherit',
      cwd: path.join(__dirname)
    });
  } catch (error) {
    console.log('Report generation completed');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all') || args.length === 0;
  const specificTest = args.find(arg => !arg.startsWith('--'));

  console.log('🎯 Ölföng E2E Test Runner');
  console.log('========================\n');

  // Check if services are running
  console.log('🔍 Checking service health...');
  try {
    // Simple health check - you might want to enhance this
    console.log('✅ Services check passed (implement actual health checks as needed)\n');
  } catch (error) {
    console.log('❌ Services not ready. Please start the development servers first.');
    process.exit(1);
  }

  let passedTests = 0;
  let totalTests = 0;

  if (runAll) {
    console.log('🎯 Running all test categories...\n');

    for (const category of testCategories) {
      totalTests++;

      // Check if test file exists
      const testPath = path.join(__dirname, category.path);
      if (!fs.existsSync(testPath) && !fs.existsSync(testPath.replace('.spec.ts', '.spec.js'))) {
        console.log(`⚠️  Skipping ${category.name} - test file not found`);
        continue;
      }

      const success = runTest(category.path, category.name);
      if (success) passedTests++;
    }
  } else if (specificTest) {
    const category = testCategories.find(cat =>
      cat.name.toLowerCase().includes(specificTest.toLowerCase()) ||
      cat.path.includes(specificTest)
    );

    if (category) {
      totalTests = 1;
      const testPath = path.join(__dirname, category.path);
      if (fs.existsSync(testPath) || fs.existsSync(testPath.replace('.spec.ts', '.spec.js'))) {
        const success = runTest(category.path, category.name);
        if (success) passedTests++;
      } else {
        console.log(`❌ Test file not found: ${category.path}`);
      }
    } else {
      console.log(`❌ Test category not found: ${specificTest}`);
      console.log('\nAvailable test categories:');
      testCategories.forEach(cat => {
        console.log(`  - ${cat.name}: ${cat.description}`);
      });
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  node test-runner.js --all              # Run all tests');
    console.log('  node test-runner.js "Test Name"        # Run specific test category');
    console.log('\nAvailable test categories:');
    testCategories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description}`);
    });
    return;
  }

  // Summary
  console.log('\n📈 Test Summary');
  console.log('===============');
  console.log(`Total: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }

  // Generate report
  if (args.includes('--report')) {
    generateReport();
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});