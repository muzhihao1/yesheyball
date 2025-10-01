# Email Authentication Migration Guide

## 🎯 Overview

This migration adds email/password authentication to replace Replit OAuth. The system uses bcrypt for secure password hashing and maintains backward compatibility with existing user data.

## 📋 Prerequisites

- Supabase database access
- Existing users table with data
- Environment variables configured

## 🗄️ Database Migration

### Step 1: Add password_hash Column

Run this SQL in Supabase SQL Editor:

```sql
-- Add password_hash column to users table for email/password authentication
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for email/password authentication. Nullable for users who haven''t set a password yet.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';
```

### Step 2: (Optional) Set Password for Existing User

If you want to give an existing user a password:

```sql
-- This is a bcrypt hash of 'yesheyball123' (example password)
-- Generated with: bcrypt.hash('yesheyball123', 12)
UPDATE users
SET password_hash = '$2b$12$LQ5h4YxZ9FQkE8X.m6y6JeU5mKZGHvN7hV8dC6xJ4YqZH3M2nO1Gy'
WHERE email = 'your-email@example.com';
```

**IMPORTANT:** Replace the hash above with a real bcrypt hash for your desired password!

## 🔐 Environment Variables

Ensure these are set in Vercel:

```bash
DATABASE_URL=postgresql://... (your Supabase connection string)
SESSION_SECRET=your-random-secret-key
OPENAI_API_KEY=sk-... (if using AI features)

# Optional: For access control during transition
AUTH_DISABLED=false  # Set to true for demo mode
```

## 🚀 Deployment Steps

### 1. Push Code to Git

```bash
git add .
git commit -m "feat: add email/password authentication system"
git push origin main
```

### 2. Vercel Auto-Deploy

Vercel will automatically:
- Deploy the new code
- Install new dependencies (bcryptjs, dotenv)
- Rebuild the application

### 3. Run Database Migration

Go to Supabase → SQL Editor and run the migration SQL from Step 1 above.

### 4. Verify Deployment

1. Visit your deployed site: `https://your-app.vercel.app`
2. You should see the login page (not the old landing page)
3. Click "立即注册" (Register Now)
4. Create a test account
5. Login with the new account

## 🧪 Testing Checklist

### Registration Flow
- [ ] Visit `/register`
- [ ] Fill in email, name, password
- [ ] Submit form
- [ ] Verify success message
- [ ] Redirected to `/login`

### Login Flow
- [ ] Visit `/login`
- [ ] Enter email and password
- [ ] Submit form
- [ ] Verify success toast
- [ ] Redirected to `/levels`
- [ ] Session persists on page reload

### Protected Routes
- [ ] Logout
- [ ] Try accessing `/levels` without login
- [ ] Redirected to `/login`

### Existing Data
- [ ] Existing users still in database
- [ ] Existing user levels, EXP, streaks preserved
- [ ] Can view old training sessions

## 🔄 Rollback Plan

If issues occur:

### 1. Quick Rollback (Git)

```bash
git revert HEAD
git push origin main
```

Vercel will auto-deploy the previous version.

### 2. Database Rollback

```sql
-- Remove password_hash column (if needed)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
```

### 3. Restore Replit OAuth

The old Replit OAuth code is still in `server/auth.ts` in the git history. If needed, restore from commit before this migration.

## 📊 API Endpoints

### New Endpoints

#### `POST /api/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "mypassword123",
  "firstName": "张",
  "lastName": "三"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "张",
    "lastName": "三"
  }
}
```

#### `POST /api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "张",
    "level": 4,
    "exp": 3171
  }
}
```

### Existing Endpoints (Unchanged)

- `POST /api/auth/logout` - Destroys session
- All other API endpoints work the same way

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- Bcrypt hashing with work factor 12
- Salt automatically generated per password

### Session Management
- HttpOnly cookies (XSS protection)
- Secure flag in production (HTTPS only)
- 7-day session expiration
- PostgreSQL session storage

### Email Validation
- Format validation (RFC 5322)
- Normalization (lowercase, trimmed)
- Duplicate prevention

## 🐛 Troubleshooting

### Issue: "Connection terminated unexpectedly"
**Solution:** Check `DATABASE_URL` is correct in Vercel environment variables

### Issue: "Password is required" on login
**Solution:** User might not have password_hash set. Run SQL to set password.

### Issue: Session not persisting
**Solution:** Check `SESSION_SECRET` is set in environment variables

### Issue: Cannot create new users
**Solution:** Verify `password_hash` column exists in database

## 📝 Notes

### Existing Users
- Existing users from Replit OAuth **will not** have passwords
- They will see: "Please contact support to set up your password"
- You can manually set passwords via SQL or create a password reset flow

### Demo Mode
- Set `AUTH_DISABLED=true` to bypass authentication (for testing)
- Not recommended for production

### Future Enhancements
- Password reset via email
- Password change functionality
- Email verification
- Social login (Google, GitHub)

## ✅ Success Criteria

Migration is successful when:
1. ✅ New users can register with email/password
2. ✅ Registered users can login
3. ✅ Sessions persist across page reloads
4. ✅ Protected routes redirect to login
5. ✅ Existing user data (level, EXP, etc.) is intact
6. ✅ No errors in Vercel logs

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables are set
4. Confirm migration SQL ran successfully

---

**Migration created:** 2025-10-01
**Author:** Claude Code
**Version:** 1.0.0
