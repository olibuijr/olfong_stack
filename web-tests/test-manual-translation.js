const { chromium } = require('playwright');

async function testManualTranslation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:3001');
    
    console.log('Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Manually trigger translation loading by calling the API directly
    console.log('Testing translation API directly...');
    
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/translations/language/is');
        const data = await response.json();
        return {
          success: data.success,
          dataLength: data.data?.length || 0,
          sampleKeys: data.data?.slice(0, 5).map(t => t.key) || []
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('API Test Result:', apiTest);
    
    // Check if the translation system is working by looking at the page content
    const contentAnalysis = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Count different types of content
      const rawKeys = (bodyText.match(/[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*/g) || []).length;
      const icelandicWords = ['Verslun', 'Allt', 'Vörur', 'Flokkar', 'Vín', 'Bjór', 'Afhending', 'Innskráning'].filter(word => bodyText.includes(word)).length;
      const englishWords = ['Shop', 'All', 'Items', 'Categories', 'Wine', 'Beer', 'Delivery', 'Login'].filter(word => bodyText.includes(word)).length;
      
      return {
        rawKeys,
        icelandicWords,
        englishWords,
        totalLength: bodyText.length,
        hasMixedContent: rawKeys > 0 && icelandicWords > 0
      };
    });
    
    console.log('\n=== CONTENT ANALYSIS ===');
    console.log('Raw translation keys found:', contentAnalysis.rawKeys);
    console.log('Icelandic words found:', contentAnalysis.icelandicWords);
    console.log('English words found:', contentAnalysis.englishWords);
    console.log('Total content length:', contentAnalysis.totalLength);
    console.log('Has mixed content:', contentAnalysis.hasMixedContent);
    
    // Check if the page is actually using the translation system
    const translationSystemCheck = await page.evaluate(() => {
      // Check if there are any elements that look like they're using the translation system
      const elementsWithKeys = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.match(/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/);
      });
      
      const elementsWithTranslatedText = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && 
               text.length > 0 && 
               text.length < 50 && 
               !text.includes('.') && 
               !text.match(/^[0-9.,]+$/) &&
               !text.includes('import') &&
               !text.includes('window') &&
               (text.includes('Vín') || text.includes('Bjór') || text.includes('Verslun'));
      });
      
      return {
        elementsWithKeys: elementsWithKeys.length,
        elementsWithTranslatedText: elementsWithTranslatedText.length,
        sampleKeys: elementsWithKeys.slice(0, 5).map(el => el.textContent.trim()),
        sampleTranslated: elementsWithTranslatedText.slice(0, 5).map(el => el.textContent.trim())
      };
    });
    
    console.log('\n=== TRANSLATION SYSTEM CHECK ===');
    console.log('Elements with raw keys:', translationSystemCheck.elementsWithKeys);
    console.log('Elements with translated text:', translationSystemCheck.elementsWithTranslatedText);
    console.log('Sample raw keys:', translationSystemCheck.sampleKeys);
    console.log('Sample translated text:', translationSystemCheck.sampleTranslated);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testManualTranslation();