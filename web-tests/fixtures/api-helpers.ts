import { APIRequestContext } from '@playwright/test';

export class ApiHelpers {
  constructor(private request: APIRequestContext) {}

  /**
   * Authenticate user and return token
   */
  async login(credentials: { username?: string; email?: string; password: string }) {
    const response = await this.request.post('/api/auth/login', {
      data: credentials,
    });
    const { token } = await response.json();
    return token;
  }

  /**
   * Create test product via API
   */
  async createTestProduct(productData: any, token: string) {
    return this.request.post('/api/products', {
      data: productData,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(token: string) {
    // Implementation for cleaning test data
  }
}