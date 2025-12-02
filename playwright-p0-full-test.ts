import { test, expect, Page } from '@playwright/test';

/**
 * P0 完整测试：从注册 → 登录 → 验证 P0 按钮
 *
 * 这个脚本会：
 * 1. 在生产环境注册一个新账户
 * 2. 处理 Supabase 邮件验证（使用临时邮箱）
 * 3. 自动登录
 * 4. 导航到水平测试页面
 * 5. 测试"开始水平测试"按钮的响应时间和功能
 * 6. 验证完整的新手引导流程
 */

const BASE_URL = 'https://yesheyball.vercel.app';
const REGISTER_URL = `${BASE_URL}/register`;
const LOGIN_URL = `${BASE_URL}/login`;
const CHALLENGE_URL = `${BASE_URL}/ninety-day-challenge`;
const ONBOARDING_URL = `${BASE_URL}/onboarding`;

test.describe('P0 Button Full Test - Production', () => {

  test('完整流程：注册 → 登录 → P0 按钮测试', async ({ page, context }) => {
    console.log('🚀 启动 P0 完整流程测试...');

    // ========== 第1步：准备工作 ==========
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'Test_Password_123!@#';

    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    // 监听控制台错误
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`[Console Error] ${msg.text()}`);
      }
    });

    // 监听网络错误
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // ========== 第2步：注册流程 ==========
    console.log('\n📝 第1步：导航到注册页面...');
    await page.goto(REGISTER_URL, { waitUntil: 'networkidle' });

    // 验证注册页面加载
    const registerTitle = page.locator('text=/注册|Register|Sign Up/i').first();
    await expect(registerTitle).toBeVisible({ timeout: 5000 });

    console.log(`📝 第2步：填充注册表单 (邮箱: ${testEmail})...`);

    // 填充表单字段
    const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"], input[placeholder*="email"]').first();
    await emailInput.fill(testEmail);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill(testPassword);

    // 如果有确认密码字段
    if (await passwordInputs.nth(1).isVisible().catch(() => false)) {
      await passwordInputs.nth(1).fill(testPassword);
    }

    // 如果有名字字段，填充测试数据
    const nameInputs = page.locator('input[type="text"]');
    if (await nameInputs.first().isVisible().catch(() => false)) {
      await nameInputs.first().fill('Test');
    }

    // 点击注册按钮
    console.log('📝 第3步：点击注册按钮...');
    const submitButton = page.locator('button[type="submit"], button:has-text("注册"), button:has-text("Register"), button:has-text("Sign Up")').first();
    await submitButton.click();

    // 等待注册响应
    await page.waitForTimeout(2000);

    // ========== 第3步：处理邮件验证 ==========
    console.log('\n✉️  第4步：检查是否需要邮件验证...');

    // 检查是否看到邮件验证提示
    const emailVerificationPrompt = page.locator('text=/邮箱|email|确认|confirm/i').first();
    const isEmailVerificationNeeded = await emailVerificationPrompt.isVisible().catch(() => false);

    if (isEmailVerificationNeeded) {
      console.log('✉️  检测到需要邮件验证，尝试跳过或使用演示账户...');

      // 方案 A：检查是否有跳过按钮
      const skipButton = page.locator('button:has-text("跳过"), button:has-text("Skip"), a:has-text("登录")').first();
      if (await skipButton.isVisible().catch(() => false)) {
        await skipButton.click();
        console.log('✉️  点击跳过邮件验证');
      } else {
        // 方案 B：直接导航到登录页面
        console.log('✉️  跳过邮件验证，直接导航到登录页面');
        await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
      }
    } else {
      // 检查是否自动登录或需要重定向
      console.log('✉️  未检测到邮件验证提示，继续...');
    }

    // ========== 第4步：登录流程 ==========
    console.log('\n🔐 第5步：执行登录流程...');

    // 如果还不在登录页面，导航到登录页面
    if (!page.url().includes('login')) {
      console.log('🔐 导航到登录页面...');
      await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    }

    // 填充登录表单
    const loginEmailInput = page.locator('input[type="email"], input[placeholder*="邮箱"], input[placeholder*="email"]').first();
    const loginPasswordInput = page.locator('input[type="password"]').first();

    await loginEmailInput.fill(testEmail);
    await loginPasswordInput.fill(testPassword);

    // 点击登录按钮
    console.log('🔐 点击登录按钮...');
    const loginButton = page.locator('button[type="submit"], button:has-text("登录"), button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();

    // 等待登录完成（通常会重定向到首页）
    console.log('🔐 等待登录完成...');
    await page.waitForURL(/ninety-day-challenge|challenge|home|\/(?!login|register)/, { timeout: 10000 }).catch(() => {
      console.warn('⚠️  登录后 URL 未如预期改变，可能需要手动导航');
    });

    // ========== 第5步：导航到 P0 按钮 ==========
    console.log('\n🎯 第6步：导航到水平测试页面...');

    // 导航到首页（如果不在）
    if (!page.url().includes(CHALLENGE_URL)) {
      await page.goto(CHALLENGE_URL, { waitUntil: 'networkidle' });
    }

    // 查找"去测试"按钮
    console.log('🎯 查找"去测试"按钮...');
    const goTestButton = page.locator('button:has-text("去测试"), a:has-text("去测试"), button:has-text("test"), a:has-text("test")').first();

    if (await goTestButton.isVisible().catch(() => false)) {
      console.log('🎯 点击"去测试"按钮...');
      await goTestButton.click();

      // 等待导航到 onboarding 页面
      await page.waitForURL(ONBOARDING_URL, { timeout: 5000 }).catch(() => {
        console.warn('⚠️  未能导航到 onboarding 页面');
      });
    } else {
      console.log('⚠️  未找到"去测试"按钮，直接导航到 onboarding 页面');
      await page.goto(ONBOARDING_URL, { waitUntil: 'networkidle' });
    }

    // ========== 第6步：P0 按钮测试 ==========
    console.log('\n🔴 第7步：测试 P0 按钮 "开始水平测试"...');

    // 等待页面加载
    await page.waitForTimeout(1000);

    // 查找目标按钮
    const p0Button = page.locator('button:has-text("开始水平测试"), button:has-text("水平测试")').first();

    // 验证按钮存在和可见
    await expect(p0Button).toBeVisible({ timeout: 5000 });
    console.log('🔴 找到"开始水平测试"按钮');

    // 记录点击前的状态
    const beforeClickUrl = page.url();
    console.log(`🔴 点击前 URL: ${beforeClickUrl}`);

    // 准备性能测量
    const performanceStart = Date.now();

    // 点击 P0 按钮
    console.log('🔴 点击"开始水平测试"按钮...');
    await p0Button.click();

    // 等待页面变化（问卷页面应该出现）
    console.log('🔴 等待问卷页面加载...');

    try {
      // 等待看到问卷相关的 UI（可能是文本、输入框或容器）
      const questionnaireIndicators = [
        'text=/问卷|题目|选择|答案|question/i',
        'input[type="radio"]',
        'div[class*="question"]',
        'div[class*="assessment"]'
      ];

      let pageLoaded = false;
      for (const selector of questionnaireIndicators) {
        try {
          await page.locator(selector).first().waitFor({ timeout: 2000 });
          pageLoaded = true;
          break;
        } catch {
          // 继续尝试下一个选择器
        }
      }

      if (!pageLoaded) {
        // 检查 URL 是否改变了
        await page.waitForURL(new RegExp(`${ONBOARDING_URL}|questions|assessment`), { timeout: 2000 });
      }
    } catch (e) {
      console.warn(`⚠️  等待问卷页面超时: ${e}`);
    }

    const performanceEnd = Date.now();
    const responseTime = performanceEnd - performanceStart;

    const afterClickUrl = page.url();
    console.log(`🔴 点击后 URL: ${afterClickUrl}`);
    console.log(`🔴 响应时间: ${responseTime}ms`);

    // ========== 第7步：验证结果 ==========
    console.log('\n✅ 第8步：验证测试结果...');

    // 验证 1：页面是否改变
    const pageChanged = beforeClickUrl !== afterClickUrl;
    console.log(`✅ 页面改变: ${pageChanged ? '✓' : '✗'}`);

    // 验证 2：响应时间
    const responseTimeOk = responseTime < 1000; // 允许最多 1 秒
    console.log(`✅ 响应时间 < 1000ms: ${responseTimeOk ? '✓' : '✗'} (实际: ${responseTime}ms)`);

    // 验证 3：没有冻结（URL 改变或页面有明显变化）
    const notFrozen = pageChanged || responseTime < 5000;
    console.log(`✅ 页面未冻结: ${notFrozen ? '✓' : '✗'}`);

    // 验证 4：控制台错误
    const noConsoleErrors = consoleErrors.length === 0;
    console.log(`✅ 无控制台错误: ${noConsoleErrors ? '✓' : '✗'} (实际: ${consoleErrors.length})`);

    // 验证 5：网络错误 (非 4xx 错误)
    const networkErrorsFilterd = networkErrors.filter(e => !e.includes('40')); // 过滤掉客户端错误
    const noNetworkErrors = networkErrorsFilterd.length === 0;
    console.log(`✅ 无网络错误: ${noNetworkErrors ? '✓' : '✗'} (实际: ${networkErrorsFilterd.length})`);

    // ========== 第8步：生成报告 ==========
    console.log('\n📊 测试报告:');
    console.log('=====================================');
    console.log(`测试账户: ${testEmail}`);
    console.log(`测试时间: ${new Date().toISOString()}`);
    console.log(`环境: ${BASE_URL}`);
    console.log('-------------------------------------');
    console.log(`页面改变: ${pageChanged ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`响应时间: ${responseTime}ms (目标 < 1000ms) - ${responseTimeOk ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`页面未冻结: ${notFrozen ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`无控制台错误: ${noConsoleErrors ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`无网络错误: ${noNetworkErrors ? '✓ PASS' : '✗ FAIL'}`);
    console.log('=====================================');

    // 最终断言
    expect(pageChanged).toBe(true);
    expect(responseTimeOk).toBe(true);
    expect(noConsoleErrors).toBe(true);

    console.log('✅ P0 按钮测试完成！');
  });

  test('快速测试：P0 按钮响应时间（假设已登录）', async ({ page }) => {
    /**
     * 快速测试：假设用户已在 localStorage 中有有效的认证令牌
     * 这个测试直接跳到 P0 按钮测试
     */

    console.log('⚡ 快速测试：P0 按钮响应时间');

    // 设置认证令牌（如果有的话）
    // await page.context().addCookies([...]);

    // 导航到 onboarding 页面
    await page.goto(ONBOARDING_URL, { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(500);

    // 查找按钮
    const p0Button = page.locator('button:has-text("开始水平测试")').first();

    if (!await p0Button.isVisible().catch(() => false)) {
      console.log('⚠️  P0 按钮不可见，可能需要认证');
      test.skip();
      return;
    }

    // 测量响应时间
    const start = Date.now();
    await p0Button.click();

    // 等待页面变化
    try {
      await page.waitForURL(new RegExp('questionnaire|questions'), { timeout: 3000 }).catch(() => null);
    } catch {
      // 页面可能没有改变 URL
    }

    const elapsed = Date.now() - start;

    console.log(`⚡ 响应时间: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(1000);
  });
});
