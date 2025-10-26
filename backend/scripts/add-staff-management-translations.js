const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const exportFile = path.join(__dirname, '../prisma/database-export.json');

const staffTranslations = [
  // English translations
  { key: 'adminSettings.staffManagement', locale: 'en', value: 'Staff Management' },
  { key: 'adminStaff.title', locale: 'en', value: 'Staff Management' },
  { key: 'adminStaff.description', locale: 'en', value: 'Manage system staff and assign roles' },
  { key: 'adminStaff.createNew', locale: 'en', value: 'Create New Staff' },
  { key: 'adminStaff.searchPlaceholder', locale: 'en', value: 'Search by name, email, or username...' },
  { key: 'adminStaff.allRoles', locale: 'en', value: 'All Roles' },
  { key: 'adminStaff.roleAdmin', locale: 'en', value: 'Admin' },
  { key: 'adminStaff.roleDelivery', locale: 'en', value: 'Delivery' },
  { key: 'adminStaff.roleCustomer', locale: 'en', value: 'Customer' },
  { key: 'adminStaff.requiredFields', locale: 'en', value: 'Username and full name are required' },
  { key: 'adminStaff.errorSaving', locale: 'en', value: 'Error saving staff member' },
  { key: 'adminStaff.errorDeleting', locale: 'en', value: 'Error deleting staff member' },
  { key: 'adminStaff.confirmDelete', locale: 'en', value: 'Are you sure you want to delete this staff member?' },
  { key: 'adminStaff.noStaffFound', locale: 'en', value: 'No staff found' },
  { key: 'adminStaff.createFirstStaff', locale: 'en', value: 'Create your first staff member to get started' },
  { key: 'adminStaff.username', locale: 'en', value: 'Username' },
  { key: 'adminStaff.fullName', locale: 'en', value: 'Full Name' },
  { key: 'adminStaff.email', locale: 'en', value: 'Email' },
  { key: 'adminStaff.phone', locale: 'en', value: 'Phone' },
  { key: 'adminStaff.role', locale: 'en', value: 'Role' },
  { key: 'adminStaff.actions', locale: 'en', value: 'Actions' },
  { key: 'adminStaff.editStaff', locale: 'en', value: 'Edit Staff Member' },
  { key: 'adminStaff.createStaff', locale: 'en', value: 'Create Staff Member' },
  { key: 'adminStaff.cancel', locale: 'en', value: 'Cancel' },
  { key: 'adminStaff.create', locale: 'en', value: 'Create' },
  { key: 'adminStaff.update', locale: 'en', value: 'Update' },

  // Icelandic translations
  { key: 'adminSettings.staffManagement', locale: 'is', value: 'Starfsfólk' },
  { key: 'adminStaff.title', locale: 'is', value: 'Starfsfólk' },
  { key: 'adminStaff.description', locale: 'is', value: 'Stýra kerfisstafi og úthluta hlutverkum' },
  { key: 'adminStaff.createNew', locale: 'is', value: 'Búa til nýja starfsmann' },
  { key: 'adminStaff.searchPlaceholder', locale: 'is', value: 'Leita eftir nafni, tölvupósti eða notendanafni...' },
  { key: 'adminStaff.allRoles', locale: 'is', value: 'Öll hlutverk' },
  { key: 'adminStaff.roleAdmin', locale: 'is', value: 'Kerfisstjóri' },
  { key: 'adminStaff.roleDelivery', locale: 'is', value: 'Afhending' },
  { key: 'adminStaff.roleCustomer', locale: 'is', value: 'Viðskiptavinur' },
  { key: 'adminStaff.requiredFields', locale: 'is', value: 'Notendanafn og fullt nafn eru nauðsynleg' },
  { key: 'adminStaff.errorSaving', locale: 'is', value: 'Villa við að vista starfsmann' },
  { key: 'adminStaff.errorDeleting', locale: 'is', value: 'Villa við að eyða starfsmanni' },
  { key: 'adminStaff.confirmDelete', locale: 'is', value: 'Ertu viss um að þú viljir eyða þessari starfsmanni?' },
  { key: 'adminStaff.noStaffFound', locale: 'is', value: 'Engir starfsmenn fundust' },
  { key: 'adminStaff.createFirstStaff', locale: 'is', value: 'Búðu til fyrsta starfsmanninn þinn til að hefjast handa' },
  { key: 'adminStaff.username', locale: 'is', value: 'Notendanafn' },
  { key: 'adminStaff.fullName', locale: 'is', value: 'Fullt nafn' },
  { key: 'adminStaff.email', locale: 'is', value: 'Tölvupóstur' },
  { key: 'adminStaff.phone', locale: 'is', value: 'Sími' },
  { key: 'adminStaff.role', locale: 'is', value: 'Hlutverk' },
  { key: 'adminStaff.actions', locale: 'is', value: 'Aðgerðir' },
  { key: 'adminStaff.editStaff', locale: 'is', value: 'Breyta starfsmanni' },
  { key: 'adminStaff.createStaff', locale: 'is', value: 'Búa til starfsmann' },
  { key: 'adminStaff.cancel', locale: 'is', value: 'Hætta við' },
  { key: 'adminStaff.create', locale: 'is', value: 'Búa til' },
  { key: 'adminStaff.update', locale: 'is', value: 'Uppfæra' },
];

async function addTranslations() {
  try {
    const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));

    console.log(`📝 Adding staff management translations...`);
    console.log(`Current translations: ${data.langs.length}`);

    const existingKeys = new Set(data.langs.map(t => `${t.key}_${t.locale}`));
    let added = 0;

    for (const translation of staffTranslations) {
      const key = `${translation.key}_${translation.locale}`;
      if (!existingKeys.has(key)) {
        data.langs.push({
          id: uuidv4(),
          ...translation
        });
        added++;
      }
    }

    fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));
    console.log(`✅ Added ${added} new translations`);
    console.log(`📊 Total translations: ${data.langs.length}`);
  } catch (error) {
    console.error('Error adding translations:', error);
    process.exit(1);
  }
}

addTranslations();
