import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { logTestStep } from '../../fixtures/test-utils';

test.describe('Shipping API Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    logTestStep('Setting up authentication for API tests');

    // Login to get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: testUsers.admin.username,
        password: testUsers.admin.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token || loginData.data?.token;

    expect(authToken).toBeTruthy();
    logTestStep('Authentication successful');
  });

  test('should get active shipping options', async ({ request }) => {
    logTestStep('Testing GET active shipping options API');

    const response = await request.get('/api/shipping/active', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThanOrEqual(2); // At least default options

    // Verify default options are present
    const homeDelivery = data.data.find((option: any) => option.name === 'Home Delivery');
    const storePickup = data.data.find((option: any) => option.name === 'Store Pickup');

    expect(homeDelivery).toBeTruthy();
    expect(storePickup).toBeTruthy();
    expect(homeDelivery.fee).toBe(500);
    expect(storePickup.fee).toBe(0);

    logTestStep('Active shipping options API test completed');
  });

  test('should get all shipping options', async ({ request }) => {
    logTestStep('Testing GET all shipping options API');

    const response = await request.get('/api/shipping', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(Array.isArray(data.data)).toBeTruthy();

    // Each option should have required fields
    data.data.forEach((option: any) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('name');
      expect(option).toHaveProperty('nameIs');
      expect(option).toHaveProperty('fee');
      expect(option).toHaveProperty('type');
      expect(option).toHaveProperty('isActive');
    });

    logTestStep('All shipping options API test completed');
  });

  test('should create shipping option with validation', async ({ request }) => {
    logTestStep('Testing POST create shipping option API');

    const testData = {
      name: `API Test Shipping ${Date.now()}`,
      nameIs: `API Prufu Sending ${Date.now()}`,
      fee: 750,
      type: 'DELIVERY',
      estimatedDays: 2
    };

    const response = await request.post('/api/shipping', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: testData
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.data).toHaveProperty('id');
    expect(data.data.name).toBe(testData.name);
    expect(data.data.fee).toBe(testData.fee);

    // Clean up - delete the test option
    const deleteResponse = await request.delete(`/api/shipping/${data.data.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(deleteResponse.ok()).toBeTruthy();

    logTestStep('Create shipping option API test completed');
  });

  test('should validate shipping option creation', async ({ request }) => {
    logTestStep('Testing shipping option creation validation');

    // Test missing required fields
    const invalidData = {
      name: '', // Empty name should fail
      fee: -100 // Negative fee should fail
    };

    const response = await request.post('/api/shipping', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: invalidData
    });

    // Should return validation error
    expect(response.status()).toBe(400);

    logTestStep('Shipping option validation test completed');
  });

  test('should update shipping option', async ({ request }) => {
    logTestStep('Testing PUT update shipping option API');

    // First create a test option
    const createResponse = await request.post('/api/shipping', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: `Update Test ${Date.now()}`,
        nameIs: `Uppfærslu Prufa ${Date.now()}`,
        fee: 300,
        type: 'DELIVERY'
      }
    });

    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    const optionId = createData.data.id;

    // Update the option
    const updateData = {
      name: `Updated Test ${Date.now()}`,
      fee: 400
    };

    const updateResponse = await request.put(`/api/shipping/${optionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: updateData
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updateResult = await updateResponse.json();

    expect(updateResult.data.name).toBe(updateData.name);
    expect(updateResult.data.fee).toBe(updateData.fee);

    // Clean up
    await request.delete(`/api/shipping/${optionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    logTestStep('Update shipping option API test completed');
  });

  test('should toggle shipping option active status', async ({ request }) => {
    logTestStep('Testing PATCH toggle shipping option API');

    // First create a test option
    const createResponse = await request.post('/api/shipping', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: `Toggle Test ${Date.now()}`,
        nameIs: `Toggle Prufa ${Date.now()}`,
        fee: 200,
        type: 'DELIVERY'
      }
    });

    const createData = await createResponse.json();
    const optionId = createData.data.id;

    // Toggle to inactive
    const toggleResponse = await request.patch(`/api/shipping/${optionId}/toggle`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: { isEnabled: false }
    });

    expect(toggleResponse.ok()).toBeTruthy();

    // Verify it's inactive in active options list
    const activeResponse = await request.get('/api/shipping/active', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const activeData = await activeResponse.json();
    const isInActiveList = activeData.data.some((option: any) => option.id === optionId);
    expect(isInActiveList).toBe(false);

    // Clean up
    await request.delete(`/api/shipping/${optionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    logTestStep('Toggle shipping option API test completed');
  });

  test('should handle unauthorized access', async ({ request }) => {
    logTestStep('Testing unauthorized access to shipping API');

    // Try to access without auth token
    const response = await request.get('/api/shipping');
    expect(response.status()).toBe(401);

    // Try to create without auth token
    const createResponse = await request.post('/api/shipping', {
      data: { name: 'Unauthorized Test' }
    });
    expect(createResponse.status()).toBe(401);

    logTestStep('Unauthorized access test completed');
  });
});