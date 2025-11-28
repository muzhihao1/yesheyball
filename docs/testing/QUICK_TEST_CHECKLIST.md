# Quick Test Checklist - 三个月一杆清台

**Purpose**: Fast manual verification after production deployment
**Time Required**: 10-15 minutes
**Target**: https://waytoheyball.com

---

## Pre-Test Setup

**Browser**: Chrome or Safari (latest version)
**Device**: Desktop + Mobile (or Chrome DevTools mobile emulation)
**Account**: Use existing test account or create new one

**Open DevTools**:
- Chrome: F12 or Cmd+Option+I
- Safari: Cmd+Option+I
- Keep **Console** tab open to monitor errors

---

## Critical Path Tests (Must Complete)

### ✅ Test 1: Bottom Navigation (2 min)

**Objective**: Verify all 5 navigation items work

1. [ ] Login to application
2. [ ] Scroll to bottom of page
3. [ ] Count navigation items - should be **5** (not 4)
   - [ ] 挑战 (Rocket icon)
   - [ ] 技能库 (BookOpen icon)
   - [ ] 练习场 (Target icon) ← **This was missing before**
   - [ ] 排行榜 (Trophy icon)
   - [ ] 我的 (User icon)
4. [ ] Click each item, verify page loads
5. [ ] Check active item has green highlight
6. [ ] **Console**: No errors

**Expected**: All 5 items visible and clickable
**Evidence**: Screenshot showing all 5 navigation items

---

### ✅ Test 2: Training Submission (3 min)

**Objective**: Verify training submission succeeds (critical bug fix)

1. [ ] Navigate to **挑战** (90-Day Challenge page)
2. [ ] Find current day card
3. [ ] Click "开始训练" button
4. [ ] Fill training form:
   - Rating: Select **4 stars**
   - Duration: Enter **30** minutes
   - Notes: Type "测试" (optional)
5. [ ] Click "提交训练" button
6. [ ] **Wait for response** (2-3 seconds)
7. [ ] Verify success message appears
8. [ ] **Console**: Check for errors
   - [ ] ❌ Should NOT see: "column null_total_difficulty_points does not exist"
   - [ ] ✅ Should see: 200 OK response
9. [ ] **Network Tab**: Verify `POST /api/ninety-day/records` returned 200

**Expected**:
- Success message displayed
- No 500 Internal Server Error
- Ability scores updated in header

**Evidence**:
- Screenshot of success message
- Network tab showing 200 response

---

### ✅ Test 3: Page Load Test (3 min)

**Objective**: Verify all main pages load without errors

Click each navigation item and verify:

1. [ ] **挑战** (/ninety-day-challenge)
   - Current day card displayed
   - Progress calendar visible
   - No console errors

2. [ ] **技能库** (/tasks)
   - Skills list displayed
   - Categories visible
   - No console errors

3. [ ] **练习场** (/levels) ← **Verify this restored page**
   - 8 levels displayed
   - Current level highlighted
   - Exercises visible
   - No console errors

4. [ ] **排行榜** (/ranking)
   - Ranking tabs displayed (周/月/总)
   - User rankings visible
   - No console errors

5. [ ] **我的** (/profile)
   - User profile displayed
   - Stats visible
   - No console errors

**Expected**: All pages load within 3 seconds, no errors

---

### ✅ Test 4: Ability Scores (2 min)

**Objective**: Verify scores are consistent and update correctly

1. [ ] Note ability scores in header (clearance score)
2. [ ] Navigate to **Profile** page
3. [ ] Verify scores match header
4. [ ] Navigate back to **挑战** page
5. [ ] Submit a training record (if not done in Test 2)
6. [ ] Wait for header to refresh
7. [ ] Verify scores incremented
8. [ ] **Console**: No deprecation warnings
9. [ ] **Network Tab**: Check `/api/v1/dashboard/summary` called (not old endpoint)

**Expected**:
- Scores consistent across pages
- Scores increment after training
- Using new unified API endpoint

**Evidence**: Screenshot showing scores on 2+ pages

---

## Quick Checks (1 min each)

### Mobile Responsiveness

