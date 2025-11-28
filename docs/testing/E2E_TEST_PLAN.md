# End-to-End Test Plan - 三个月一杆清台

**Test Date**: 2025-11-27
**Application**: https://waytoheyball.com
**Local Dev**: http://localhost:5001
**Status**: Ready for Execution

---

## Executive Summary

This test plan validates critical user paths following recent production fixes:
1. **Navigation restoration** - 5-item bottom navigation with Practice Arena and Ranking
2. **Training submission fix** - Fixed NULL primary_skill database error
3. **Core functionality** - 90-day challenge, Skills Library, Practice Arena, Ranking, Profile

### Test Scope
- **P0 Critical Paths**: Training submission, navigation, authentication
- **P1 Important Features**: Ability scores, progress tracking, ranking
- **P2 Additional Coverage**: Accessibility, performance metrics

### Success Criteria
- All 5 navigation items visible and functional
- Training submission completes without 500 errors
- Ability scores update correctly after training
- No console errors during core workflows

---

## Environment and Prerequisites

### Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local Dev | http://localhost:5001 | Pre-deployment validation |
| Production | https://waytoheyball.com | User acceptance testing |

### Browser Matrix

**Priority 1 (Must Test)**:
- Chrome/Edge (Chromium) - Latest stable
- Safari (iOS) - Latest
- Mobile viewports (375x667, 390x844)

**Priority 2 (Should Test)**:
- Firefox - Latest
- Safari (macOS) - Latest

### Test Data Requirements

**Test Accounts**:
- Existing user with training history (real data)
- Fresh registered user (new data)
- Demo mode (AUTH_DISABLED=true for local testing)

**Required Test Data**:
- Training session payload (rating, duration, notes)
- Exercise completion data
- Day curriculum data (day 1-90)

### Tool Versions
- Node.js: v20.x
- npm: v10.x
- Playwright: To be installed
- Browser DevTools: Built-in

---

## Test Matrix

### P0 - Critical Paths

#### TC-001: Bottom Navigation Display and Interaction
**Priority**: P0 - CRITICAL
**Objective**: Verify all 5 navigation items are visible and clickable

**Preconditions**:
- User is logged in
- On any authenticated page

**Test Steps**:
1. Navigate to homepage after login
2. Scroll to bottom of page to view navigation bar
3. Verify all 5 items are displayed:
   - 挑战 (Rocket icon)
   - 技能库 (BookOpen icon)
   - 练习场 (Target icon)
   - 排行榜 (Trophy icon)
   - 我的 (User icon)
4. Click each navigation item in sequence
5. Verify active state highlighting on each click
6. Check navigation persistence across page transitions

**Expected Results**:
- All 5 navigation items visible with correct icons and labels
- Each item clickable and navigates to correct route
- Active item highlighted with green background
- No console errors
- Navigation bar fixed at bottom with proper z-index

**Acceptance Criteria**:
- ✅ 5 navigation items displayed (not 4)
- ✅ Each route loads correct page component
- ✅ Active state visually distinct
- ✅ Icons render correctly

**Evidence Required**:
- Screenshot showing all 5 navigation items
- Screenshot of each active state
- Console log showing no errors

---

#### TC-002: Training Record Submission (90-Day Challenge)
**Priority**: P0 - CRITICAL
**Objective**: Verify training submission succeeds without NULL primary_skill errors

**Preconditions**:
- User logged in
- On 90-Day Challenge page (/ninety-day-challenge)
- Has current day curriculum available

**Test Steps**:
1. Navigate to 90-Day Challenge page
2. Click "开始训练" button on current day card
3. Complete training session (use timer or mock completion)
4. Click "提交训练" button
5. Fill in training submission modal:
   - Rating: Select 3-5 stars
   - Duration: Enter valid minutes (e.g., 30)
   - Notes: Optional text (e.g., "测试训练记录")
6. Submit training record
7. Wait for success confirmation
8. Verify ability scores updated in header
9. Check browser console for errors
10. Verify database record created (check training records list)

**Expected Results**:
- Training modal opens without errors
- Submission returns 200 OK status
- Success message displayed: "训练记录已保存"
- Ability scores increment in header
- Console shows success logs (not NULL column errors)
- Training appears in history/records list

