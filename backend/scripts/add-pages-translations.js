const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Pages translation keys
const pagesTranslations = [
  // Admin Navigation
  { key: 'adminNavigation.pages', en: 'Pages', is: 'Síður' },

  // Admin Pages Section
  { key: 'adminPages.title', en: 'Pages', is: 'Síður' },
  { key: 'adminPages.subtitle', en: 'Manage custom pages for your website', is: 'Stjórnaðu sérsniðnum síðum fyrir vefsíðuna þína' },
  { key: 'adminPages.createPage', en: 'Create Page', is: 'Búa til síðu' },
  { key: 'adminPages.editPage', en: 'Edit Page', is: 'Breyta síðu' },
  { key: 'adminPages.deletePage', en: 'Delete Page', is: 'Eyða síðu' },
  { key: 'adminPages.pageDeleted', en: 'Page deleted successfully', is: 'Síða eytt með góðum árangri' },

  // Table Headers
  { key: 'adminPages.table.title', en: 'Title', is: 'Titill' },
  { key: 'adminPages.table.slug', en: 'Slug', is: 'Slúg' },
  { key: 'adminPages.table.status', en: 'Status', is: 'Staða' },
  { key: 'adminPages.table.visibility', en: 'Visibility', is: 'Sýnileiki' },
  { key: 'adminPages.table.order', en: 'Order', is: 'Röðun' },
  { key: 'adminPages.table.actions', en: 'Actions', is: 'Aðgerðir' },
  { key: 'adminPages.table.createdAt', en: 'Created', is: 'Búið til' },
  { key: 'adminPages.table.updatedAt', en: 'Updated', is: 'Uppfært' },

  // Status
  { key: 'adminPages.status.draft', en: 'Draft', is: 'Drög' },
  { key: 'adminPages.status.published', en: 'Published', is: 'Birt' },

  // Visibility
  { key: 'adminPages.visibility.visible', en: 'Visible in Footer', is: 'Sýnilegt í fæti' },
  { key: 'adminPages.visibility.hidden', en: 'Hidden from Footer', is: 'Falið frá fæti' },

  // Modal - Basic Info Tab
  { key: 'adminPages.modal.basicInfo', en: 'Basic Info', is: 'Grunnupplýsingar' },
  { key: 'adminPages.modal.title', en: 'Page Title (English)', is: 'Titill síðu (Ensku)' },
  { key: 'adminPages.modal.titleIs', en: 'Page Title (Icelandic)', is: 'Titill síðu (Íslenska)' },
  { key: 'adminPages.modal.slug', en: 'URL Slug', is: 'URL slúg' },
  { key: 'adminPages.modal.slugHelper', en: 'e.g., privacy-policy, about-us', is: 't.d., privacy-policy, about-us' },
  { key: 'adminPages.modal.status', en: 'Status', is: 'Staða' },
  { key: 'adminPages.modal.visibility', en: 'Show in Footer', is: 'Sýna í fæti' },
  { key: 'adminPages.modal.sortOrder', en: 'Display Order', is: 'Birting röðun' },
  { key: 'adminPages.modal.sortOrderHelper', en: 'Lower numbers appear first', is: 'Lægri tölur koma fyrst' },

  // Modal - Content Tab
  { key: 'adminPages.modal.content', en: 'Content', is: 'Efni' },
  { key: 'adminPages.modal.contentEn', en: 'Content (English)', is: 'Efni (Ensku)' },
  { key: 'adminPages.modal.contentIs', en: 'Content (Icelandic)', is: 'Efni (Íslenska)' },

  // Modal - Featured Image Tab
  { key: 'adminPages.modal.featuredImage', en: 'Featured Image', is: 'Myndskeið mynd' },
  { key: 'adminPages.modal.selectImage', en: 'Select Image', is: 'Velja mynd' },
  { key: 'adminPages.modal.noImageSelected', en: 'No image selected', is: 'Engin mynd valin' },
  { key: 'adminPages.modal.imageHelper', en: 'This image will be displayed at the top of the page', is: 'Þessi mynd verður sýnd efst á síðunni' },

  // Modal - SEO Tab
  { key: 'adminPages.modal.seo', en: 'SEO', is: 'SEO' },
  { key: 'adminPages.modal.metaTitle', en: 'Meta Title (English)', is: 'Lýsigögn titill (Ensku)' },
  { key: 'adminPages.modal.metaTitleIs', en: 'Meta Title (Icelandic)', is: 'Lýsigögn titill (Íslenska)' },
  { key: 'adminPages.modal.metaDescription', en: 'Meta Description (English)', is: 'Lýsigögn lýsing (Ensku)' },
  { key: 'adminPages.modal.metaDescriptionIs', en: 'Meta Description (Icelandic)', is: 'Lýsigögn lýsing (Íslenska)' },
  { key: 'adminPages.modal.metaHelper', en: 'Appears in search results', is: 'Birtist í leitarniðurstöðum' },
  { key: 'adminPages.modal.canonicalUrl', en: 'Canonical URL', is: 'Helstu URL' },
  { key: 'adminPages.modal.canonicalHelper', en: 'Use for duplicate content on other domains', is: 'Nota fyrir afrit efnis á öðrum lénum' },

  // Validation
  { key: 'adminPages.validation.titleRequired', en: 'Title is required', is: 'Titill er nauðsynlegur' },
  { key: 'adminPages.validation.slugRequired', en: 'Slug is required', is: 'Slúg er nauðsynlegur' },
  { key: 'adminPages.validation.contentRequired', en: 'Content is required', is: 'Efni er nauðsynlegt' },
  { key: 'adminPages.validation.slugExists', en: 'A page with this slug already exists', is: 'Síða með þessari slúg er þegar til' },

  // Actions
  { key: 'adminPages.actions.edit', en: 'Edit', is: 'Breyta' },
  { key: 'adminPages.actions.delete', en: 'Delete', is: 'Eyða' },
  { key: 'adminPages.actions.duplicate', en: 'Duplicate', is: 'Afrita' },
  { key: 'adminPages.actions.toggleVisibility', en: 'Toggle Visibility', is: 'Kveikja á sýnileika' },

  // Confirmations
  { key: 'adminPages.deleteConfirm', en: 'Are you sure you want to delete this page?', is: 'Ertu viss um að þú vilt eyða þessari síðu?' },
  { key: 'adminPages.deleteWarning', en: 'This action cannot be undone', is: 'Þessa aðgerð er ekki hægt að afturkalla' },

  // Editor Toolbar
  { key: 'adminPages.editor.bold', en: 'Bold', is: 'Feiti' },
  { key: 'adminPages.editor.italic', en: 'Italic', is: 'Skáletra' },
  { key: 'adminPages.editor.underline', en: 'Underline', is: 'Undirstrika' },
  { key: 'adminPages.editor.heading1', en: 'Heading 1', is: 'Fyrirsögn 1' },
  { key: 'adminPages.editor.heading2', en: 'Heading 2', is: 'Fyrirsögn 2' },
  { key: 'adminPages.editor.heading3', en: 'Heading 3', is: 'Fyrirsögn 3' },
  { key: 'adminPages.editor.unorderedList', en: 'Unordered List', is: 'Óróðuð listi' },
  { key: 'adminPages.editor.orderedList', en: 'Ordered List', is: 'Röðuð listi' },
  { key: 'adminPages.editor.blockquote', en: 'Blockquote', is: 'Blokkatilboð' },
  { key: 'adminPages.editor.codeBlock', en: 'Code Block', is: 'Kóðablikki' },
  { key: 'adminPages.editor.link', en: 'Link', is: 'Tengill' },
  { key: 'adminPages.editor.image', en: 'Image', is: 'Mynd' },
  { key: 'adminPages.editor.insertImage', en: 'Insert Image', is: 'Setja inn mynd' },

  // Public Page
  { key: 'page.notFound', en: 'Page not found', is: 'Síða fannst ekki' },
  { key: 'page.backToHome', en: 'Back to Home', is: 'Til baka á heimasíðu' },
  { key: 'page.breadcrumb', en: 'Pages', is: 'Síður' },

  // Footer
  { key: 'footer.pages', en: 'Pages', is: 'Síður' },
];

async function addTranslations() {
  try {
    console.log('🌍 Adding pages translations...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const translation of pagesTranslations) {
      // Add English translation
      const enTranslation = await prisma.lang.upsert({
        where: {
          key_locale: {
            key: translation.key,
            locale: 'en'
          }
        },
        update: {
          value: translation.en
        },
        create: {
          key: translation.key,
          locale: 'en',
          value: translation.en
        }
      });

      // Add Icelandic translation
      const isTranslation = await prisma.lang.upsert({
        where: {
          key_locale: {
            key: translation.key,
            locale: 'is'
          }
        },
        update: {
          value: translation.is
        },
        create: {
          key: translation.key,
          locale: 'is',
          value: translation.is
        }
      });

      addedCount += 2;
      console.log(`✅ ${translation.key}`);
    }

    console.log(`\n✨ Successfully added ${addedCount} translations!`);

    // Update database-export.json with new translations
    console.log('\n📝 Updating database-export.json...');
    const exportFile = path.join(__dirname, '../prisma/database-export.json');
    const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));

    // Get all translations from database
    const allTranslations = await prisma.lang.findMany();
    data.langs = allTranslations;

    fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));
    console.log('✅ database-export.json updated');

    console.log('\n🎉 Pages translations added successfully!');
  } catch (error) {
    console.error('❌ Error adding translations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