1. [ ] Open Chrome DevTools (F12)
2. [ ] Toggle Device Toolbar (Cmd+Shift+M)
3. [ ] Select iPhone 13 Pro (390x844)
4. [ ] Verify navigation bar fits on screen
5. [ ] All 5 items visible (not cut off)
6. [ ] Icons and text readable

---

### Authentication Flow

1. [ ] Logout from profile menu
2. [ ] Verify redirect to /login
3. [ ] Login again with credentials
4. [ ] Verify redirect to /ninety-day-challenge
5. [ ] Session persists after page refresh

---

### Error Scenarios (Optional)

**Invalid Training Submission**:
1. [ ] Try to submit training without rating
2. [ ] Verify error message shown
3. [ ] Try negative duration
4. [ ] Verify validation works

**Duplicate Submission**:
1. [ ] Submit training for current day
2. [ ] Try to submit again for same day
3. [ ] Verify prevented or appropriate message shown

---

## Console Error Check

**Critical Errors to Watch For**:

❌ **Should NOT See**:
```
column "null_total_difficulty_points" does not exist
TypeError: Cannot read property 'primary_skill' of null
500 Internal Server Error
```

✅ **Acceptable Warnings**:
```
React DevTools warnings (minor)
TanStack Query cache updates (normal)
```

---

## Network Tab Verification

**Key API Calls to Verify**:

1. [ ] `POST /api/auth/user` → 200 OK (on page load)
2. [ ] `POST /api/ninety-day/records` → 200 OK (after training submission)
3. [ ] `GET /api/v1/dashboard/summary` → 200 OK (for ability scores)
4. [ ] `GET /api/user/streak` → 200 OK (for streak calculation)

**Red Flags**:
- [ ] Any 500 errors
- [ ] Repeated 401 Unauthorized (auth broken)
- [ ] Slow responses (>5 seconds)

---

## Success Criteria

**Minimum Requirements to Pass**:
- [x] All 5 navigation items visible and functional
- [x] Training submission succeeds without 500 errors
- [x] No "NULL column" errors in console
- [x] All main pages load successfully
- [x] Ability scores update after training

**Nice to Have**:
- [ ] Mobile layout looks good
- [ ] No console warnings
- [ ] Fast page loads (<2s)
- [ ] Smooth animations

---

## Quick Bug Report Template

If you find issues:

```markdown
**Bug**: [Brief description]
**Severity**: Critical | High | Medium | Low
**Page**: /page-url
**Steps**:
1. Step 1
2. Step 2
**Expected**: What should happen
**Actual**: What happened
**Console Error**: [Paste error message]
**Screenshot**: [Attach]
```

---

## Post-Test Actions

**If All Tests Pass** ✅:
- [ ] Mark deployment as successful
- [ ] Close monitoring window
- [ ] Document test completion time

**If Tests Fail** ❌:
- [ ] Document failing test cases
- [ ] Take screenshots of errors
- [ ] Copy console error messages
- [ ] Report to development team
- [ ] Rollback deployment if critical

---

## Automated Quick Test

**Using curl** (from terminal):

```bash
# Check homepage
curl -I https://waytoheyball.com
# Expected: HTTP/2 200

# Check API endpoint (requires auth token)
curl https://waytoheyball.com/api/v1/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
# Expected: JSON with ability scores

# Check training submission endpoint
curl -X POST https://waytoheyball.com/api/ninety-day/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dayNumber":1,"rating":4,"duration":30,"notes":"测试"}'
# Expected: 200 OK with success response
```

---

## Production vs Local Testing

**Production (https://waytoheyball.com)**:
- Use for final verification
- Test with real production data
- More stable, slower deployment cycle

**Local (http://localhost:5001)**:
- Use for pre-deployment testing
- Faster iteration
- Safe to test destructive operations

**Recommended Flow**:
1. Test locally first
2. Deploy to production
3. Run quick tests on production
4. Monitor for 24 hours

---

**Checklist Version**: 1.0
**Last Updated**: 2025-11-27
**Estimated Time**: 10-15 minutes
**Status**: Ready for Use
