const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryDescriptions = {
  BEER: {
    description: "Discover our carefully curated selection of beers from around the world. From crisp lagers and hoppy IPAs to rich stouts and refreshing wheat beers, our collection caters to every taste and occasion. Whether you're looking for a classic pilsner to accompany your meal, a craft IPA for the weekend, or a smooth porter for a cozy evening, you'll find quality beers that deliver exceptional flavor and character.",
    descriptionIs: "Uppgötvaðu sérvalda bjóra okkar frá öllum heimshornum. Allt frá stökkum lagerbjór og humlaríkum IPA til ríkulegra stout-bjóra og frískandi hveitibjóra, úrvalið okkar höfðar til allra smekkja og tilefna. Hvort sem þú ert að leita að klassískum pilsner með matnum, handverks-IPA fyrir helgina eða mjúkum porter fyrir notalegt kvöld, þá finnur þú hjá okkur gæðabjóra sem bjóða upp á einstakt bragð og karakter."
  },
  CIDER_RTD: {
    description: "Explore our vibrant collection of ciders and ready-to-drink beverages. Our ciders range from traditional apple varieties to innovative fruit-infused options, offering a perfect balance of sweetness and refreshment. Our ready-to-drink cocktails provide convenient, high-quality mixed drinks for any occasion. Perfect for outdoor gatherings, casual celebrations, or simply enjoying a refreshing drink without the fuss.",
    descriptionIs: "Skoðaðu okkar fjölbreytta úrval af síder og tilbúnum drykkjum. Síderarnir okkar eru allt frá hefðbundnum eplasíderum yfir í nýstárlega valkosti með ávöxtum, sem bjóða upp á fullkomið jafnvægi milli sætu og frískleika. Tilbúnu kokteilarnir okkar eru þægilegir, hágæða blandaðir drykkir fyrir hvaða tilefni sem er. Fullkomnir fyrir útisamkomur, óformleg fagnaðarlæti, eða einfaldlega til að njóta svalandi drykkjar án fyrirhafnar."
  },
  SPIRITS: {
    description: "Immerse yourself in our premium spirits collection featuring vodka, whisky, rum, gin, tequila, and more. Whether you're a connoisseur seeking rare single malts, a mixologist looking for the perfect cocktail base, or someone exploring the world of spirits, our selection offers exceptional quality and variety. From smooth sipping spirits to versatile mixing essentials, discover bottles that elevate every occasion.",
    descriptionIs: "Sökkvu þér niður í úrvals safn okkar af sterkum drykkjum, þar á meðal vodka, viskí, romm, gin, tequila og fleira. Hvort sem þú ert sælkeri í leit að sjaldgæfum single malt viskíum, barþjónn í leit að hinu fullkomna kokteil hráefni eða einfaldlega að kanna heim sterkra drykkja, þá býður úrvalið okkar upp á framúrskarandi gæði og fjölbreytni. Allt frá mjúkum drykkjum til fjölhæfra blöndunar nauðsynja, uppgötvaðu flöskur sem fegra hvert tilefni."
  },
  NICOTINE: {
    description: "Browse our range of nicotine products designed for adult consumers. Our selection includes modern nicotine pouches and alternatives that provide a smoke-free experience. All products meet strict quality standards and are intended for responsible adult use only. Age verification required for purchase.",
    descriptionIs: "Kynntu þér úrvalið okkar af nikótínvörum, hannað fyrir fullorðna. Úrvalið okkar býður upp á nútímalega nikótínpúða og aðra valkosti sem veita reyklausa upplifun. Allar vörur uppfylla strangar gæðakröfur og eru einungis ætlaðar til ábyrgrar notkunar af fullorðnum. Aldursstaðfesting er skilyrði við kaup."
  },
  NON_ALCOHOLIC: {
    description: "Enjoy our diverse selection of non-alcoholic beverages that don't compromise on taste or quality. From alcohol-free beers and wines to sophisticated mocktail ingredients and premium soft drinks, our collection offers everyone the opportunity to enjoy flavorful drinks. Perfect for designated drivers, those taking a break from alcohol, or anyone seeking delicious alcohol-free alternatives for any occasion.",
    descriptionIs: "Njótið fjölbreytts úrvals okkar af óáfengum drykkjum sem gefa ekkert eftir þegar kemur að bragði eða gæðum. Allt frá óáfengum bjór og vínum til fágaðra hráefna í mockteila og úrvals gosdrykkja, gefur úrvalið okkar öllum tækifæri til að njóta bragðgóðra drykkja. Fullkomið fyrir þá sem eru á bíl, þá sem taka sér hvíld frá áfengi eða fyrir hvern þann sem leitar að ljúffengum óáfengum valkostum fyrir hvaða tilefni sem er."
  },
  OFFERS: {
    description: "Discover our latest special offers and exclusive deals on premium products. From seasonal promotions to clearance items and limited-time discounts, this section features carefully selected products at exceptional prices. Check back regularly to find new opportunities to save on your favorite wines, beers, spirits, and more. Don't miss out on these great values!",
    descriptionIs: "Kynntu þér nýjustu sértilboðin okkar og einstök tilboð á gæðavörum. Allt frá árstíðabundnum kynningum til útsöluvara og tímabundinna afslátta, hér finnur þú vandlega valdar vörur á frábæru verði. Kíktu við reglulega til að finna ný tækifæri til að spara á uppáhalds vínunum þínum, bjórum, sterkum drykkjum og fleiru. Ekki missa af þessum frábæru tilboðum."
  }
};

async function updateCategoryDescriptions() {
  console.log('Starting category description updates...\n');

  try {
    for (const [categoryName, descriptions] of Object.entries(categoryDescriptions)) {
      console.log(`Updating ${categoryName}...`);

      const result = await prisma.category.updateMany({
        where: { name: categoryName },
        data: {
          description: descriptions.description,
          descriptionIs: descriptions.descriptionIs
        }
      });

      if (result.count > 0) {
        console.log(`✓ Successfully updated ${categoryName}`);
      } else {
        console.log(`⚠ No category found with name: ${categoryName}`);
      }
    }

    console.log('\n✓ All category descriptions updated successfully!');
  } catch (error) {
    console.error('Error updating category descriptions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryDescriptions();