**Acceptance Criteria**:
- ✅ No 500 Internal Server Error
- ✅ No "column null_total_difficulty_points does not exist" error
- ✅ Training record saved to ninety_day_training_records table
- ✅ Ability scores updated (accuracy/spin/positioning/power/strategy)
- ✅ Success feedback shown to user

**API Endpoint**: `POST /api/ninety-day/records`

**Request Payload Example**:
```json
{
  "dayNumber": 1,
  "rating": 4,
  "duration": 30,
  "notes": "测试训练记录",
  "completionTime": "2025-11-27T10:30:00Z"
}
```

**Expected Response**:
```json
{
  "success": true,
  "record": {
    "id": "...",
    "day_number": 1,
    "rating": 4,
    "duration": 30
  },
  "abilityScoreChanges": {
    "accuracy": 5,
    "spin": 3
  }
}
```

**Failure Scenarios to Test**:
- Invalid rating (0 or 6)
- Negative duration
- Missing required fields
- Duplicate submission for same day

**Evidence Required**:
- Screenshot of submission modal
- Screenshot of success message
- Network tab showing 200 response
- Console log showing no SQL errors
- Database query result showing new record

---

#### TC-003: User Authentication Flow
**Priority**: P0 - CRITICAL
**Objective**: Verify login, registration, and session management

**Test Steps - Login**:
1. Navigate to /login
2. Enter valid credentials (email + password)
3. Click "登录" button
4. Verify redirect to /ninety-day-challenge
5. Verify user profile loaded in header
6. Check localStorage for Supabase tokens
7. Refresh page and verify session persists

**Test Steps - Registration**:
1. Navigate to /register
2. Fill registration form:
   - Email: test-{timestamp}@example.com
   - Password: Test123!@#
   - Confirm password: Test123!@#
3. Submit registration
4. Verify Supabase user created
5. Verify automatic login after registration
6. Check user record in database

**Test Steps - Logout**:
1. Click logout button in profile menu
2. Verify redirect to /login
3. Verify tokens cleared from localStorage
4. Attempt to access /ninety-day-challenge
5. Verify redirect back to login

**Expected Results**:
- Login success with JWT tokens stored
- Registration creates Supabase Auth user + database record
- Session persists across page refreshes
- Logout clears authentication state
- Protected routes redirect to login when unauthenticated

**Evidence Required**:
- Screenshot of successful login
- localStorage showing access tokens
- Network tab showing /api/auth/user returning user data

---

### P1 - Important Features

#### TC-004: Ability Scores Consistency
**Priority**: P1 - HIGH
**Objective**: Verify ability scores are consistent across all pages

**Test Steps**:
1. Login and complete a training session
2. Note ability scores shown in header
3. Navigate to Profile page (/profile)
4. Verify scores match header values
5. Navigate to 90-Day Challenge page
6. Verify scores match in stats panel
7. Check API response from `/api/v1/dashboard/summary`
8. Verify field naming (camelCase: accuracy, spin, positioning, power, strategy)

**Expected Results**:
- All pages show identical ability scores
- Single source of truth: `/api/v1/dashboard/summary`
- No deprecated API calls to `/api/users/${userId}/ability-scores`
- No snake_case fields (accuracy_score → accuracy)
- Console shows no deprecation warnings

**Data Source**:
- ✅ Unified Hook: `useAbilityScores()`
- ❌ Deprecated: `useAbilityScoresForProfile(userId)`

**Evidence Required**:
- Screenshots showing scores on 3+ pages
- Network tab showing single API call to /v1/dashboard/summary
- Console log with no deprecation warnings

---

#### TC-005: Training Streak Calculation
**Priority**: P1 - HIGH
**Objective**: Verify streak merges data from both training systems

**Test Steps**:
1. Navigate to Profile page
2. Note current streak value
3. Complete training in Skills Library (if available)
4. Complete training in 90-Day Challenge
5. Refresh Profile page
6. Verify streak incremented
7. Check API response from `/api/user/streak`
8. Verify merged data from both tables:
   - `training_sessions` (Skills Library)
   - `ninety_day_training_records` (90-Day Challenge)

**Expected Results**:
- Streak calculation includes both training systems
- Current streak based on consecutive days from today/yesterday
- Longest streak tracked correctly
- 7-day activity pattern displayed

**API Endpoint**: `GET /api/user/streak`

**Evidence Required**:
- Screenshot of streak before/after training
- API response showing unified session list
- Console log showing merged data sources

---

#### TC-006: Practice Arena (8-Level System)
**Priority**: P1 - HIGH
**Objective**: Verify sequential exercise progression

**Test Steps**:
1. Navigate to Practice Arena (/levels)
2. Verify current level displayed
3. Note current exercise and completed count
4. Click "开始训练" on next exercise
5. Complete exercise (mock or real)
6. Submit completion
7. Verify `currentExercise` incremented
8. Verify `completedExercises` JSON updated
9. Complete all exercises in level
10. Verify next level unlocked

**Expected Results**:
- Exercises unlock sequentially within level
- Cannot skip ahead to future exercises
- Completing all exercises unlocks next level
- Progress persists across sessions

**Database Fields**:
- `currentLevel` (1-8)
- `currentExercise` (incremental)
- `completedExercises` (JSONB): `{"1": 5, "2": 0}`

**Evidence Required**:
- Screenshot showing locked/unlocked exercises
- Database query showing updated progress
- Console log showing level-up trigger

---

#### TC-007: Ranking System
**Priority**: P1 - MEDIUM
**Objective**: Verify ranking displays and updates

**Test Steps**:
1. Navigate to Ranking page (/ranking)
2. Verify 3 tabs: 周排行, 月排行, 总排行
3. Click each tab and verify data loads
4. Check ranking calculation methodology
5. Verify user's own rank highlighted
6. Complete training to improve rank
7. Refresh ranking page
8. Verify rank updated (may take time)

**Expected Results**:
- Rankings load without errors
- User's rank visible in each timeframe
- Correct sorting (highest clearance score first)
- Real-time or near-real-time updates

**Evidence Required**:
- Screenshot of each ranking tab
- Network tab showing ranking API calls
- Console log showing ranking calculation

---

#### TC-008: Skills Library (Theoretical Learning)
**Priority**: P1 - MEDIUM
**Objective**: Verify skills browsing and progress tracking

**Test Steps**:
1. Navigate to Skills Library (/tasks)
2. Browse available skills/modules
3. Click to view skill details
4. Complete skill learning (if interactive)
5. Verify progress saved
6. Check completion badges/markers

**Expected Results**:
- Skills organized by category
- Progress tracked per skill
- Completion persists across sessions
- No errors during navigation

**Evidence Required**:
- Screenshot of skills list
- Screenshot of skill detail page
- Console log showing no errors

---

### P2 - Additional Coverage

#### TC-009: Accessibility Testing
**Priority**: P2 - MEDIUM
**Objective**: Verify basic accessibility compliance

**Test Steps**:
1. Install axe DevTools browser extension
2. Navigate to each main page
3. Run axe accessibility scan
4. Review violations and warnings
5. Test keyboard navigation:
   - Tab through navigation items
   - Enter to activate links
   - Escape to close modals
6. Test screen reader compatibility (if available)
7. Verify color contrast ratios
8. Check form label associations

**Expected Results**:
- No critical accessibility violations
- All interactive elements keyboard accessible
- Proper focus indicators visible
- Form labels properly associated
- Color contrast meets WCAG AA standards

**Automated Tool**:
```bash
npx @axe-core/cli https://waytoheyball.com
```

**Evidence Required**:
- axe scan report (PDF or JSON)
- Screenshot showing keyboard focus states
- List of violations and remediation plan

---

#### TC-010: Performance Metrics
**Priority**: P2 - MEDIUM
**Objective**: Verify acceptable performance benchmarks

**Test Steps**:
1. Clear browser cache
2. Navigate to homepage
3. Run Lighthouse performance audit
4. Review Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - CLS (Cumulative Layout Shift)
   - INP (Interaction to Next Paint)
   - TTFB (Time to First Byte)
5. Test on 3G network throttling
6. Test on mobile device

**Expected Results**:
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- TTFB < 800ms
- Lighthouse Performance score > 70

**Automated Tool**:
```bash
npx lighthouse https://waytoheyball.com --only-categories=performance,accessibility,best-practices,seo --view
```

**Evidence Required**:
- Lighthouse report HTML file
- Screenshot of Core Web Vitals
- Network waterfall showing resource loading

---

## Execution Results

### Test Execution Summary

