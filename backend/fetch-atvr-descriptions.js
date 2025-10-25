const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ATVR_BASE_URLS = {
  is: 'https://www.vinbudin.is',
  en: 'https://www.vinbudin.is/english'
};

const getProductDetailsForLanguage = async (productId, lang) => {
  try {
    const url = `${ATVR_BASE_URLS[lang]}/desktopdefault.aspx/tabid-54/?productID=${productId}`;
    console.log(`Fetching from: ${url}`);

    let $;
    let response;

    // Try axios first
    try {
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': lang === 'is' ? 'is-IS,is;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
        },
        timeout: 15000
      });

      $ = cheerio.load(response.data);
    } catch (axiosError) {
      console.log(`Axios failed for product ${productId}, trying Playwright...`);

      // Fallback to Playwright for JavaScript-rendered content
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000); // Wait for JavaScript to execute

      const html = await page.content();
      $ = cheerio.load(html);

      await browser.close();
    }

    const product = {};

    // Look for description in common ATVR page structures
    // ATVR typically has the description in a specific section
    let description = '';

    // Try multiple specific selectors for ATVR structure
    const selectors = [
      '.product-description p',
      '.productinfo p',
      '#productDescription',
      '.content p:first-of-type',
      '[class*="description"] p',
      '.pnlProductInfo p'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        if (text.length > 30 && !text.includes('function') && !text.includes('$(')) {
          description = text;
          break;
        }
      }
    }

    // If still no description, try to get text from info panels
    if (!description) {
      // Get all paragraphs and filter for meaningful content
      const allP = $('p')
        .map((i, el) => {
          let text = $(el).text().trim();

          // Remove UI elements like "Sjá meira" (See more)
          text = text.replace(/Sjá meira\s*$/i, '').trim();
          text = text.replace(/See more\s*$/i, '').trim();

          // Filter out JavaScript code, metadata, short text
          if (text.length > 50 &&
              !text.includes('function') &&
              !text.includes('$(') &&
              !text.includes('accordion') &&
              !text.match(/^(Styrkleiki|Alcohol|Eining|Unit|Land|Country|Árgangur|Year|Framleiðandi|Producer)/) &&
              !text.match(/^\d+%/) &&
              !text.includes('vol.')) {
            return text;
          }
          return null;
        })
        .get()
        .filter(text => text !== null);

      if (allP.length > 0) {
        description = allP[0];
      }
    }

    // Last resort: extract from general body text, filtering heavily
    if (!description) {
      const bodyText = $('body').text();
      const lines = bodyText
        .split('\n')
        .map(line => {
          // Remove UI elements like "Sjá meira"
          let cleaned = line.trim();
          cleaned = cleaned.replace(/Sjá meira\s*$/i, '').trim();
          cleaned = cleaned.replace(/See more\s*$/i, '').trim();
          return cleaned;
        })
        .filter(line =>
          line.length > 50 &&
          !line.includes('function') &&
          !line.includes('$(') &&
          !line.includes('accordion') &&
          !line.match(/^(Styrkleiki|Alcohol|Eining|Unit|Land|Country|Árgangur|Year|Framleiðandi|Producer|Heildsali|Supplier|Umbúðir|Packaging)/) &&
          !line.match(/^\d+%/) &&
          !line.match(/vol\./) &&
          !line.includes('Alcohol') &&
          !line.includes('Script') &&
          !line.includes('.js') &&
          !line.startsWith('$')
        );

      if (lines.length > 0) {
        description = lines[0];
      }
    }

    // Clean up the description
    if (description) {
      // Remove UI elements first
      description = description.replace(/Sjá meira\s*$/i, '').trim();
      description = description.replace(/See more\s*$/i, '').trim();

      // Remove JavaScript code patterns
      description = description.replace(/\$\(.*?\)/g, '');
      description = description.replace(/function\s*\(.*?\)\s*\{[^}]*\}/g, '');
      description = description.replace(/accordion.*?\}/g, '');

      // Clean up whitespace
      description = description.replace(/\s+/g, ' ').trim();

      // Remove trailing JavaScript artifacts
      description = description.split('$[')[0].trim();
      description = description.split('function')[0].trim();
      description = description.split('$(')[0].trim();

      // Final cleanup of UI elements
      description = description.replace(/\s+Sjá meira\s*$/i, '').trim();
      description = description.replace(/\s+See more\s*$/i, '').trim();

      // Limit to reasonable length
      if (description.length > 300) {
        // Try to cut at a sentence boundary
        const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 0) {
          description = sentences.slice(0, 2).join(' ').trim();
        } else {
          description = description.substring(0, 300) + '...';
        }
      }
    }

    product.description = description || `Product ${productId}`;
    console.log(`[${lang}] Description (${product.description.length} chars): ${product.description.slice(0, 100)}...`);

    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId} (${lang}):`, error.message);
    return null;
  }
};

const getProductDetails = async (productId) => {
  try {
    const [icelandicData, englishData] = await Promise.all([
      getProductDetailsForLanguage(productId, 'is'),
      getProductDetailsForLanguage(productId, 'en')
    ]);

    return {
      description: englishData?.description || icelandicData?.description,
      descriptionIs: icelandicData?.description || englishData?.description
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

async function main() {
  console.log('Fetching ATVR product descriptions...\n');

  // Product 439: ATVR ID 06839
  console.log('=== Product 439 (06839) ===');
  const product439 = await getProductDetails('06839');

  console.log('\n=== Product 440 (06824) ===');
  const product440 = await getProductDetails('06824');

  if (product439) {
    console.log('\nUpdating product 439...');
    await prisma.product.update({
      where: { id: 439 },
      data: {
        description: product439.description,
        descriptionIs: product439.descriptionIs
      }
    });
    console.log('✓ Product 439 updated');
  }

  if (product440) {
    console.log('\nUpdating product 440...');
    await prisma.product.update({
      where: { id: 440 },
      data: {
        description: product440.description,
        descriptionIs: product440.descriptionIs
      }
    });
    console.log('✓ Product 440 updated');
  }

  await prisma.$disconnect();
}

main();
