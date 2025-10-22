const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDefaultSettings() {
  console.log('🌱 Initializing default settings...');

  const defaultSettings = [
    // API Keys
    {
      key: 'UNSPLASH_ACCESS_KEY',
      value: '',
      description: 'Unsplash API access key for image search',
      category: 'API_KEYS',
      isEncrypted: true,
      isPublic: false
    },
    {
      key: 'PEXELS_API_KEY',
      value: '',
      description: 'Pexels API key for image search',
      category: 'API_KEYS',
      isEncrypted: true,
      isPublic: false
    },
    {
      key: 'PIXABAY_API_KEY',
      value: '',
      description: 'Pixabay API key for image search',
      category: 'API_KEYS',
      isEncrypted: true,
      isPublic: false
    },
    {
      key: 'GOOGLE_API_KEY',
      value: '',
      description: 'Google Custom Search API key',
      category: 'API_KEYS',
      isEncrypted: true,
      isPublic: false
    },
    {
      key: 'GOOGLE_SEARCH_ENGINE_ID',
      value: '',
      description: 'Google Custom Search Engine ID',
      category: 'API_KEYS',
      isEncrypted: false,
      isPublic: false
    },
    // General Settings
    {
      key: 'SITE_NAME',
      value: 'Ölföng',
      description: 'Site name',
      category: 'GENERAL',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'SITE_DESCRIPTION',
      value: 'Icelandic wine and beer shop with home delivery',
      description: 'Site description',
      category: 'GENERAL',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'CONTACT_EMAIL',
      value: 'info@olfong.is',
      description: 'Contact email address',
      category: 'GENERAL',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'CONTACT_PHONE',
      value: '+354 555 1234',
      description: 'Contact phone number',
      category: 'GENERAL',
      isEncrypted: false,
      isPublic: true
    },
    // Business Settings
    {
      key: 'openingHours',
      value: JSON.stringify({
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '12:00', close: '24:00', closed: false },
        sunday: { open: '12:00', close: '24:00', closed: false }
      }),
      description: 'Store opening hours',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'deliveryEnabled',
      value: 'true',
      description: 'Delivery service enabled',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'deliveryFee',
      value: '500',
      description: 'Delivery fee',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'freeDeliveryThreshold',
      value: '5000',
      description: 'Free delivery threshold',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'deliveryRadius',
      value: '50',
      description: 'Delivery radius',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'ageRestrictionEnabled',
      value: 'true',
      description: 'Age restriction enabled',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'nicotineAge',
      value: '18',
      description: 'Minimum age for nicotine products',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'alcoholNicotineAge',
      value: '20',
      description: 'Minimum age for alcohol and nicotine products',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'generalProductsAge',
      value: '0',
      description: 'Minimum age for general products',
      category: 'BUSINESS',
      isEncrypted: false,
      isPublic: true
    },
    // VAT Settings
    {
      key: 'vatEnabled',
      value: 'true',
      description: 'VAT enabled',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'vatRate',
      value: '24',
      description: 'VAT rate',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'vatCountry',
      value: 'IS',
      description: 'VAT country',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'vatDisplayInAdmin',
      value: 'true',
      description: 'Show VAT in admin',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'vatIncludeInCustomerPrice',
      value: 'true',
      description: 'Include VAT in customer price',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    },
    {
      key: 'vatShowBreakdown',
      value: 'true',
      description: 'Show VAT breakdown',
      category: 'VAT',
      isEncrypted: false,
      isPublic: true
    }
  ];

  try {
    const results = [];

    for (const settingData of defaultSettings) {
      const setting = await prisma.setting.upsert({
        where: { key: settingData.key },
        update: settingData,
        create: settingData
      });

      results.push(setting);
      console.log(`✅ Initialized setting: ${setting.key}`);
    }

    console.log(`🎉 Successfully initialized ${results.length} default settings!`);
  } catch (error) {
    console.error('❌ Error initializing default settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization function
if (require.main === module) {
  initializeDefaultSettings()
    .then(() => {
      console.log('✅ Default settings initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Default settings initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDefaultSettings };