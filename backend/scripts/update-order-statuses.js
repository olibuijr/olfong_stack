const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const translations = {
  'orders.statuses.PENDING': {
    en: 'Pending',
    is: 'Í bið'
  },
  'orders.statuses.CONFIRMED': {
    en: 'Confirmed',
    is: 'Staðfest'
  },
  'orders.statuses.PREPARING': {
    en: 'Preparing',
    is: 'Í undirbúningi'
  },
  'orders.statuses.OUT_FOR_DELIVERY': {
    en: 'Out for Delivery',
    is: 'Í dreifingu'
  },
  'orders.statuses.DELIVERED': {
    en: 'Delivered',
    is: 'Afhent'
  },
  'orders.statuses.CANCELLED': {
    en: 'Cancelled',
    is: 'Hætt við'
  }
};

async function updateTranslations() {
  try {
    console.log('Starting translation updates...');

    // First, login to get the token
    console.log('Authenticating...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✓ Authenticated successfully');
    console.log('Token:', token?.substring(0, 20) + '...');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    for (const [key, values] of Object.entries(translations)) {
      // Update English translation
      try {
        await axios.post(`${API_URL}/translations/upsert`, {
          key,
          value: values.en,
          locale: 'en'
        }, { headers });
        console.log(`✓ Updated ${key} (en)`);
      } catch (error) {
        console.error(`✗ Failed to update ${key} (en):`, error.response?.data || error.message);
      }

      // Update Icelandic translation
      try {
        await axios.post(`${API_URL}/translations/upsert`, {
          key,
          value: values.is,
          locale: 'is'
        }, { headers });
        console.log(`✓ Updated ${key} (is)`);
      } catch (error) {
        console.error(`✗ Failed to update ${key} (is):`, error.response?.data || error.message);
      }
    }

    console.log('\nTranslation updates completed!');
  } catch (error) {
    console.error('Error updating translations:', error.message);
  }
}

updateTranslations();
