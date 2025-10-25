const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subcategoryDescriptions = {
  WHITE_WINE: {
    description: "Explore our selection of crisp and refreshing white wines. From light and zesty Sauvignon Blancs to rich and buttery Chardonnays, our white wines offer elegant flavors and aromatic complexity. Perfect for seafood, poultry, or enjoying on a warm day.",
    descriptionIs: "Kannaðu úrvalið okkar af stökkum og frískandi hvítvínum. Allt frá léttum og líflegum Sauvignon Blancs til ríkulegra og smjörkenndra Chardonnays, bjóða hvítvínin okkar upp á glæsileg bragð og ilmríka flækju. Fullkomin með sjávarréttum, alifuglakjöti eða til að njóta á hlýjum degi."
  },
  RED_WINE: {
    description: "Discover our collection of bold and sophisticated red wines. From smooth Merlots and elegant Pinot Noirs to robust Cabernet Sauvignons and spicy Shirazes, our red wines deliver depth, character, and rich fruit flavors. Ideal for red meats, hearty dishes, or cozy evenings.",
    descriptionIs: "Uppgötvaðu safnið okkar af djörfum og fágaðum rauðvínum. Allt frá mjúkum Merlots og glæsilegum Pinot Noirs til kraftmikilla Cabernet Sauvignons og kryddaðra Shirazes, bjóða rauðvínin okkar upp á dýpt, karakter og ríkuleg ávaxtabragð. Tilvalin með rauðu kjöti, matarmiklum réttum eða fyrir notalegar kvöldstundir."
  },
  SPARKLING_WINE: {
    description: "Celebrate with our effervescent sparkling wines. These vibrant, bubbly wines bring joy to any occasion with their crisp acidity and refreshing bubbles. Perfect for toasts, celebrations, or adding sparkle to your everyday moments.",
    descriptionIs: "Fagnaðu með freyðivínunum okkar. Þessi líflegu, freyðandi vín færa gleði við öll tækifæri með stökkri sýru og frískandi loftbólum. Fullkomin fyrir skálir, hátíðahöld eða til að bæta neista í hversdagslegar stundir."
  },
  CHAMPAGNE: {
    description: "Indulge in the luxury of authentic Champagne from France's prestigious region. These premium sparkling wines are crafted using traditional methods, offering refined elegance, complex flavors, and persistent bubbles. Reserved for life's most special celebrations.",
    descriptionIs: "Leyfðu þér að njóta lúxus ósvikins kampavíns frá hinu virta svæði í Frakklandi. Þessi úrvals freyðivín eru framleidd með hefðbundnum aðferðum og bjóða upp á fágaða glæsileika, flókin bragð og þrálátar loftbólur. Eingöngu fyrir sérstökustu hátíðarstundir lífsins."
  },
  YELLOW_WINE: {
    description: "Experience the unique character of yellow wines. These rare and distinctive wines undergo special aging processes, developing nutty, oxidative flavors and golden hues. A connoisseur's choice for pairing with rich cheeses and complex dishes.",
    descriptionIs: "Upplifðu einstakan karakter gulra vína. Þessi sjaldgæfu og sérstæðu vín gangast undir sérstaka öldrunarferla sem þróa hnetukennd, oxandi bragð og gyllta tóna. Val sælkerans til að para saman við bragðmikla osta og flókna rétti."
  },
  ROSE_WINE: {
    description: "Enjoy the delicate charm of rosé wines. With their beautiful pink hues and refreshing fruit flavors, these versatile wines strike a perfect balance between red and white. Ideal for summer gatherings, light meals, or aperitifs.",
    descriptionIs: "Njóttu viðkvæms þokka rósavína. Með sínum fallegu bleiku litbrigðum og frískandi ávaxtabragði ná þessi fjölhæfu vín fullkomnu jafnvægi milli rauðs og hvíts. Tilvalin fyrir sumarsamkomur, léttar máltíðir eða sem fordrykkur."
  },
  GIN: {
    description: "Discover our curated gin collection featuring botanical-forward spirits. From classic London Dry to contemporary craft gins, each bottle offers unique flavor profiles perfect for cocktails or enjoying with tonic.",
    descriptionIs: "Uppgötvaðu úrvalið okkar af gini með áherslu á jurtir. Allt frá klassískum London Dry til nútímalegra handverksgina, býður hver flaska upp á einstök bragðsnið sem eru fullkomin í kokteila eða til að njóta með tóník."
  },
  COGNAC: {
    description: "Savor the refined elegance of French Cognac. These prestigious brandies are aged to perfection, offering rich, complex flavors of fruit, oak, and spice. A sophisticated choice for sipping and special occasions.",
    descriptionIs: "Njóttu fágaðrar glæsileika franska koníaksins. Þessi virtu brandí eru fullkomnuð með öldrun og bjóða upp á ríkuleg, flókin bragð af ávöxtum, eik og kryddi. Fágaður kostur til að sötra við sérstök tækifæri."
  },
  RUM: {
    description: "Explore our rum selection from Caribbean islands and beyond. From light and mixable white rums to rich, aged dark rums and spiced varieties, discover the versatile world of this sugarcane spirit.",
    descriptionIs: "Kannaðu rommúrvalið okkar frá Karíbahafseyjum og víðar. Allt frá léttum og blöndunarvænum hvítum rommum til ríkulegra, þroskaðra dökkra romma og kryddaðra afbrigða, uppgötvaðu fjölbreyttan heim þessa sykurreyrsanda."
  },
  LIQUEURS_SHOTS: {
    description: "Browse our variety of liqueurs and shots for every taste. From sweet and creamy to bold and fiery, these spirits add flavor to cocktails or provide quick, enjoyable shots for celebrations.",
    descriptionIs: "Skoðaðu úrvalið okkar af líkjörum og skotum fyrir hvern smekk. Allt frá sætum og rjómalöguðum til djarfra og eldheitra, þessir drykkir bæta bragði við kokteila eða bjóða upp á fljótleg og ánægjuleg skot fyrir hátíðahöld."
  },
  TEQUILA: {
    description: "Experience authentic tequila from Mexico's agave heartland. From smooth blancos to complex añejos, our tequila selection offers premium quality for sipping or mixing margaritas and cocktails.",
    descriptionIs: "Upplifðu ósvikið tequila frá agave-hjartalandi Mexíkó. Allt frá mjúkum blancos til flókinna añejos, býður tequila-úrvalið okkar upp á úrvalsgæði til að sötra eða blanda í margarítur og kokteila."
  },
  VODKA: {
    description: "Explore our vodka collection featuring pure, clean spirits. From classic neutral vodkas to flavored varieties, these versatile spirits are essential for countless cocktails and mixed drinks.",
    descriptionIs: "Kannaðu vodka-safnið okkar með hreinum og tærum drykkjum. Allt frá klassískum hlutlausum vodkum til bragðbættra afbrigða, þessir fjölhæfu drykkir eru ómissandi í ótal kokteila og blandaða drykki."
  },
  WHISKEY: {
    description: "Discover our whiskey range spanning the globe. From smooth bourbons and spicy ryes to peaty Scotches and Irish whiskeys, each bottle tells a story of craftsmanship and tradition.",
    descriptionIs: "Uppgötvaðu viskíúrvalið okkar sem spannar allan heiminn. Allt frá mjúkum bourbons og krydduðum ryes til mókenndra skoskra og írskra viskía, hver flaska segir sögu af handverki og hefð."
  },
  VAPE: {
    description: "Browse our vape product selection designed for adult users. Our range includes modern vaping devices and accessories that provide alternatives to traditional smoking. Age verification required.",
    descriptionIs: "Skoðaðu úrvalið okkar af vape-vörum sem eru hannaðar fyrir fullorðna notendur. Úrvalið okkar inniheldur nútímaleg vape-tæki og fylgihluti sem bjóða upp á valkosti við hefðbundnar reykingar. Aldursstaðfesting er áskilin."
  },
  NICOTINE_PADS: {
    description: "Explore our nicotine pouch collection offering discreet, smoke-free nicotine delivery. These modern products provide a convenient alternative for adult nicotine users. Age verification required.",
    descriptionIs: "Kannaðu úrvalið okkar af nikótínpúðum sem bjóða upp á næðislega, reyklausa nikótínafgjöf. Þessar nútímalegu vörur bjóða upp á þægilegan valkost fyrir fullorðna nikótínneytendur. Aldursstaðfesting er áskilin."
  },
  SODA: {
    description: "Refresh yourself with our soda selection. From classic colas to fruity flavors and artisan sodas, enjoy fizzy refreshment for any occasion.",
    descriptionIs: "Frískaðu þig við með gosdrykkjaúrvalinu okkar. Allt frá klassískum kókdrykkjum til ávaxtabragða og handverksgoss, njóttu freyðandi svaladrykkja fyrir öll tækifæri."
  },
  SOFT_DRINKS: {
    description: "Discover our range of soft drinks including sparkling water, flavored beverages, and premium mixers. Perfect for hydration, mixing cocktails, or enjoying on their own.",
    descriptionIs: "Uppgötvaðu úrvalið okkar af gosdrykkjum, þar á meðal freyðivatni, bragðbættum drykkjum og úrvals blöndunarefnum. Fullkomið til vökvunar, blöndunar í kokteila eða til að njóta eins og þeir eru."
  },
  ENERGY_DRINKS: {
    description: "Power up with our energy drink selection. These caffeinated beverages provide a boost when you need it, with various flavors and formulations to keep you energized.",
    descriptionIs: "Fáðu orku með orkudrykkjaúrvalinu okkar. Þessir koffíndrykkir veita aukakraft þegar þú þarft á honum að halda, með ýmsum bragðtegundum og samsetningum til að halda þér orkumiklum."
  }
};

async function updateSubcategoryDescriptions() {
  console.log('Starting subcategory description updates...\n');

  try {
    for (const [subcategoryName, descriptions] of Object.entries(subcategoryDescriptions)) {
      console.log(`Updating ${subcategoryName}...`);

      const result = await prisma.subcategory.updateMany({
        where: { name: subcategoryName },
        data: {
          description: descriptions.description,
          descriptionIs: descriptions.descriptionIs
        }
      });

      if (result.count > 0) {
        console.log(`✓ Successfully updated ${subcategoryName}`);
      } else {
        console.log(`⚠ No subcategory found with name: ${subcategoryName}`);
      }
    }

    console.log('\n✓ All subcategory descriptions updated successfully!');
  } catch (error) {
    console.error('Error updating subcategory descriptions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSubcategoryDescriptions();
