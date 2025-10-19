const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const banners = [
  {
    title: 'Premium Wine Selection',
    titleIs: 'Gæða vínúrval',
    description: 'Discover our curated collection of fine wines from around the world',
    descriptionIs: 'Uppgötvaðu úrvalið okkar af fínu víni frá heiminum',
    imageUrl: '/898-1200-x-300-px-2.webp',
    alt: 'Premium Wine Selection',
    link: '/products?category=WINE',
    isActive: true,
    sortOrder: 1
  },
  {
    title: 'Craft Beer Collection',
    titleIs: 'Handverksbjórsafn',
    description: 'Explore our selection of craft and traditional beers',
    descriptionIs: 'Kynntu þér úrvalið okkar af handverks- og hefðbundnum bjórum',
    imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-4.webp',
    alt: 'Craft Beer Collection',
    link: '/products?category=BEER',
    isActive: true,
    sortOrder: 2
  },
  {
    title: 'Nicotine Products',
    titleIs: 'Nikótínvörur',
    description: 'Quality nicotine products for adults',
    descriptionIs: 'Gæða nikótínvörur fyrir fullorðna',
    imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-768-x-250-px-2.webp',
    alt: 'Nicotine Products',
    link: '/products?category=NICOTINE',
    isActive: true,
    sortOrder: 3
  },
  {
    title: 'Special Offers',
    titleIs: 'Sérstök tilboð',
    description: 'Don\'t miss our exclusive deals and promotions',
    descriptionIs: 'Ekki missa af einkaréttum tilboðum okkar',
    imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-768-x-250-px.webp',
    alt: 'Special Offers',
    link: '/products',
    isActive: true,
    sortOrder: 4
  }
];

async function seedBanners() {
  try {
    console.log('Seeding banners...');
    
    // Clear existing banners
    await prisma.banner.deleteMany({});
    
    // Create new banners
    for (const banner of banners) {
      await prisma.banner.create({
        data: banner
      });
    }
    
    console.log('Banners seeded successfully!');
  } catch (error) {
    console.error('Error seeding banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBanners();
