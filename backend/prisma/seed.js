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

  console.log('✅ Created sample products');

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


