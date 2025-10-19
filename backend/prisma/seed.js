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

  console.log('✅ Created demo customers');

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
    await prisma.order.create({
      data: order,
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


