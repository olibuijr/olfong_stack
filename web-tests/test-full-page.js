const { chromium } = require('playwright');

async function testFullPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait longer for the page to fully render
    await page.waitForTimeout(10000);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if the page has proper content
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.textContent,
        bodyTextLength: document.body.textContent.length,
        hasNavbar: !!document.querySelector('nav'),
        hasMainContent: !!document.querySelector('main') || !!document.querySelector('[role="main"]'),
        hasFooter: !!document.querySelector('footer'),
        reactRoot: document.querySelector('#root')?.innerHTML?.length || 0
      };
    });
    
    console.log('\n=== PAGE CONTENT ANALYSIS ===');
    console.log('Body text length:', pageContent.bodyTextLength);
    console.log('Has navbar:', pageContent.hasNavbar);
    console.log('Has main content:', pageContent.hasMainContent);
    console.log('Has footer:', pageContent.hasFooter);
    console.log('React root content length:', pageContent.reactRoot);
    console.log('Body text sample:', pageContent.bodyText.substring(0, 200));
    
    // Check for specific elements that should be translated
    const elementCheck = await page.evaluate(() => {
      const results = {};
      
      // Check for navigation elements
      const navElements = document.querySelectorAll('nav a, nav button');
      results.navElements = Array.from(navElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
      
      // Check for any text that looks like it should be translated
      const allText = document.body.textContent.split(/\s+/).filter(text => 
        text.length > 2 && 
        !text.match(/^[0-9.,]+$/) && // Not just numbers/punctuation
        !text.match(/^[a-zA-Z]+\.[a-zA-Z]+/) // Not raw translation keys
      );
      results.meaningfulText = allText.slice(0, 20);
      
      // Check for specific translation patterns
      const icelandicPatterns = /Verslun|Allt|Vörur|Flokkar|Vín|Bjór|Afhending|Innskráning|Körfu|Heim|Prófíll/i;
      const englishPatterns = /Shop|All|Items|Categories|Wine|Beer|Delivery|Login|Cart|Home|Profile/i;
      
      results.hasIcelandicText = icelandicPatterns.test(document.body.textContent);
      results.hasEnglishText = englishPatterns.test(document.body.textContent);
      
      return results;
    });
    
    console.log('\n=== ELEMENT CHECK ===');
    console.log('Navigation elements:', elementCheck.navElements);
    console.log('Meaningful text samples:', elementCheck.meaningfulText);
    console.log('Has Icelandic text:', elementCheck.hasIcelandicText);
    console.log('Has English text:', elementCheck.hasEnglishText);
    
    // Check if the page is actually loading properly
    const loadingCheck = await page.evaluate(() => {
      return {
        hasLoadingSpinner: !!document.querySelector('[data-testid="loading"]') || 
                          !!document.querySelector('.loading') ||
                          !!document.querySelector('.spinner'),
        hasError: !!document.querySelector('[data-testid="error"]') ||
                 !!document.querySelector('.error') ||
                 document.body.textContent.includes('Error'),
        hasReactContent: document.querySelector('#root')?.children.length > 0
      };
    });
    
    console.log('\n=== LOADING CHECK ===');
    console.log('Has loading spinner:', loadingCheck.hasLoadingSpinner);
    console.log('Has error:', loadingCheck.hasError);
    console.log('Has React content:', loadingCheck.hasReactContent);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'page-screenshot.png' });
    console.log('\nScreenshot saved as page-screenshot.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testFullPage();