const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function purgeProducts() {
	// Delete dependent rows first to satisfy FK constraints
	await prisma.orderItem.deleteMany({});
	await prisma.cartItem.deleteMany({});
	await prisma.subscription.deleteMany({});
	await prisma.product.deleteMany({});
}

async function ensureWineCategory() {
	let wine = await prisma.category.findUnique({ where: { name: 'WINE' } });
	if (!wine) {
		wine = await prisma.category.create({
			data: {
				name: 'WINE',
				nameIs: 'Vín',
				slug: 'wine',
				description: 'Wine products',
				descriptionIs: 'Vínvörur',
				icon: '🍷',
				isActive: true,
				sortOrder: 1,
			},
		});
	}
	return wine;
}

async function seedRedWines(wineCategoryId) {
	const now = new Date();
	const wines = [
		{
			name: 'Bordeaux Rouge',
			nameIs: 'Bordeaux rauðvín',
			description: 'Classic French red with cassis and cedar notes',
			descriptionIs: 'Klassískt franskt rauðvín með vínberja- og sedrusnótum',
			categoryId: wineCategoryId,
			price: 4500,
			stock: 60,
			alcoholContent: 13.5,
			ageRestriction: 20,
			volume: '750 ml',
			country: 'France',
			producer: 'Château Descombes',
			distributor: 'Vínbúðin',
			packaging: 'Glass bottle',
			subcategories: ['Rauðvín'],
			foodPairings: ['Nautakjöt', 'Lambakjöt', 'Reykt kjöt'],
			specialAttributes: ['Dry', 'Oak aged'],
			availability: 'available',
			createdAt: now,
			updatedAt: now,
		},
		{
			name: 'Rioja Crianza',
			nameIs: 'Rioja Crianza rauðvín',
			description: 'Tempranillo with vanilla and spice from oak',
			descriptionIs: 'Tempranillo með vanillu og kryddi úr eik',
			categoryId: wineCategoryId,
			price: 3990,
			stock: 80,
			alcoholContent: 13.0,
			ageRestriction: 20,
			volume: '750 ml',
			country: 'Spain',
			producer: 'Bodega La Viña',
			distributor: 'Vínbúðin',
			packaging: 'Glass bottle',
			subcategories: ['Rauðvín'],
			foodPairings: ['Svínakjöt', 'Grillmat'],
			specialAttributes: ['Medium-bodied'],
			availability: 'available',
			createdAt: now,
			updatedAt: now,
		},
		{
			name: 'Chianti Classico',
			nameIs: 'Chianti Classico rauðvín',
			description: 'Sangiovese-forward, cherry and herbal notes',
			descriptionIs: 'Sangiovese, kirsuberja- og jurtanótur',
			categoryId: wineCategoryId,
			price: 4290,
			stock: 50,
			alcoholContent: 13.0,
			ageRestriction: 20,
			volume: '750 ml',
			country: 'Italy',
			producer: 'Tenuta del Sole',
			distributor: 'Vínbúðin',
			packaging: 'Glass bottle',
			subcategories: ['Rauðvín'],
			foodPairings: ['Pasta', 'Grillmat'],
			specialAttributes: ['DOCG'],
			availability: 'available',
			createdAt: now,
			updatedAt: now,
		},
		{
			name: 'Pinot Noir Reserve',
			nameIs: 'Pinot Noir rauðvín',
			description: 'Silky texture with red berry and subtle oak',
			descriptionIs: 'Silkimjúkt með rauðberja- og vægum eikarbrag',
			categoryId: wineCategoryId,
			price: 5690,
			stock: 35,
			alcoholContent: 13.0,
			ageRestriction: 20,
			volume: '750 ml',
			country: 'New Zealand',
			producer: 'Southern Hills Estate',
			distributor: 'Vínbúðin',
			packaging: 'Glass bottle',
			subcategories: ['Rauðvín'],
			foodPairings: ['Fiskur', 'Alifuglar'],
			specialAttributes: ['Elegant', 'Low tannin'],
			availability: 'available',
			createdAt: now,
			updatedAt: now,
		},
	];

	for (const wine of wines) {
		await prisma.product.create({ data: wine });
	}
}

async function main() {
	console.log('🧹 Purging all products and related items...');
	await purgeProducts();
	console.log('✅ Purge complete');

	console.log('🔎 Ensuring wine category exists...');
	const wine = await ensureWineCategory();
	console.log('🍷 Using category:', wine.name);

	console.log('🍇 Seeding rauðvín (red wines)...');
	await seedRedWines(wine.id);
	console.log('✅ Inserted rauðvín');
}

main()
	.catch((e) => {
		console.error('Error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
