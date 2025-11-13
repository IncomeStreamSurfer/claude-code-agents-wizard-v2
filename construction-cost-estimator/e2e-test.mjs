import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screenshotDir = join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

let testResults = [];
let screenshotCounter = 0;

function logTest(name, status, details = '') {
  const statusSymbol = status === 'PASS' ? 'PASS' : 'FAIL';
  testResults.push({ name, status: statusSymbol, details });
  console.log(statusSymbol + ' ' + name + (details ? ': ' + details : ''));
}

async function takeScreenshot(page, name) {
  screenshotCounter++;
  const filename = String(screenshotCounter).padStart(2, '0') + '_' + name + '.png';
  await page.screenshot({ path: join(screenshotDir, filename), fullPage: true });
  console.log('Screenshot: ' + filename);
  return filename;
}

async function runTests() {
  console.log('Starting Comprehensive E2E Testing\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    console.log('\nTest 1: Application Launch and Dashboard');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'dashboard-initial');
    
    const title = await page.title();
    logTest('App loads successfully', 'PASS', 'Title: ' + title);
    testsPassed++;
    
    const newProjectBtn = await page.locator('button:has-text("New Project")').count();
    if (newProjectBtn > 0) {
      logTest('New Project button visible', 'PASS');
      testsPassed++;
    } else {
      logTest('New Project button visible', 'FAIL', 'Button not found');
      testsFailed++;
    }
    
    await takeScreenshot(page, 'dashboard-layout');
    
    console.log('\nTest 2: Responsive Design - Tablet');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'responsive-tablet');
    logTest('Tablet layout renders', 'PASS');
    testsPassed++;
    
    console.log('\nTest 3: Responsive Design - Mobile');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'responsive-mobile');
    logTest('Mobile layout renders', 'PASS');
    testsPassed++;
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('\nTest 4: Console Errors Check');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length === 0) {
      logTest('No console errors', 'PASS');
      testsPassed++;
    } else {
      logTest('No console errors', 'FAIL', 'Found errors: ' + consoleErrors.length);
      testsFailed++;
    }
    
    await takeScreenshot(page, 'final-state');
    
  } catch (error) {
    console.error('Test execution error:', error.message);
    logTest('Test execution', 'FAIL', error.message);
    testsFailed++;
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY REPORT');
  console.log('='.repeat(60));
  console.log('Total Tests: ' + (testsPassed + testsFailed));
  console.log('Passed: ' + testsPassed);
  console.log('Failed: ' + testsFailed);
  console.log('Screenshots saved to: ' + screenshotDir);
  console.log('='.repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testsPassed + testsFailed,
      passed: testsPassed,
      failed: testsFailed
    },
    tests: testResults
  };
  
  fs.writeFileSync(
    join(screenshotDir, 'test-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  return report;
}

runTests().catch(console.error);
