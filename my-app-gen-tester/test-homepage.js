const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    console.log('[CONSOLE ' + type + ']:', text);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.error('[PAGE ERROR]:', error.message);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('\n=== PAGE LOADED ===\n');
    
    // Take full page screenshot
    await page.screenshot({ path: '/tmp/homepage-full.png', fullPage: true });
    console.log('Screenshot saved: /tmp/homepage-full.png');
    
    // Get page title
    const title = await page.title();
    console.log('\nPage title: ' + title);
    
    // Check for key elements
    console.log('\n=== CHECKING UI ELEMENTS ===\n');
    
    // Check for header/title
    let headerText = '';
    try {
      const h1 = await page.locator('h1').first();
      if (await h1.count() > 0) {
        headerText = await h1.textContent();
        console.log('✅ H1 found: "' + headerText + '"');
      }
    } catch (e) {
      console.log('❌ No H1 found');
    }
    
    // Check all buttons
    const buttons = await page.locator('button').all();
    console.log('\nButtons found: ' + buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log('  - Button ' + (i + 1) + ': "' + text.trim() + '"');
    }
    
    // Check all links
    const links = await page.locator('a').all();
    console.log('\nLinks found: ' + links.length);
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      console.log('  - Link ' + (i + 1) + ': "' + text.trim() + '" -> ' + href);
    }
    
    // Check for Sign In
    const signIn = await page.locator('text=Sign In').first();
    if (await signIn.count() > 0) {
      console.log('\n✅ Sign In found');
    } else {
      console.log('\n❌ Sign In not found');
    }
    
    // Check for Sign Up
    const signUp = await page.locator('text=Sign Up').first();
    if (await signUp.count() > 0) {
      console.log('✅ Sign Up found');
    } else {
      console.log('❌ Sign Up not found');
    }
    
    // Check for upload area
    const fileInput = await page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('✅ File upload input found');
    } else {
      console.log('ℹ️  File upload input not visible (may require authentication)');
    }
    
    // Check for Generate button
    const generate = await page.locator('button:has-text("Generate")').first();
    if (await generate.count() > 0) {
      console.log('✅ Generate button found');
    } else {
      console.log('ℹ️  Generate button not visible (may require authentication)');
    }
    
    // Get all visible text content
    console.log('\n=== VISIBLE TEXT CONTENT (first 800 chars) ===\n');
    const bodyText = await page.locator('body').textContent();
    console.log(bodyText.substring(0, 800));
    
    // Take a viewport screenshot
    await page.screenshot({ path: '/tmp/homepage-viewport.png' });
    console.log('\n\nViewport screenshot saved: /tmp/homepage-viewport.png');
    
    console.log('\n=== SUMMARY ===');
    console.log('Console logs: ' + consoleLogs.length);
    console.log('Page errors: ' + pageErrors.length);
    if (pageErrors.length > 0) {
      console.log('\nErrors detected:');
      pageErrors.forEach((err, i) => {
        console.log('  ' + (i + 1) + '. ' + err);
      });
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png' });
    console.log('Error screenshot saved: /tmp/error-screenshot.png');
  } finally {
    await browser.close();
  }
})();
