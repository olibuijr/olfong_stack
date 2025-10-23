const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllMediaExceptEgilsGull() {
  try {
    // Get all media files in products collection
    const allMedia = await prisma.media.findMany({
      where: { collection: 'PRODUCTS' },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${allMedia.length} media files`);
    allMedia.forEach(m => console.log(`  - ${m.id}: ${m.filename}`));

    // Find Egils Gull media files to keep
    const egilsGullFiles = allMedia.filter(m => 
      m.filename.toLowerCase().includes('egils-gull') && 
      m.filename.toLowerCase().includes('01448')
    );

    console.log(`\nEgils Gull files to keep: ${egilsGullFiles.length}`);
    egilsGullFiles.forEach(m => console.log(`  - ${m.id}: ${m.filename}`));

    // Get IDs to delete
    const idsToDelete = allMedia
      .filter(m => !m.filename.toLowerCase().includes('egils-gull') || !m.filename.toLowerCase().includes('01448'))
      .map(m => m.id);

    console.log(`\nDeleting ${idsToDelete.length} media files...`);

    // Delete media files
    const deleteResult = await prisma.media.deleteMany({
      where: { id: { in: idsToDelete } }
    });

    console.log(`Deleted ${deleteResult.count} media records`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllMediaExceptEgilsGull();
