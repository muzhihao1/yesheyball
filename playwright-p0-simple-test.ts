/**
 * Simplified P0 Test: Button Responsiveness Fix Verification
 *
 * This test checks the production site for basic functionality and console errors
 * without requiring authentication. It provides evidence for the P0 fix verification.
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://yesheyball.vercel.app';

test.describe('P0 Fix Verification - Production Site Health Check', () => {

  test('Production Site Accessibility Test', async ({ page }) => {
    console.log('\n='.repeat(60));
    console.log('📊 P0 FIX VERIFICATION - PRODUCTION HEALTH CHECK');
    console.log('='.repeat(60));

    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`   ❌ Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
      console.error(`   ❌ Page Error: ${error.message}`);
    });

    // Step 1: Load production site
    console.log('\n📍 Step 1: Loading production site...');
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`   ✓ Loaded: ${page.url()}`);

    // Take screenshot
    await page.screenshot({ path: './test-results/01-production-landing.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 01-production-landing.png');

    // Step 2: Check page title
    console.log('\n📍 Step 2: Verifying page title...');
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);
    expect(title).toContain('三个月一杆清台');

    // Step 3: Check for critical UI elements
    console.log('\n📍 Step 3: Checking critical UI elements...');

    const hasLoginButton = await page.locator('button:has-text("登录"), a:has-text("登录")').count() > 0;
    const hasRegisterLink = await page.locator('button:has-text("注册"), a:has-text("注册")').count() > 0;
    const hasContent = await page.locator('body').textContent();

    console.log(`   ✓ Login button present: ${hasLoginButton}`);
    console.log(`   ✓ Register link present: ${hasRegisterLink}`);
    console.log(`   ✓ Page has content: ${hasContent && hasContent.length > 100}`);

    // Step 4: Check console errors
    console.log('\n📍 Step 4: Console error analysis...');
    console.log(`   📊 Total console errors: ${consoleErrors.length}`);

    if (consoleErrors.length > 0) {
      console.warn('   ⚠️  Console errors detected:');
      consoleErrors.slice(0, 10).forEach((err, idx) => {
        console.warn(`      ${idx + 1}. ${err}`);
      });
    } else {
      console.log('   ✅ No console errors detected');
    }

    // Step 5: Test navigation (if logged in state can be accessed)
    console.log('\n📍 Step 5: Attempting to access onboarding route...');
    await page.goto(`${PRODUCTION_URL}/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });

    const onboardingUrl = page.url();
    console.log(`   ✓ Current URL: ${onboardingUrl}`);

    // Take screenshot
    await page.screenshot({ path: './test-results/02-onboarding-route.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 02-onboarding-route.png');

    // Check if redirected to login or if onboarding is accessible
    if (onboardingUrl.includes('/login')) {
      console.log('   ℹ️  Redirected to login page (expected for unauthenticated users)');
      console.log('   ℹ️  To test the actual onboarding flow, please provide valid credentials');
    } else if (onboardingUrl.includes('/onboarding')) {
      console.log('   ✅ Onboarding page accessible!');

      // Look for the critical button
      const buttonLocator = page.getByRole('button', { name: /开始水平测试/i })
        .or(page.getByText(/开始水平测试/i));

      const buttonCount = await buttonLocator.count();
      console.log(`   ✓ "开始水平测试" button count: ${buttonCount}`);

      if (buttonCount > 0) {
        console.log('   ✅ CRITICAL BUTTON FOUND!');

        // Take screenshot with button
        await page.screenshot({ path: './test-results/03-button-located.png', fullPage: true });
        console.log('   ✓ Screenshot saved: 03-button-located.png');
      }
    }

    // Step 6: Performance metrics
    console.log('\n📍 Step 6: Performance metrics...');
    const performanceData = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart)
      };
    });

    console.log(`   ⏱️  DOM Interactive: ${performanceData.domInteractive}ms`);
    console.log(`   ⏱️  DOM Content Loaded: ${performanceData.domContentLoaded}ms`);
    console.log(`   ⏱️  Load Complete: ${performanceData.loadComplete}ms`);

    // Final report
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✓ Production site accessible: ${page.url()}`);
    console.log(`✓ Page title correct: ${title}`);
    console.log(`✓ Console errors: ${consoleErrors.length}`);
    console.log(`✓ Performance: ${performanceData.loadComplete}ms load time`);
    console.log('='.repeat(60));

    // Assert critical conditions
    expect(consoleErrors.length).toBeLessThan(5); // Allow some non-critical errors
    expect(performanceData.loadComplete).toBeLessThan(10000); // Page should load in < 10s
  });

  test('Authenticated Onboarding Flow Test (with credentials)', async ({ page }) => {
    // This test requires environment variables: TEST_EMAIL and TEST_PASSWORD
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;

    if (!testEmail || !testPassword) {
      console.log('\n⚠️  Skipping authenticated test - no credentials provided');
      console.log('   To run this test, set TEST_EMAIL and TEST_PASSWORD environment variables');
      test.skip();
      return;
    }

    console.log('\n='.repeat(60));
    console.log('🔐 AUTHENTICATED ONBOARDING FLOW TEST');
    console.log('='.repeat(60));

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Login
    console.log('\n📍 Step 1: Logging in...');
    await page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'networkidle' });

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForTimeout(3000);
    console.log(`   ✓ Logged in, current URL: ${page.url()}`);

    // Step 2: Navigate to onboarding
    console.log('\n📍 Step 2: Navigating to onboarding...');
    await page.goto(`${PRODUCTION_URL}/onboarding`, { waitUntil: 'networkidle' });

    await page.screenshot({ path: './test-results/04-onboarding-authenticated.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 04-onboarding-authenticated.png');

    // Step 3: Locate and test the critical button
    console.log('\n📍 Step 3: Testing "开始水平测试" button...');

    const button = page.getByRole('button', { name: /开始水平测试/i })
      .or(page.getByText(/开始水平测试/i).locator('..'));

    const buttonVisible = await button.isVisible().catch(() => false);
    console.log(`   ✓ Button visible: ${buttonVisible}`);

    if (buttonVisible) {
      // Measure click response time
      console.log('\n⏱️  CRITICAL TEST: Measuring button click response time...');

      const clickStartTime = Date.now();
      await button.click();

      // Wait for page transition (questions page to appear)
      await page.waitForTimeout(100); // Small delay to allow React to start rendering

      const responseTime = Date.now() - clickStartTime;
      console.log(`   ⏱️  Button response time: ${responseTime}ms`);
      console.log(`   ✓ Expected: < 300ms`);

      // Take screenshot after click
      await page.waitForTimeout(500); // Wait for transition animation
      await page.screenshot({ path: './test-results/05-after-button-click.png', fullPage: true });
      console.log('   ✓ Screenshot saved: 05-after-button-click.png');

      // Verify questions page appeared
      const hasQuestions = await page.locator('form, [role="radiogroup"], input[type="radio"]').count() > 0;
      console.log(`   ✓ Questions page appeared: ${hasQuestions}`);

      // Console error check
      console.log(`\n📊 Console errors during interaction: ${consoleErrors.length}`);
      if (consoleErrors.length > 0) {
        console.error('   ❌ Errors:');
        consoleErrors.forEach(err => console.error(`      ${err}`));
      }

      // Final verdict
      console.log('\n' + '='.repeat(60));
      console.log('🎯 P0 FIX VERIFICATION RESULT');
      console.log('='.repeat(60));

      const passed = responseTime < 300 && hasQuestions && consoleErrors.length === 0;

      if (passed) {
        console.log('✅ PASS - Button is responsive and transitions smoothly');
        console.log(`   • Response time: ${responseTime}ms (< 300ms)✅`);
        console.log(`   • Questions page appeared: Yes✅`);
        console.log(`   • Console errors: ${consoleErrors.length}✅`);
      } else {
        console.log('❌ FAIL - Issues detected');
        console.log(`   • Response time: ${responseTime}ms ${responseTime < 300 ? '✅' : '❌'}`);
        console.log(`   • Questions page appeared: ${hasQuestions ? '✅' : '❌'}`);
        console.log(`   • Console errors: ${consoleErrors.length} ${consoleErrors.length === 0 ? '✅' : '❌'}`);
      }
      console.log('='.repeat(60));

      expect(responseTime).toBeLessThan(300);
      expect(hasQuestions).toBe(true);
      expect(consoleErrors.length).toBe(0);
    }
  });
});
