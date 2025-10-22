const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@olfong.is',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      phone: '+3545551234',
    },
  });

  console.log('✅ Created admin user:', admin.username);

  // Create sample delivery person
  const deliveryPassword = await bcrypt.hash('delivery123', 10);
  
  const delivery = await prisma.user.upsert({
    where: { username: 'delivery1' },
    update: {},
    create: {
      username: 'delivery1',
      email: 'delivery@olfong.is',
      password: deliveryPassword,
      fullName: 'Jón Jónsson',
      role: 'DELIVERY',
      phone: '+3545551235',
    },
  });

  console.log('✅ Created delivery user:', delivery.username);

  // Create categories first - matching olfong.is structure
  const categories = [
    {
      name: 'WINE',
      nameIs: 'Vín',
      slug: 'vin',
      description: 'Wine products',
      descriptionIs: 'Vínvörur',
      icon: '🍷',
      sortOrder: 1
    },
    {
      name: 'BEER',
      nameIs: 'Bjór',
      slug: 'bjor',
      description: 'Beer products',
      descriptionIs: 'Bjórvörur',
      icon: '🍺',
      sortOrder: 2
    },
    {
      name: 'CIDER_RTD',
      nameIs: 'Síder & RTD',
      slug: 'sider-rtd',
      description: 'Cider and Ready-to-drink products',
      descriptionIs: 'Síder og tilbúin drykkir',
      icon: '🍻',
      sortOrder: 3
    },
    {
      name: 'SPIRITS',
      nameIs: 'Sterkt áfengi',
      slug: 'sterkt-afengi',
      description: 'Strong alcohol and spirits',
      descriptionIs: 'Sterkt áfengi og brennivín',
      icon: '🥃',
      sortOrder: 4
    },
    {
      name: 'NICOTINE',
      nameIs: 'Nikótínvörur',
      slug: 'nikotinvorur',
      description: 'Nicotine products',
      descriptionIs: 'Nikótínvörur',
      icon: '🚭',
      sortOrder: 5
    },
    {
      name: 'NON_ALCOHOLIC',
      nameIs: 'Óáfengir drykkir',
      slug: 'oafengt',
      description: 'Non-alcoholic drinks',
      descriptionIs: 'Óáfengir drykkir',
      icon: '🥤',
      sortOrder: 6
    },
    {
      name: 'OFFERS',
      nameIs: 'Tilboðin',
      slug: 'tilbodin',
      description: 'Special offers and deals',
      descriptionIs: 'Sérstök tilboð og afslættir',
      icon: '🏷️',
      sortOrder: 7
    },
    {
      name: 'FOOD',
      nameIs: 'Matur',
      slug: 'matur',
      description: 'Food and snacks',
      descriptionIs: 'Matur og snarl',
      icon: '🍕',
      sortOrder: 8
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Created categories');

  // Create subcategories for each main category
  const subcategories = [
    // Wine subcategories
    {
      name: 'WHITE_WINE',
      nameIs: 'Hvítvín',
      slug: 'hvitvin',
      description: 'White wine',
      descriptionIs: 'Hvítvín',
      icon: '🥂',
      sortOrder: 1,
      categoryName: 'WINE'
    },
    {
      name: 'RED_WINE',
      nameIs: 'Rauðvín',
      slug: 'raudvin',
      description: 'Red wine',
      descriptionIs: 'Rauðvín',
      icon: '🍷',
      sortOrder: 2,
      categoryName: 'WINE'
    },
    {
      name: 'SPARKLING_WINE',
      nameIs: 'Freyðivín',
      slug: 'freydivin',
      description: 'Sparkling wine',
      descriptionIs: 'Freyðivín',
      icon: '🍾',
      sortOrder: 3,
      categoryName: 'WINE'
    },
    {
      name: 'CHAMPAGNE',
      nameIs: 'Kampavín',
      slug: 'kampavin',
      description: 'Champagne',
      descriptionIs: 'Kampavín',
      icon: '🥂',
      sortOrder: 4,
      categoryName: 'WINE'
    },
    {
      name: 'YELLOW_WINE',
      nameIs: 'Gulvín',
      slug: 'gulvin',
      description: 'Yellow wine',
      descriptionIs: 'Gulvín',
      icon: '🍷',
      sortOrder: 5,
      categoryName: 'WINE'
    },
    {
      name: 'ROSE_WINE',
      nameIs: 'Rósavín',
      slug: 'rosavin',
      description: 'Rose wine',
      descriptionIs: 'Rósavín',
      icon: '🍷',
      sortOrder: 6,
      categoryName: 'WINE'
    },
    // Spirits subcategories
    {
      name: 'GIN',
      nameIs: 'Gin',
      slug: 'gin',
      description: 'Gin',
      descriptionIs: 'Gin',
      icon: '🥃',
      sortOrder: 1,
      categoryName: 'SPIRITS'
    },
    {
      name: 'COGNAC',
      nameIs: 'Koniak',
      slug: 'koniak',
      description: 'Cognac',
      descriptionIs: 'Koniak',
      icon: '🥃',
      sortOrder: 2,
      categoryName: 'SPIRITS'
    },
    {
      name: 'RUM',
      nameIs: 'Romm',
      slug: 'romm',
      description: 'Rum',
      descriptionIs: 'Romm',
      icon: '🥃',
      sortOrder: 3,
      categoryName: 'SPIRITS'
    },
    {
      name: 'LIQUEURS_SHOTS',
      nameIs: 'Líkjörar & Skot',
      slug: 'likjorar-skot',
      description: 'Liqueurs & Shots',
      descriptionIs: 'Líkjörar & Skot',
      icon: '🥃',
      sortOrder: 4,
      categoryName: 'SPIRITS'
    },
    {
      name: 'TEQUILA',
      nameIs: 'Tequila',
      slug: 'tequila',
      description: 'Tequila',
      descriptionIs: 'Tequila',
      icon: '🥃',
      sortOrder: 5,
      categoryName: 'SPIRITS'
    },
    {
      name: 'VODKA',
      nameIs: 'Vodka',
      slug: 'vodka',
      description: 'Vodka',
      descriptionIs: 'Vodka',
      icon: '🥃',
      sortOrder: 6,
      categoryName: 'SPIRITS'
    },
    {
      name: 'WHISKEY',
      nameIs: 'Viski',
      slug: 'viski',
      description: 'Whiskey',
      descriptionIs: 'Viski',
      icon: '🥃',
      sortOrder: 7,
      categoryName: 'SPIRITS'
    },
    // Nicotine subcategories
    {
      name: 'VAPE',
      nameIs: 'Veip',
      slug: 'veip',
      description: 'Vape products',
      descriptionIs: 'Veipvörur',
      icon: '💨',
      sortOrder: 1,
      categoryName: 'NICOTINE'
    },
    {
      name: 'NICOTINE_PADS',
      nameIs: 'Nikótínpúðar',
      slug: 'nikotinpudar',
      description: 'Nicotine pads',
      descriptionIs: 'Nikótínpúðar',
      icon: '🚭',
      sortOrder: 2,
      categoryName: 'NICOTINE'
    },
    // Non-alcoholic subcategories
    {
      name: 'SODA',
      nameIs: 'Gos',
      slug: 'gos',
      description: 'Soda drinks',
      descriptionIs: 'Gosdrykkir',
      icon: '🥤',
      sortOrder: 1,
      categoryName: 'NON_ALCOHOLIC'
    },
    {
      name: 'SOFT_DRINKS',
      nameIs: 'Sódavatn',
      slug: 'sodavatn',
      description: 'Soft drinks',
      descriptionIs: 'Sódavatn',
      icon: '🥤',
      sortOrder: 2,
      categoryName: 'NON_ALCOHOLIC'
    },
    {
      name: 'ENERGY_DRINKS',
      nameIs: 'Orkudrykkir',
      slug: 'orkudrykkir',
      description: 'Energy drinks',
      descriptionIs: 'Orkudrykkir',
      icon: '⚡',
      sortOrder: 3,
      categoryName: 'NON_ALCOHOLIC'
    },
    // Food subcategories
    {
      name: 'SNACKS',
      nameIs: 'Snarl',
      slug: 'snarl',
      description: 'Chips, crackers and savory snacks',
      descriptionIs: 'Flögur, kex og salt snarl',
      icon: '🍿',
      sortOrder: 1,
      categoryName: 'FOOD'
    },
    {
      name: 'CANDY',
      nameIs: 'Karamellur',
      slug: 'karamellur',
      description: 'Candy, chocolate and sweets',
      descriptionIs: 'Karamellur, súkkulaði og sælgæti',
      icon: '🍬',
      sortOrder: 2,
      categoryName: 'FOOD'
    },
    {
      name: 'NUTS',
      nameIs: 'Hnetur',
      slug: 'hnetur',
      description: 'Nuts, seeds and dried fruits',
      descriptionIs: 'Hnetur, fræ og þurrkað ávextir',
      icon: '🥜',
      sortOrder: 3,
      categoryName: 'FOOD'
    },
    {
      name: 'ENERGY_BARS',
      nameIs: 'Orkustangir',
      slug: 'orkustangir',
      description: 'Energy bars and protein snacks',
      descriptionIs: 'Orkustangir og próteín snarl',
      icon: '🍫',
      sortOrder: 4,
      categoryName: 'FOOD'
    },
    {
      name: 'READY_MEALS',
      nameIs: 'Tilbúnar máltíðir',
      slug: 'tilbunar-maltidir',
      description: 'Ready-to-eat meals and convenience food',
      descriptionIs: 'Tilbúnar máltíðir og hraðmatur',
      icon: '🍽️',
      sortOrder: 5,
      categoryName: 'FOOD'
    }
  ];

  // Create subcategories
  for (const subcategory of subcategories) {
    const category = await prisma.category.findUnique({ 
      where: { name: subcategory.categoryName } 
    });
    
    if (category) {
      await prisma.subcategory.upsert({
        where: { 
          categoryId_slug: {
            categoryId: category.id,
            slug: subcategory.slug
          }
        },
        update: {},
        create: {
          name: subcategory.name,
          nameIs: subcategory.nameIs,
          slug: subcategory.slug,
          description: subcategory.description,
          descriptionIs: subcategory.descriptionIs,
          icon: subcategory.icon,
          sortOrder: subcategory.sortOrder,
          categoryId: category.id
        }
      });
    }
  }

  console.log('✅ Created subcategories');

  // Get category IDs for reference
  const wineCategory = await prisma.category.findUnique({ where: { name: 'WINE' } });
  const beerCategory = await prisma.category.findUnique({ where: { name: 'BEER' } });
  const nicotineCategory = await prisma.category.findUnique({ where: { name: 'NICOTINE' } });
  const foodCategory = await prisma.category.findUnique({ where: { name: 'FOOD' } });

  // Create sample products - Wine
  const wines = [
    {
      name: 'Bordeaux Red Wine',
      nameIs: 'Bordeaux rauðvín',
      description: 'A classic French red wine with rich flavors',
      descriptionIs: 'Klassískt franskt rauðvín með ríkri bragðtegundum',
      categoryId: wineCategory.id,
      price: 4500,
      stock: 50,
      alcoholContent: 13.5,
      ageRestriction: 20,
    },
    {
      name: 'Chardonnay White Wine',
      nameIs: 'Chardonnay hvítvín',
      description: 'Crisp and refreshing white wine',
      descriptionIs: 'Hreint og hressandi hvítvín',
      categoryId: wineCategory.id,
      price: 3800,
      stock: 40,
      alcoholContent: 12.5,
      ageRestriction: 20,
      // ATVR fields for testing
      volume: '750 ml',
      country: 'France',
      producer: 'Domaine de la Côte',
      distributor: 'Vínbúðin',
      packaging: 'Glass bottle',
      foodPairings: ['Fiskur', 'Grænmetisréttir', 'Alifuglar'],
      specialAttributes: ['Organic', 'Award winning', 'Limited edition'],
      atvrProductId: '12345',
      atvrUrl: 'https://www.vinbudin.is/desktopdefault.aspx/tabid-54/?productID=12345',
      availability: 'available',
    },
    {
      name: 'Prosecco Sparkling',
      nameIs: 'Prosecco freyðivín',
      description: 'Italian sparkling wine, perfect for celebrations',
      descriptionIs: 'Ítalsk freyðivín, fullkomið fyrir hátíðir',
      categoryId: wineCategory.id,
      price: 3200,
      stock: 30,
      alcoholContent: 11.0,
      ageRestriction: 20,
    },
  ];

  // Create sample products - Beer
  const beers = [
    {
      name: 'Craft IPA',
      nameIs: 'Handverks IPA',
      description: 'Hoppy and bitter craft beer',
      descriptionIs: 'Humlað og beiskt handverksbjór',
      categoryId: beerCategory.id,
      price: 450,
      stock: 200,
      alcoholContent: 6.5,
      ageRestriction: 20,
    },
    {
      name: 'Pilsner Lager',
      nameIs: 'Pilsner Lager',
      description: 'Light and refreshing lager',
      descriptionIs: 'Létt og hressandi lager',
      categoryId: beerCategory.id,
      price: 380,
      stock: 300,
      alcoholContent: 4.8,
      ageRestriction: 20,
    },
    {
      name: 'Stout Dark Beer',
      nameIs: 'Stout dökkt bjór',
      description: 'Rich and creamy dark beer',
      descriptionIs: 'Ríkt og kremkennt dökkt bjór',
      categoryId: beerCategory.id,
      price: 520,
      stock: 150,
      alcoholContent: 7.2,
      ageRestriction: 20,
    },
  ];

  // Create sample products - Nicotine
  const nicotineProducts = [
    {
      name: 'Premium Nicotine Pouches - Mint',
      nameIs: 'Premium nikótínpokar - Mynta',
      description: 'Strong mint flavored nicotine pouches',
      descriptionIs: 'Sterkar myntuð nikótínpokar',
      categoryId: nicotineCategory.id,
      price: 890,
      stock: 100,
      nicotineContent: 12.0,
      ageRestriction: 18,
    },
    {
      name: 'Light Nicotine Pouches - Berry',
      nameIs: 'Létt nikótínpokar - Ber',
      description: 'Mild berry flavored nicotine pouches',
      descriptionIs: 'Vægur berjasmakandi nikótínpokar',
      categoryId: nicotineCategory.id,
      price: 790,
      stock: 120,
      nicotineContent: 6.0,
      ageRestriction: 18,
    },
  ];

  // Create sample products - Food
  const foodProducts = [
    {
      name: 'Classic Potato Chips',
      nameIs: 'Klassískar kartöfluflögur',
      description: 'Crispy salted potato chips',
      descriptionIs: 'Knarraðar saltuðu kartöfluflögur',
      categoryId: foodCategory.id,
      price: 450,
      stock: 200,
    },
    {
      name: 'Milk Chocolate Bar',
      nameIs: 'Mjólkursúkkulaðistöng',
      description: 'Smooth milk chocolate bar',
      descriptionIs: 'Mjúkur mjólkursúkkulaðistöng',
      categoryId: foodCategory.id,
      price: 350,
      stock: 150,
    },
    {
      name: 'Mixed Nuts',
      nameIs: 'Blandaðir hnetur',
      description: 'Assortment of almonds, cashews and walnuts',
      descriptionIs: 'Safn af möndlum, cashew og valhnetum',
      categoryId: foodCategory.id,
      price: 890,
      stock: 80,
    },
    {
      name: 'Energy Protein Bar',
      nameIs: 'Orku próteínstöng',
      description: 'High protein energy bar with nuts',
      descriptionIs: 'Há próteín orkustöng með hnetum',
      categoryId: foodCategory.id,
      price: 290,
      stock: 100,
    },
    {
      name: 'Instant Noodles',
      nameIs: 'Hraðnúðlur',
      description: 'Quick and easy instant noodles',
      descriptionIs: 'Hraðar og auðveldar hraðnúðlur',
      categoryId: foodCategory.id,
      price: 250,
      stock: 120,
    },
  ];

  // Insert all products
  for (const wine of wines) {
    await prisma.product.upsert({
      where: { id: wines.indexOf(wine) + 1 },
      update: {},
      create: wine,
    });
  }

  for (const beer of beers) {
    await prisma.product.upsert({
      where: { id: beers.indexOf(beer) + 4 },
      update: {},
      create: beer,
    });
  }

  for (const nicotine of nicotineProducts) {
    await prisma.product.upsert({
      where: { id: nicotineProducts.indexOf(nicotine) + 7 },
      update: {},
      create: nicotine,
    });
  }

  for (const food of foodProducts) {
    await prisma.product.create({
      data: food,
    });
  }

  console.log('✅ Created sample products');

  // Create shipping options
  const shippingOptions = [
    {
      name: 'Home Delivery',
      nameIs: 'Heimsending',
      description: 'Delivery to your doorstep within 1-2 business days',
      descriptionIs: 'Sending heim að dyrum þínum innan 1-2 virkra daga',
      type: 'delivery',
      fee: 2000,
      sortOrder: 1,
      estimatedDays: 2,
      cutoffTime: '14:00'
    },
    {
      name: 'Store Pickup',
      nameIs: 'Sækja í verslun',
      description: 'Pick up your order at our store location',
      descriptionIs: 'Sæktu pöntun þína í verslun okkar',
      type: 'pickup',
      fee: 0,
      sortOrder: 2,
      estimatedDays: 1
    }
  ];

  // Clear existing shipping options and recreate
  await prisma.shippingOption.deleteMany({});

  for (const option of shippingOptions) {
    await prisma.shippingOption.create({
      data: option,
    });
  }

  console.log('✅ Created shipping options');

  // Create demo customers
  const demoCustomers = [
    {
      username: 'demo_customer1',
      email: 'anna.johnson@example.com',
      password: await bcrypt.hash('demo123', 10),
      fullName: 'Anna Johnson',
      role: 'CUSTOMER',
      phone: '+3545551001',
      kennitala: '1234567890'
    },
    {
      username: 'demo_customer2',
      email: 'bjorn.andersson@example.com',
      password: await bcrypt.hash('demo123', 10),
      fullName: 'Björn Andersson',
      role: 'CUSTOMER',
      phone: '+3545551002',
      kennitala: '1234567891'
    },
    {
      username: 'demo_customer3',
      email: 'kristin.petersen@example.com',
      password: await bcrypt.hash('demo123', 10),
      fullName: 'Kristín Petersen',
      role: 'CUSTOMER',
      phone: '+3545551003',
      kennitala: '1234567892'
    },
    {
      username: 'demo_customer4',
      email: 'magnus.thorsteinsson@example.com',
      password: await bcrypt.hash('demo123', 10),
      fullName: 'Magnús Þorsteinsson',
      role: 'CUSTOMER',
      phone: '+3545551004',
      kennitala: '1234567893'
    },
    {
      username: 'demo_customer5',
      email: 'sara.gudmundsdottir@example.com',
      password: await bcrypt.hash('demo123', 10),
      fullName: 'Sara Guðmundsdóttir',
      role: 'CUSTOMER',
      phone: '+3545551005',
      kennitala: '1234567894'
    }
  ];

  for (const customer of demoCustomers) {
    await prisma.user.upsert({
      where: { username: customer.username },
      update: {},
      create: customer,
    });
  }

  // Create test customer for Playwright tests
  const testCustomerPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'test_customer',
      email: 'test@example.com',
      password: testCustomerPassword,
      fullName: 'Test Customer',
      role: 'CUSTOMER',
      phone: '+3545559999',
      kennitala: '9999999999'
    },
  });

  console.log('✅ Created demo customers and test customer');

  // Get demo customers for orders
  const customer1 = await prisma.user.findUnique({ where: { username: 'demo_customer1' } });
  const customer2 = await prisma.user.findUnique({ where: { username: 'demo_customer2' } });
  const customer3 = await prisma.user.findUnique({ where: { username: 'demo_customer3' } });
  const customer4 = await prisma.user.findUnique({ where: { username: 'demo_customer4' } });
  const customer5 = await prisma.user.findUnique({ where: { username: 'demo_customer5' } });

  // Get some products for orders
  const wine1 = await prisma.product.findFirst({ where: { categoryId: wineCategory.id } });
  const wine2 = await prisma.product.findFirst({ where: { categoryId: wineCategory.id, id: { not: wine1.id } } });
  const beer1 = await prisma.product.findFirst({ where: { categoryId: beerCategory.id } });
  const nicotine1 = await prisma.product.findFirst({ where: { categoryId: nicotineCategory.id } });
  const food1 = await prisma.product.findFirst({ where: { categoryId: foodCategory.id } });

  // Get shipping options
  const homeDelivery = await prisma.shippingOption.findFirst({ where: { type: 'delivery' } });
  const storePickup = await prisma.shippingOption.findFirst({ where: { type: 'pickup' } });

  // Create demo addresses
  const demoAddresses = [
    {
      userId: customer1.id,
      label: 'Home',
      street: 'Laugavegur 1',
      city: 'Reykjavík',
      postalCode: '101',
      country: 'Iceland',
      isDefault: true
    },
    {
      userId: customer2.id,
      label: 'Work',
      street: 'Austurstræti 15',
      city: 'Reykjavík',
      postalCode: '101',
      country: 'Iceland',
      isDefault: true
    },
    {
      userId: customer3.id,
      label: 'Home',
      street: 'Skólavörðustígur 8',
      city: 'Reykjavík',
      postalCode: '105',
      country: 'Iceland',
      isDefault: true
    },
    {
      userId: customer4.id,
      label: 'Home',
      street: 'Hverfisgata 22',
      city: 'Reykjavík',
      postalCode: '107',
      country: 'Iceland',
      isDefault: true
    },
    {
      userId: customer5.id,
      label: 'Home',
      street: 'Freyjugata 5',
      city: 'Reykjavík',
      postalCode: '101',
      country: 'Iceland',
      isDefault: true
    }
  ];

  for (const address of demoAddresses) {
    await prisma.address.create({
      data: address,
    });
  }

  console.log('✅ Created demo addresses');

  // Create demo orders
  const demoOrders = [
    {
      orderNumber: 'OLF-2025-001',
      userId: customer1.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer1.id } })).id,
      shippingOptionId: homeDelivery.id,
      status: 'DELIVERED',
      totalAmount: 2850,
      deliveryFee: 2000,
      notes: 'Please ring doorbell twice',
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      orderNumber: 'OLF-2025-002',
      userId: customer2.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer2.id } })).id,
      shippingOptionId: storePickup.id,
      status: 'COMPLETED',
      totalAmount: 890,
      deliveryFee: 0,
      pickupTime: '18:00',
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      orderNumber: 'OLF-2025-003',
      userId: customer3.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer3.id } })).id,
      shippingOptionId: homeDelivery.id,
      status: 'OUT_FOR_DELIVERY',
      totalAmount: 1520,
      deliveryFee: 2000,
      notes: 'Fragile items - handle with care',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    },
    {
      orderNumber: 'OLF-2025-004',
      userId: customer4.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer4.id } })).id,
      shippingOptionId: homeDelivery.id,
      status: 'PREPARING',
      totalAmount: 2340,
      deliveryFee: 2000,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      orderNumber: 'OLF-2025-005',
      userId: customer5.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer5.id } })).id,
      shippingOptionId: storePickup.id,
      status: 'PENDING',
      totalAmount: 650,
      deliveryFee: 0,
      pickupTime: '16:30',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    },
    {
      orderNumber: 'OLF-2025-006',
      userId: customer1.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer1.id } })).id,
      shippingOptionId: homeDelivery.id,
      status: 'CONFIRMED',
      totalAmount: 1890,
      deliveryFee: 2000,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
    {
      orderNumber: 'OLF-2025-007',
      userId: customer2.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer2.id } })).id,
      shippingOptionId: homeDelivery.id,
      status: 'CANCELLED',
      totalAmount: 1200,
      deliveryFee: 2000,
      notes: 'Customer requested cancellation',
    },
    {
      orderNumber: 'OLF-2025-008',
      userId: customer3.id,
      addressId: (await prisma.address.findFirst({ where: { userId: customer3.id } })).id,
      shippingOptionId: storePickup.id,
      status: 'DELIVERED',
      totalAmount: 780,
      deliveryFee: 0,
      pickupTime: '17:00',
      estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  ];

  for (const order of demoOrders) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order,
    });
  }

  console.log('✅ Created demo orders');

  // Create demo order items
  const order1 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-001' } });
  const order2 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-002' } });
  const order3 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-003' } });
  const order4 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-004' } });
  const order5 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-005' } });
  const order6 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-006' } });
  const order7 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-007' } });
  const order8 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-008' } });

  const demoOrderItems = [
    // Order 1 - Wine and snacks
    { orderId: order1.id, productId: wine1.id, quantity: 2, price: wine1.price },
    { orderId: order1.id, productId: food1.id, quantity: 1, price: food1.price },

    // Order 2 - Beer
    { orderId: order2.id, productId: beer1.id, quantity: 4, price: beer1.price },

    // Order 3 - Wine and nicotine
    { orderId: order3.id, productId: wine2.id, quantity: 1, price: wine2.price },
    { orderId: order3.id, productId: nicotine1.id, quantity: 1, price: nicotine1.price },

    // Order 4 - Mixed items
    { orderId: order4.id, productId: wine1.id, quantity: 1, price: wine1.price },
    { orderId: order4.id, productId: beer1.id, quantity: 2, price: beer1.price },
    { orderId: order4.id, productId: food1.id, quantity: 1, price: food1.price },

    // Order 5 - Food only
    { orderId: order5.id, productId: food1.id, quantity: 2, price: food1.price },

    // Order 6 - Wine collection
    { orderId: order6.id, productId: wine1.id, quantity: 3, price: wine1.price },
    { orderId: order6.id, productId: wine2.id, quantity: 1, price: wine2.price },

    // Order 7 - Cancelled order
    { orderId: order7.id, productId: beer1.id, quantity: 6, price: beer1.price },

    // Order 8 - Nicotine products
    { orderId: order8.id, productId: nicotine1.id, quantity: 2, price: nicotine1.price }
  ];

  for (const item of demoOrderItems) {
    await prisma.orderItem.create({
      data: item,
    });
  }

  console.log('✅ Created demo order items');

  // Seed payment gateways
  console.log('🌱 Seeding payment gateways...');
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/seedPaymentGateways.js', { stdio: 'inherit' });
    console.log('✅ Payment gateways seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error.message);
  }

  // Create default receipt settings
  try {
    await prisma.receiptSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        companyName: 'Ölföng',
        companyNameIs: 'Ölföng',
        companyAddress: 'Reykjavík, Iceland',
        companyAddressIs: 'Reykjavík, Ísland',
        companyPhone: '+354 555 1234',
        companyEmail: 'info@olfong.is',
        companyWebsite: 'www.olfong.is',
        taxId: '1234567890',
        headerColor: '#1e40af',
        accentColor: '#3b82f6',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        footerText: 'Thank you for your business!',
        footerTextIs: 'Takk fyrir viðskiptin!',
        showBarcode: true,
        showQrCode: true,
        template: 'modern',
        paperSize: '80mm'
      }
    });
    console.log('✅ Default receipt settings created');
  } catch (error) {
    console.error('❌ Error creating receipt settings:', error.message);
  }

  // Create default SMTP settings (disabled by default)
  try {
    await prisma.sMTPSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        username: '',
        password: '',
        fromEmail: 'noreply@olfong.is',
        fromName: 'Ölföng',
        fromNameIs: 'Ölföng',
        isEnabled: false
      }
    });
    console.log('✅ Default SMTP settings created');
  } catch (error) {
    console.error('❌ Error creating SMTP settings:', error.message);
  }

  // Seed essential translations
  console.log('🌐 Seeding essential translations...');
  
  const essentialTranslations = [
    // Navigation translations
    { key: 'navigation.home', section: 'navigation', language: 'en', value: 'Home' },
    { key: 'navigation.home', section: 'navigation', language: 'is', value: 'Heim' },
    { key: 'navigation.shop', section: 'navigation', language: 'en', value: 'Shop' },
    { key: 'navigation.shop', section: 'navigation', language: 'is', value: 'Verslun' },
    { key: 'navigation.wine', section: 'navigation', language: 'en', value: 'Wine' },
    { key: 'navigation.wine', section: 'navigation', language: 'is', value: 'Vín' },
    { key: 'navigation.beer', section: 'navigation', language: 'en', value: 'Beer' },
    { key: 'navigation.beer', section: 'navigation', language: 'is', value: 'Bjór' },
    { key: 'navigation.delivery', section: 'navigation', language: 'en', value: 'Delivery' },
    { key: 'navigation.delivery', section: 'navigation', language: 'is', value: 'Afhending' },
    { key: 'navigation.profile', section: 'navigation', language: 'en', value: 'Profile' },
    { key: 'navigation.profile', section: 'navigation', language: 'is', value: 'Prófíll' },
    { key: 'navigation.cart', section: 'navigation', language: 'en', value: 'Cart' },
    { key: 'navigation.cart', section: 'navigation', language: 'is', value: 'Körfu' },
    { key: 'navigation.login', section: 'navigation', language: 'en', value: 'Login' },
    { key: 'navigation.login', section: 'navigation', language: 'is', value: 'Innskráning' },
    { key: 'navigation.logout', section: 'navigation', language: 'en', value: 'Logout' },
    { key: 'navigation.logout', section: 'navigation', language: 'is', value: 'Útskráning' },
    { key: 'navigation.needHelp', section: 'navigation', language: 'en', value: 'Need Help' },
    { key: 'navigation.needHelp', section: 'navigation', language: 'is', value: 'Þarftu hjálp' },
    { key: 'navigation.contactUs', section: 'navigation', language: 'en', value: 'Contact Us' },
    { key: 'navigation.contactUs', section: 'navigation', language: 'is', value: 'Hafðu samband' },
    { key: 'navigation.discoverCategories', section: 'navigation', language: 'en', value: 'Discover Categories' },
    { key: 'navigation.discoverCategories', section: 'navigation', language: 'is', value: 'Uppgötva flokka' },
    { key: 'navigation.viewAllProducts', section: 'navigation', language: 'en', value: 'View All Products' },
    { key: 'navigation.viewAllProducts', section: 'navigation', language: 'is', value: 'Skoða allar vörur' },

    // Products page translations
    { key: 'productsPage.all', section: 'productsPage', language: 'en', value: 'All' },
    { key: 'productsPage.all', section: 'productsPage', language: 'is', value: 'Allt' },
    { key: 'productsPage.products', section: 'productsPage', language: 'en', value: 'Products' },
    { key: 'productsPage.products', section: 'productsPage', language: 'is', value: 'Vörur' },
    { key: 'productsPage.noProductsFound', section: 'productsPage', language: 'en', value: 'No products found' },
    { key: 'productsPage.noProductsFound', section: 'productsPage', language: 'is', value: 'Engar vörur fundust' },
    { key: 'productsPage.priceRange', section: 'productsPage', language: 'en', value: 'Price Range' },
    { key: 'productsPage.priceRange', section: 'productsPage', language: 'is', value: 'Verðsvið' },
    { key: 'productsPage.alcoholVolume', section: 'productsPage', language: 'en', value: 'Alcohol Volume' },
    { key: 'productsPage.alcoholVolume', section: 'productsPage', language: 'is', value: 'Áfengismagn' },
    { key: 'productsPage.sortByNameDesc', section: 'productsPage', language: 'en', value: 'Sort by name descending' },
    { key: 'productsPage.sortByNameDesc', section: 'productsPage', language: 'is', value: 'Raða eftir nafni lækkandi' },
    { key: 'productsPage.sortByPriceAsc', section: 'productsPage', language: 'en', value: 'Sort by price ascending' },
    { key: 'productsPage.sortByPriceAsc', section: 'productsPage', language: 'is', value: 'Raða eftir verði hækkandi' },
    { key: 'productsPage.sortByPriceDesc', section: 'productsPage', language: 'en', value: 'Sort by price descending' },
    { key: 'productsPage.sortByPriceDesc', section: 'productsPage', language: 'is', value: 'Raða eftir verði lækkandi' },
    { key: 'productsPage.sortByAlcoholAsc', section: 'productsPage', language: 'en', value: 'Sort by alcohol ascending' },
    { key: 'productsPage.sortByAlcoholAsc', section: 'productsPage', language: 'is', value: 'Raða eftir áfengi hækkandi' },
    { key: 'productsPage.sortByAlcoholDesc', section: 'productsPage', language: 'en', value: 'Sort by alcohol descending' },
    { key: 'productsPage.sortByAlcoholDesc', section: 'productsPage', language: 'is', value: 'Raða eftir áfengi lækkandi' },

    // Common translations
    { key: 'common.itemsLabel', section: 'common', language: 'en', value: 'Items' },
    { key: 'common.itemsLabel', section: 'common', language: 'is', value: 'Vörur' },
    { key: 'common.currency', section: 'common', language: 'en', value: 'kr.' },
    { key: 'common.currency', section: 'common', language: 'is', value: 'kr.' },
    { key: 'common.loading', section: 'common', language: 'en', value: 'Loading...' },
    { key: 'common.loading', section: 'common', language: 'is', value: 'Hleð...' },
    { key: 'common.error', section: 'common', language: 'en', value: 'Error' },
    { key: 'common.error', section: 'common', language: 'is', value: 'Villa' },
    { key: 'common.success', section: 'common', language: 'en', value: 'Success' },
    { key: 'common.success', section: 'common', language: 'is', value: 'Tókst' },
    { key: 'common.save', section: 'common', language: 'en', value: 'Save' },
    { key: 'common.save', section: 'common', language: 'is', value: 'Vista' },
    { key: 'common.cancel', section: 'common', language: 'en', value: 'Cancel' },
    { key: 'common.cancel', section: 'common', language: 'is', value: 'Hætta við' },
    { key: 'common.delete', section: 'common', language: 'en', value: 'Delete' },
    { key: 'common.delete', section: 'common', language: 'is', value: 'Eyða' },
    { key: 'common.edit', section: 'common', language: 'en', value: 'Edit' },
    { key: 'common.edit', section: 'common', language: 'is', value: 'Breyta' },
    { key: 'common.add', section: 'common', language: 'en', value: 'Add' },
    { key: 'common.add', section: 'common', language: 'is', value: 'Bæta við' },
    { key: 'common.remove', section: 'common', language: 'en', value: 'Remove' },
    { key: 'common.remove', section: 'common', language: 'is', value: 'Fjarlægja' },
    { key: 'common.clear', section: 'common', language: 'en', value: 'Clear' },
    { key: 'common.clear', section: 'common', language: 'is', value: 'Hreinsa' },
    { key: 'common.search', section: 'common', language: 'en', value: 'Search' },
    { key: 'common.search', section: 'common', language: 'is', value: 'Leita' },
    { key: 'common.filter', section: 'common', language: 'en', value: 'Filter' },
    { key: 'common.filter', section: 'common', language: 'is', value: 'Sía' },
    { key: 'common.sort', section: 'common', language: 'en', value: 'Sort' },
    { key: 'common.sort', section: 'common', language: 'is', value: 'Raða' },
    { key: 'common.price', section: 'common', language: 'en', value: 'Price' },
    { key: 'common.price', section: 'common', language: 'is', value: 'Verð' },
    { key: 'common.quantity', section: 'common', language: 'en', value: 'Quantity' },
    { key: 'common.quantity', section: 'common', language: 'is', value: 'Magn' },
    { key: 'common.total', section: 'common', language: 'en', value: 'Total' },
    { key: 'common.total', section: 'common', language: 'is', value: 'Samtals' },
    { key: 'common.subtotal', section: 'common', language: 'en', value: 'Subtotal' },
    { key: 'common.subtotal', section: 'common', language: 'is', value: 'Undirheild' },
    { key: 'common.tax', section: 'common', language: 'en', value: 'Tax' },
    { key: 'common.tax', section: 'common', language: 'is', value: 'VSK' },
    { key: 'common.shipping', section: 'common', language: 'en', value: 'Shipping' },
    { key: 'common.shipping', section: 'common', language: 'is', value: 'Sending' },
    { key: 'common.discount', section: 'common', language: 'en', value: 'Discount' },
    { key: 'common.discount', section: 'common', language: 'is', value: 'Afsláttur' },
    { key: 'common.yes', section: 'common', language: 'en', value: 'Yes' },
    { key: 'common.yes', section: 'common', language: 'is', value: 'Já' },
    { key: 'common.no', section: 'common', language: 'en', value: 'No' },
    { key: 'common.no', section: 'common', language: 'is', value: 'Nei' },
    { key: 'common.ok', section: 'common', language: 'en', value: 'OK' },
    { key: 'common.ok', section: 'common', language: 'is', value: 'Í lagi' },
    { key: 'common.close', section: 'common', language: 'en', value: 'Close' },
    { key: 'common.close', section: 'common', language: 'is', value: 'Loka' },
    { key: 'common.back', section: 'common', language: 'en', value: 'Back' },
    { key: 'common.back', section: 'common', language: 'is', value: 'Til baka' },
    { key: 'common.next', section: 'common', language: 'en', value: 'Next' },
    { key: 'common.next', section: 'common', language: 'is', value: 'Næsta' },
    { key: 'common.previous', section: 'common', language: 'en', value: 'Previous' },
    { key: 'common.previous', section: 'common', language: 'is', value: 'Fyrri' },
    { key: 'common.continue', section: 'common', language: 'en', value: 'Continue' },
    { key: 'common.continue', section: 'common', language: 'is', value: 'Halda áfram' },
    { key: 'common.finish', section: 'common', language: 'en', value: 'Finish' },
    { key: 'common.finish', section: 'common', language: 'is', value: 'Ljúka' },
    { key: 'common.retry', section: 'common', language: 'en', value: 'Retry' },
    { key: 'common.retry', section: 'common', language: 'is', value: 'Reyna aftur' },
    { key: 'common.refresh', section: 'common', language: 'en', value: 'Refresh' },
    { key: 'common.refresh', section: 'common', language: 'is', value: 'Endurnýja' },
    { key: 'common.goToSlide', section: 'common', language: 'en', value: 'Go to Slide' },
    { key: 'common.goToSlide', section: 'common', language: 'is', value: 'Fara á skyggnu' },
    { key: 'common.clearSearch', section: 'common', language: 'en', value: 'Clear Search' },
    { key: 'common.clearSearch', section: 'common', language: 'is', value: 'Hreinsa leit' },

    // Home page translations
    { key: 'home.hero.title', section: 'home', language: 'en', value: 'Welcome to Ölföng' },
    { key: 'home.hero.title', section: 'home', language: 'is', value: 'Velkomin í Ölföng' },
    { key: 'home.hero.subtitle', section: 'home', language: 'en', value: 'Your premium wine and beer destination' },
    { key: 'home.hero.subtitle', section: 'home', language: 'is', value: 'Þitt úrvals vín og bjór áfangastað' },
    { key: 'home.why.title', section: 'home', language: 'en', value: 'Why Choose Us?' },
    { key: 'home.why.title', section: 'home', language: 'is', value: 'Af hverju velja okkur?' },
    { key: 'home.why.subtitle', section: 'home', language: 'en', value: 'Discover what makes us special' },
    { key: 'home.why.subtitle', section: 'home', language: 'is', value: 'Uppgötvaðu hvað gerir okkur sérstaka' },
    { key: 'home.features.wineDescription', section: 'home', language: 'en', value: 'Premium wine selection from around the world' },
    { key: 'home.features.wineDescription', section: 'home', language: 'is', value: 'Úrvals vínúrval frá heiminum' },
    { key: 'home.features.beerDescription', section: 'home', language: 'en', value: 'Craft and premium beers for every taste' },
    { key: 'home.features.beerDescription', section: 'home', language: 'is', value: 'Handverks og úrvals bjór fyrir alla bragð' },
    { key: 'home.features.deliveryDescription', section: 'home', language: 'en', value: 'Fast and reliable delivery to your doorstep' },
    { key: 'home.features.deliveryDescription', section: 'home', language: 'is', value: 'Fljótleg og áreiðanleg afhending að dyrum' },
    { key: 'home.features.ageVerificationTitle', section: 'home', language: 'en', value: 'Age Verification' },
    { key: 'home.features.ageVerificationTitle', section: 'home', language: 'is', value: 'Aldursstaðfesting' },
    { key: 'home.features.ageVerificationDescription', section: 'home', language: 'en', value: 'Secure age verification for alcohol purchases' },
    { key: 'home.features.ageVerificationDescription', section: 'home', language: 'is', value: 'Örugg aldursstaðfesting fyrir áfengiskaup' },
    { key: 'home.categories.title', section: 'home', language: 'en', value: 'Categories' },
    { key: 'home.categories.title', section: 'home', language: 'is', value: 'Flokkar' },
    { key: 'home.categories.subtitle', section: 'home', language: 'en', value: 'Browse our wide selection' },
    { key: 'home.categories.subtitle', section: 'home', language: 'is', value: 'Skoðaðu úrvalið okkar' },
    { key: 'home.banner.title1', section: 'home', language: 'en', value: 'Premium Wine Selection' },
    { key: 'home.banner.title1', section: 'home', language: 'is', value: 'Úrvals vínúrval' },
    { key: 'home.banner.description1', section: 'home', language: 'en', value: 'Discover our curated collection of fine wines' },
    { key: 'home.banner.description1', section: 'home', language: 'is', value: 'Uppgötvaðu úrvalið okkar af fínu víni' },
    { key: 'home.banner.title2', section: 'home', language: 'en', value: 'Quality Beer Collection' },
    { key: 'home.banner.title2', section: 'home', language: 'is', value: 'Gæða bjórsafn' },
    { key: 'home.banner.description2', section: 'home', language: 'en', value: 'Explore our wide range of craft and premium beers' },
    { key: 'home.banner.description2', section: 'home', language: 'is', value: 'Kannaðu úrvalið okkar af handverks og úrvals bjórum' },
    { key: 'home.banner.title3', section: 'home', language: 'en', value: 'Special Offers' },
    { key: 'home.banner.title3', section: 'home', language: 'is', value: 'Sértilboð' },
    { key: 'home.banner.description3', section: 'home', language: 'en', value: 'Don\'t miss out on our exclusive deals and discounts' },
    { key: 'home.banner.description3', section: 'home', language: 'is', value: 'Ekki missa af einkaréttum tilboðum og afslættum' },
    { key: 'home.banner.title4', section: 'home', language: 'en', value: 'Fast Delivery' },
    { key: 'home.banner.title4', section: 'home', language: 'is', value: 'Fljótleg afhending' },
    { key: 'home.banner.description4', section: 'home', language: 'en', value: 'Quick and reliable delivery to your doorstep' },
    { key: 'home.banner.description4', section: 'home', language: 'is', value: 'Fljótleg og áreiðanleg afhending að dyrum' },
    { key: 'home.banner.alt', section: 'home', language: 'en', value: 'Ölföng Banner' },
    { key: 'home.banner.alt', section: 'home', language: 'is', value: 'Ölföng borði' },

    // Products translations
    { key: 'products.outOfStock', section: 'products', language: 'en', value: 'Out of Stock' },
    { key: 'products.outOfStock', section: 'products', language: 'is', value: 'Uppselt' },
    { key: 'products.addToCart', section: 'products', language: 'en', value: 'Add to Cart' },
    { key: 'products.addToCart', section: 'products', language: 'is', value: 'Bæta í körfu' },
    { key: 'products.viewDetails', section: 'products', language: 'en', value: 'View Details' },
    { key: 'products.viewDetails', section: 'products', language: 'is', value: 'Skoða nánar' },
    { key: 'products.price', section: 'products', language: 'en', value: 'Price' },
    { key: 'products.price', section: 'products', language: 'is', value: 'Verð' },
    { key: 'products.alcoholVolume', section: 'products', language: 'en', value: 'Alcohol Volume' },
    { key: 'products.alcoholVolume', section: 'products', language: 'is', value: 'Áfengismagn' },
    { key: 'products.country', section: 'products', language: 'en', value: 'Country' },
    { key: 'products.country', section: 'products', language: 'is', value: 'Land' },
    { key: 'products.region', section: 'products', language: 'en', value: 'Region' },
    { key: 'products.region', section: 'products', language: 'is', value: 'Svæði' },
    { key: 'products.producer', section: 'products', language: 'en', value: 'Producer' },
    { key: 'products.producer', section: 'products', language: 'is', value: 'Framleiðandi' },
    { key: 'products.vintage', section: 'products', language: 'en', value: 'Vintage' },
    { key: 'products.vintage', section: 'products', language: 'is', value: 'Árgangur' },
    { key: 'products.description', section: 'products', language: 'en', value: 'Description' },
    { key: 'products.description', section: 'products', language: 'is', value: 'Lýsing' },
    { key: 'products.foodPairings', section: 'products', language: 'en', value: 'Food Pairings' },
    { key: 'products.foodPairings', section: 'products', language: 'is', value: 'Matarpar' },
    { key: 'products.specialAttributes', section: 'products', language: 'en', value: 'Special Attributes' },
    { key: 'products.specialAttributes', section: 'products', language: 'is', value: 'Sérstök eiginleikar' },

    // Cart translations
    { key: 'cart.title', section: 'cart', language: 'en', value: 'Shopping Cart' },
    { key: 'cart.title', section: 'cart', language: 'is', value: 'Verslunarkörfa' },
    { key: 'cart.empty', section: 'cart', language: 'en', value: 'Your cart is empty' },
    { key: 'cart.empty', section: 'cart', language: 'is', value: 'Körfan þín er tóm' },
    { key: 'cart.items', section: 'cart', language: 'en', value: 'items' },
    { key: 'cart.items', section: 'cart', language: 'is', value: 'vörur' },
    { key: 'cart.item', section: 'cart', language: 'en', value: 'item' },
    { key: 'cart.item', section: 'cart', language: 'is', value: 'vara' },
    { key: 'cart.removeItem', section: 'cart', language: 'en', value: 'Remove Item' },
    { key: 'cart.removeItem', section: 'cart', language: 'is', value: 'Fjarlægja vöru' },
    { key: 'cart.updateQuantity', section: 'cart', language: 'en', value: 'Update Quantity' },
    { key: 'cart.updateQuantity', section: 'cart', language: 'is', value: 'Uppfæra magn' },
    { key: 'cart.checkout', section: 'cart', language: 'en', value: 'Checkout' },
    { key: 'cart.checkout', section: 'cart', language: 'is', value: 'Ganga frá' },
    { key: 'cart.continueShopping', section: 'cart', language: 'en', value: 'Continue Shopping' },
    { key: 'cart.continueShopping', section: 'cart', language: 'is', value: 'Halda áfram að versla' },
    { key: 'cart.subtotal', section: 'cart', language: 'en', value: 'Subtotal' },
    { key: 'cart.subtotal', section: 'cart', language: 'is', value: 'Undirheild' },
    { key: 'cart.tax', section: 'cart', language: 'en', value: 'Tax' },
    { key: 'cart.tax', section: 'cart', language: 'is', value: 'VSK' },
    { key: 'cart.total', section: 'cart', language: 'en', value: 'Total' },
    { key: 'cart.total', section: 'cart', language: 'is', value: 'Samtals' },

    // Delivery translations
    { key: 'delivery.title', section: 'delivery', language: 'en', value: 'Delivery' },
    { key: 'delivery.title', section: 'delivery', language: 'is', value: 'Afhending' },
    { key: 'delivery.homeDelivery', section: 'delivery', language: 'en', value: 'Home Delivery' },
    { key: 'delivery.homeDelivery', section: 'delivery', language: 'is', value: 'Heimafhending' },
    { key: 'delivery.storePickup', section: 'delivery', language: 'en', value: 'Store Pickup' },
    { key: 'delivery.storePickup', section: 'delivery', language: 'is', value: 'Sótt í verslun' },
    { key: 'delivery.estimatedDelivery', section: 'delivery', language: 'en', value: 'Estimated Delivery' },
    { key: 'delivery.estimatedDelivery', section: 'delivery', language: 'is', value: 'Áætluð afhending' },
    { key: 'delivery.deliveryFee', section: 'delivery', language: 'en', value: 'Delivery Fee' },
    { key: 'delivery.deliveryFee', section: 'delivery', language: 'is', value: 'Sendingargjald' },
    { key: 'delivery.freeDelivery', section: 'delivery', language: 'en', value: 'Free Delivery' },
    { key: 'delivery.freeDelivery', section: 'delivery', language: 'is', value: 'Ókeypis sending' },

    // Admin translations
    { key: 'admin.dashboard', section: 'admin', language: 'en', value: 'Dashboard' },
    { key: 'admin.dashboard', section: 'admin', language: 'is', value: 'Stjórnborð' },
    { key: 'admin.products', section: 'admin', language: 'en', value: 'Products' },
    { key: 'admin.products', section: 'admin', language: 'is', value: 'Vörur' },
    { key: 'admin.categories', section: 'admin', language: 'en', value: 'Categories' },
    { key: 'admin.categories', section: 'admin', language: 'is', value: 'Flokkar' },
    { key: 'admin.orders', section: 'admin', language: 'en', value: 'Orders' },
    { key: 'admin.orders', section: 'admin', language: 'is', value: 'Pantanir' },
    { key: 'admin.customers', section: 'admin', language: 'en', value: 'Customers' },
    { key: 'admin.customers', section: 'admin', language: 'is', value: 'Viðskiptavinir' },
    { key: 'admin.analytics', section: 'admin', language: 'en', value: 'Analytics' },
    { key: 'admin.analytics', section: 'admin', language: 'is', value: 'Greining' },
    { key: 'admin.settings', section: 'admin', language: 'en', value: 'Settings' },
    { key: 'admin.settings', section: 'admin', language: 'is', value: 'Stillingar' },
    { key: 'admin.banners', section: 'admin', language: 'en', value: 'Banners' },
    { key: 'admin.banners', section: 'admin', language: 'is', value: 'Borðar' },
    { key: 'admin.reports', section: 'admin', language: 'en', value: 'Reports' },
    { key: 'admin.reports', section: 'admin', language: 'is', value: 'Skýrslur' },
    { key: 'admin.chat', section: 'admin', language: 'en', value: 'Chat' },
    { key: 'admin.chat', section: 'admin', language: 'is', value: 'Spjall' },
    { key: 'admin.media', section: 'admin', language: 'en', value: 'Media' },
    { key: 'admin.media', section: 'admin', language: 'is', value: 'Miðlar' },
    { key: 'admin.translations', section: 'admin', language: 'en', value: 'Translations' },
    { key: 'admin.translations', section: 'admin', language: 'is', value: 'Þýðingar' },

    // Admin categories translations
    { key: 'admincategories.subcategories', section: 'admincategories', language: 'en', value: 'Subcategories' },
    { key: 'admincategories.subcategories', section: 'admincategories', language: 'is', value: 'Undirflokkar' }
  ];

  // Clear existing translations
  console.log('🗑️  Clearing existing translations...');
  await prisma.translationHistory.deleteMany({});
  await prisma.translation.deleteMany({});
  console.log('✅ Existing translations cleared');

  // Insert essential translations
  console.log('💾 Inserting essential translations...');
  await prisma.translation.createMany({
    data: essentialTranslations.map(translation => ({
      ...translation,
      description: `Translation for ${translation.key}`,
      createdBy: 'system'
    })),
    skipDuplicates: true
  });

  console.log(`✅ Inserted ${essentialTranslations.length} essential translations`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