| Test Case | Status | Result | Notes |
|-----------|--------|--------|-------|
| TC-001: Navigation | 🔄 Pending | - | Awaiting execution |
| TC-002: Training Submission | 🔄 Pending | - | Critical fix verification |
| TC-003: Authentication | 🔄 Pending | - | - |
| TC-004: Ability Scores | 🔄 Pending | - | - |
| TC-005: Training Streak | 🔄 Pending | - | - |
| TC-006: Practice Arena | 🔄 Pending | - | - |
| TC-007: Ranking | 🔄 Pending | - | - |
| TC-008: Skills Library | 🔄 Pending | - | - |
| TC-009: Accessibility | 🔄 Pending | - | - |
| TC-010: Performance | 🔄 Pending | - | - |

**Legend**:
- 🔄 Pending - Not yet executed
- ✅ Pass - Test passed
- ❌ Fail - Test failed
- ⚠️ Warning - Partial pass with issues

---

## Issues and Recommendations

### Critical Issues
*To be filled after test execution*

### Performance Findings
*To be filled after test execution*

### Accessibility Findings
*To be filled after test execution*

---

## Automated Test Scripts

### Playwright Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Generate test code
npx playwright codegen https://waytoheyball.com
```

### Sample Playwright Test: Training Submission

```typescript
// tests/training-submission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('90-Day Challenge - Training Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('https://waytoheyball.com/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testPassword123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/ninety-day-challenge');
  });

  test('should submit training record successfully', async ({ page }) => {
    // Navigate to 90-Day Challenge
    await page.goto('https://waytoheyball.com/ninety-day-challenge');

    // Wait for page load
    await page.waitForSelector('text=当前课程');

    // Click start training button
    await page.click('button:has-text("开始训练")');

    // Wait for training modal
    await page.waitForSelector('text=提交训练');

    // Fill training details
    await page.click('[data-testid="rating-4"]'); // Select 4 stars
    await page.fill('input[name="duration"]', '30');
    await page.fill('textarea[name="notes"]', '自动化测试训练记录');

    // Submit training
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/ninety-day/records') && response.status() === 200
    );
    await page.click('button:has-text("提交训练")');

    // Verify successful response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Verify success message
    await expect(page.locator('text=训练记录已保存')).toBeVisible();

    // Verify ability scores updated (wait for header refresh)
    await page.waitForTimeout(1000);
    const clearanceScore = await page.locator('[data-testid="clearance-score"]').textContent();
    expect(parseInt(clearanceScore || '0')).toBeGreaterThan(0);
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('https://waytoheyball.com/ninety-day-challenge');
    await page.click('button:has-text("开始训练")');
    await page.waitForSelector('text=提交训练');

    // Try to submit without filling required fields
    await page.click('button:has-text("提交训练")');

    // Verify error message
    await expect(page.locator('text=请填写必填项')).toBeVisible();
  });

  test('should prevent duplicate submission for same day', async ({ page }) => {
    await page.goto('https://waytoheyball.com/ninety-day-challenge');

    // Submit first training
    await page.click('button:has-text("开始训练")');
    await page.click('[data-testid="rating-4"]');
    await page.fill('input[name="duration"]', '30');
    await page.click('button:has-text("提交训练")');
    await expect(page.locator('text=训练记录已保存')).toBeVisible();

    // Try to submit again for same day
    await page.click('button:has-text("开始训练")');

    // Should show "already completed" message or disabled state
    const submitButton = page.locator('button:has-text("提交训练")');
    await expect(submitButton).toBeDisabled();
  });
});
```

### Sample Playwright Test: Navigation

```typescript
// tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('https://waytoheyball.com/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testPassword123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/ninety-day-challenge');
  });

  test('should display all 5 navigation items', async ({ page }) => {
    // Verify navigation items
    await expect(page.locator('nav a:has-text("挑战")')).toBeVisible();
    await expect(page.locator('nav a:has-text("技能库")')).toBeVisible();
    await expect(page.locator('nav a:has-text("练习场")')).toBeVisible();
    await expect(page.locator('nav a:has-text("排行榜")')).toBeVisible();
    await expect(page.locator('nav a:has-text("我的")')).toBeVisible();

    // Verify icons
    await expect(page.locator('nav svg.lucide-rocket')).toBeVisible();
    await expect(page.locator('nav svg.lucide-book-open')).toBeVisible();
    await expect(page.locator('nav svg.lucide-target')).toBeVisible();
    await expect(page.locator('nav svg.lucide-trophy')).toBeVisible();
    await expect(page.locator('nav svg.lucide-user')).toBeVisible();
  });

  test('should navigate to each page correctly', async ({ page }) => {
    // Test 挑战
    await page.click('nav a:has-text("挑战")');
    await page.waitForURL('**/ninety-day-challenge');
    await expect(page.locator('h1:has-text("90天挑战")')).toBeVisible();

    // Test 技能库
    await page.click('nav a:has-text("技能库")');
    await page.waitForURL('**/tasks');
    await expect(page.locator('text=技能库')).toBeVisible();

    // Test 练习场
    await page.click('nav a:has-text("练习场")');
    await page.waitForURL('**/levels');
    await expect(page.locator('text=练习场')).toBeVisible();

    // Test 排行榜
    await page.click('nav a:has-text("排行榜")');
    await page.waitForURL('**/ranking');
    await expect(page.locator('text=排行榜')).toBeVisible();

    // Test 我的
    await page.click('nav a:has-text("我的")');
    await page.waitForURL('**/profile');
    await expect(page.locator('text=个人中心')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to each page and verify active state
    const pages = [
      { name: '挑战', url: '/ninety-day-challenge' },
      { name: '技能库', url: '/tasks' },
      { name: '练习场', url: '/levels' },
      { name: '排行榜', url: '/ranking' },
      { name: '我的', url: '/profile' },
    ];

    for (const navPage of pages) {
      await page.click(`nav a:has-text("${navPage.name}")`);
      await page.waitForURL(`**${navPage.url}`);

      // Verify active state (green background)
      const activeLink = page.locator(`nav a:has-text("${navPage.name}")`);
      await expect(activeLink).toHaveClass(/text-green-600|bg-green-50/);
    }
  });
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://waytoheyball.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Regression Test Plan

### Frequency and Triggers

**Automated Test Runs**:
- Every commit to main branch (CI/CD)
- Every pull request (pre-merge validation)
- Nightly builds (comprehensive suite)
- Before production deployments (smoke tests)

**Manual Test Runs**:
- After critical bug fixes (targeted regression)
- After major feature releases (full suite)
- Monthly quality audits (exploratory testing)

### Critical Path Coverage

**Must-Test Paths** (Automated):
1. Login → 90-Day Challenge → Submit Training → Verify Scores
2. Register → Onboarding → Start Challenge → Complete Day 1
3. Login → Practice Arena → Complete Exercise → Level Up
4. All 5 navigation items → Page load verification

**Should-Test Paths** (Manual):
1. Profile updates and settings changes
2. Ranking calculation and display
3. Diary entry creation with AI insights
4. Skills library browsing and completion

### Success Criteria

**Test Suite Execution**:
- 100% of P0 tests must pass before production deployment
- 95%+ of P1 tests must pass (with documented exceptions)
- P2 tests can have known issues if documented

**Performance Baseline**:
- No regression in Lighthouse performance score (tolerance: -5 points)
- No increase in API response times (tolerance: +100ms)
- No memory leaks detected during 30-minute stress test

**Accessibility Baseline**:
- No new critical violations introduced
- Existing violations documented and tracked

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: 20

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npx playwright test
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

---

## Manual Testing Guidelines

### Pre-Deployment Checklist

Before deploying to production, manually verify:

**Visual Inspection**:
- [ ] All 5 navigation items visible on mobile viewport
- [ ] No layout breaks or overlapping elements
- [ ] Icons and text properly aligned
- [ ] Active states visually distinct

**Functional Testing**:
- [ ] Login with test account
- [ ] Submit training record for current day
- [ ] Verify ability scores increment
- [ ] Navigate through all 5 main sections
- [ ] Check ranking displays correctly
- [ ] Verify profile data accuracy

**Cross-Browser Testing**:
- [ ] Chrome (Desktop + Mobile)
- [ ] Safari (iOS)
- [ ] Edge (Desktop)

**Error Scenarios**:
- [ ] Invalid login credentials
- [ ] Network timeout during submission
- [ ] Duplicate training submission
- [ ] Invalid form data (negative duration, etc.)

### Bug Reporting Template

When reporting issues found during testing:

```markdown
**Issue Title**: [Component] - Brief description

**Severity**: Critical | High | Medium | Low

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
What should happen

**Actual Result**:
What actually happened

**Environment**:
- Browser: Chrome 120.0
- Device: iPhone 13 Pro
- URL: https://waytoheyball.com/page
- Timestamp: 2025-11-27 10:30:00 UTC

**Screenshots**:
[Attach screenshots or videos]

**Console Errors**:
```
[Paste console errors]
```

**Network Logs**:
- Request URL: POST /api/endpoint
- Status Code: 500
- Response: { error: "..." }
```

---

## Testing Best Practices

### When Testing

1. **Clear Browser State**: Clear cache, cookies, and localStorage before each test run
2. **Use Real Data**: Test with actual production-like data when possible
3. **Test Edge Cases**: Don't just test happy paths
4. **Document Everything**: Screenshot, record, log everything
5. **Verify Database State**: Check database records after mutations
6. **Monitor Console**: Always have DevTools open during testing
7. **Test Mobile First**: Mobile users are primary audience
8. **Network Throttling**: Test on slow connections (3G)

### When Not to Test

1. **Don't Skip Preconditions**: Always ensure proper test setup
2. **Don't Test in Production**: Use staging or local environments for destructive tests
3. **Don't Ignore Flaky Tests**: Investigate and fix unstable tests
4. **Don't Hardcode Test Data**: Use dynamic test data generation
5. **Don't Test Without Baseline**: Establish baseline metrics before comparing

---

## Appendix

### Useful Commands

**Quick Smoke Test** (Production):
```bash
# Check homepage loads
curl -I https://waytoheyball.com

# Check API health
curl https://waytoheyball.com/api/auth/user -H "Authorization: Bearer TOKEN"

# Check all links
npx linkinator https://waytoheyball.com --recurse
```

**Database Verification** (Local):
```bash
# Check training records
npm run db:query "SELECT COUNT(*) FROM ninety_day_training_records WHERE created_at > NOW() - INTERVAL '1 day'"

# Check ability scores
npm run db:query "SELECT id, accuracy, spin, positioning, clearance FROM users WHERE id = 'USER_ID'"

# Check curriculum primary_skill
npm run db:query "SELECT day_number, primary_skill FROM ninety_day_curriculum WHERE primary_skill IS NULL"
```

### API Endpoints Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/user` | POST | Get current user | Yes |
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/migrate-login` | POST | Login with migration | No |
| `/api/ninety-day/records` | POST | Submit training | Yes |
| `/api/ninety-day/curriculum/:day` | GET | Get day curriculum | Yes |
| `/api/v1/dashboard/summary` | GET | Get ability scores | Yes |
| `/api/user/streak` | GET | Get training streak | Yes |
| `/api/training-programs/:level` | GET | Get exercises | Yes |
| `/api/ranking` | GET | Get leaderboard | Yes |

### Test Data Setup Scripts

```typescript
// scripts/setup-test-data.ts
import { db } from '../server/db';
import { users, ninetyDayCurriculum } from '../shared/schema';

async function setupTestData() {
  // Create test user
  const testUser = await db.insert(users).values({
    id: 'test-user-001',
    email: 'test@waytoheyball.com',
    firstName: '测试',
    lastName: '用户',
    level: 1,
    exp: 0,
    currentLevel: 1,
    currentExercise: 1,
    challengeCurrentDay: 1,
  }).returning();

  console.log('Test user created:', testUser);

  // Verify curriculum data
  const curriculumWithNull = await db
    .select()
    .from(ninetyDayCurriculum)
    .where(sql`primary_skill IS NULL`)
    .limit(5);

  console.log('Curriculum rows with NULL primary_skill:', curriculumWithNull.length);
}

setupTestData().catch(console.error);
```

---

## Test Report Template

After completing all tests, fill out this summary:

```markdown
# E2E Test Execution Report

**Test Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Production / Staging / Local
**Build Version**: [Commit SHA]

## Summary Statistics

- Total Test Cases: 10
- Passed: X
- Failed: Y
- Skipped: Z
- Pass Rate: XX%

## Critical Findings

### Blocker Issues
1. [Issue description with steps to reproduce]

### Major Issues
1. [Issue description]

### Minor Issues
1. [Issue description]

## Recommendations

1. [Action item 1]
2. [Action item 2]

## Sign-off

- [ ] All P0 tests passed
- [ ] All critical bugs fixed
- [ ] Performance baseline met
- [ ] Ready for production deployment

**Approved by**: [Name]
**Date**: YYYY-MM-DD
```

---

**Report Generated**: 2025-11-27
**Author**: Claude Code (Senior QA Engineer)
**Status**: ✅ Ready for Execution
