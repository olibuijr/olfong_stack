const { chromium } = require('playwright');

async function testReduxDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log('Browser console:', msg.text());
    }
  });

  try {
    console.log('Testing Redux store access...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Try to access Redux store through window
    const storeInfo = await page.evaluate(() => {
      try {
        // Check if store is available on window
        if (window.store) {
          return {
            hasStore: true,
            state: window.store.getState(),
            dispatch: typeof window.store.dispatch
          };
        }
        
        // Check if Redux DevTools are available
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
          return {
            hasDevTools: true,
            state: window.__REDUX_DEVTOOLS_EXTENSION__.getState()
          };
        }
        
        return { hasStore: false, hasDevTools: false };
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('Store info:', storeInfo);

    // Check if React components are mounted
    const componentInfo = await page.evaluate(() => {
      const root = document.querySelector('#root');
      if (!root) return { error: 'No root element' };
      
      // Check for React fiber nodes
      const reactFiber = root._reactInternalFiber || root._reactInternalInstance;
      
      return {
        hasRoot: true,
        hasReactFiber: !!reactFiber,
        rootChildren: root.children.length,
        rootHTML: root.innerHTML.substring(0, 500)
      };
    });
    console.log('Component info:', componentInfo);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testReduxDebug().catch(console.error);
