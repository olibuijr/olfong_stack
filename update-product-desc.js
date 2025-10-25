const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const updated = await prisma.product.update({
      where: { id: 439 },
      data: {
        description: "Vina Maipo Mi Pueblo Chardonnay is a premium Chilean white wine with a smooth, fruity character. Notes of tropical fruits and citrus with a crisp finish. Perfect for seafood and light poultry dishes.",
        descriptionIs: "Vina Maipo Mi Pueblo Chardonnay er fríðlegur chileskur hvítvín með sléttum, berjóðum eiginleikum. Með bragðum af hitaberunum og sítrónu með ferskum endi. Fullkomin fyrir sjávarkjöt og léttar fuglakjöt rétti."
      }
    });
    console.log('Updated product 439:', updated.name);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
