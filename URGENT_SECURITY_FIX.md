# 🚨 URGENT: Production Site Security Fix Guide

## Current Status

Your production site is **DOWN** because it's trying to connect to the old compromised Supabase database that no longer exists.

**Error**: `getaddrinfo ENOTFOUND db.ksgksoeubyvkuwfpdhet.supabase.co`

## What You Did (Good!)

✅ Created a NEW Supabase project: `hsfthqchyupkbmazcuis`
✅ Rotated all credentials (service role key and anon key)
✅ Local configuration files updated

## Critical Actions Required NOW

### Step 1: Get Your New Database Password

1. Go to: https://supabase.com/dashboard/project/hsfthqchyupkbmazcuis/settings/database
2. Scroll down to **Connection String** section
3. Click **Show password** or **Reset password**
4. Copy the password (you'll need it multiple times)

### Step 2: Update Local `.env.local` File

Replace `[YOUR_PASSWORD]` in line 7 of `.env.local` with your actual database password:

```bash
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.hsfthqchyupkbmazcuis.supabase.co:5432/postgres?sslmode=require"
```

### Step 3: Run Database Migrations in NEW Supabase Project

**CRITICAL**: Your new Supabase database is empty. You need to set up the schema.

1. Go to: https://supabase.com/dashboard/project/hsfthqchyupkbmazcuis/sql/new
2. Copy the entire contents of `migrations/supabase_auth_setup.sql`
3. Paste into the SQL editor
4. Click **Run**
5. Verify success (should see "ALTER TABLE" messages)

**Also run your main schema migration:**

1. Check if you have a file like `migrations/initial_schema.sql` or similar
2. If not, use Drizzle to push schema:
   ```bash
   npm run db:push
   ```
3. This will create all tables (users, trainingSessions, etc.) in the new database

### Step 4: Update Vercel Environment Variables

**THIS IS WHY YOUR PRODUCTION SITE IS DOWN**

1. Go to: https://vercel.com/dashboard
2. Select your project: **yesheyball**
3. Go to: **Settings** → **Environment Variables**
4. Update the following variables for **Production** environment:

```bash
# Update these 3 Supabase variables:
VITE_SUPABASE_URL=https://hsfthqchyupkbmazcuis.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZnRocWNoeXVwa2JtYXpjdWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTkzOTksImV4cCI6MjA3NDg3NTM5OX0.nthu3RPAtI67lPDuZKgF2W__Pv4srNifKsJPPwxB-zg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZnRocWNoeXVwa2JtYXpjdWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI5OTM5OSwiZXhwIjoyMDc0ODc1Mzk5fQ.XDOj2coZ4x5m76iqLxKcTxGWjlOvb95B1aCOI9J_tsw

# Update DATABASE_URL with YOUR actual password:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.hsfthqchyupkbmazcuis.supabase.co:5432/postgres?sslmode=require
```

5. After updating, Vercel will automatically redeploy

### Step 5: Verify Production Site

Wait 2-3 minutes for redeployment, then:

1. Visit: https://yesheyball.vercel.app
2. Try to log in
3. Check Vercel logs: https://vercel.com/dashboard → Deployments → Latest → Runtime Logs
4. Verify no database connection errors

## ⚠️ Important: Data Migration

**WARNING**: Your old database had user data. If you need to preserve that data, you have 2 options:

### Option A: Start Fresh (Simplest)
- All users will need to register again
- Training history will be lost
- Clean slate with new security

### Option B: Migrate Data (Requires SQL Export/Import)
1. Export data from old Supabase (if still accessible)
2. Import into new Supabase database
3. May require manual SQL adjustments

**Recommendation**: If this is still in development/testing, Option A is safest.

## Quick Reference: New Supabase Project Details

```
Project Ref: hsfthqchyupkbmazcuis
Project URL: https://hsfthqchyupkbmazcuis.supabase.co
Dashboard: https://supabase.com/dashboard/project/hsfthqchyupkbmazcuis

Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZnRocWNoeXVwa2JtYXpjdWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTkzOTksImV4cCI6MjA3NDg3NTM5OX0.nthu3RPAtI67lPDuZKgF2W__Pv4srNifKsJPPwxB-zg

Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZnRocWNoeXVwa2JtYXpjdWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI5OTM5OSwiZXhwIjoyMDc0ODc1Mzk5fQ.XDOj2coZ4x5m76iqLxKcTxGWjlOvb95B1aCOI9J_tsw
```

## Checklist

- [ ] Get database password from Supabase dashboard
- [ ] Update `.env.local` DATABASE_URL
- [ ] Run migrations in new Supabase (via SQL Editor)
- [ ] Run `npm run db:push` to create all tables
- [ ] Update Vercel environment variables (4 variables)
- [ ] Wait for automatic Vercel redeployment
- [ ] Test production site login
- [ ] Verify no 500 errors in browser console

## Next Steps After Fix

Once production is working again:

1. Commit local changes to git
2. Remove exposed secrets from git history (I'll help with this)
3. Test new user registration
4. Monitor Vercel logs for any issues

---

**Need Help?** Let me know which step you're stuck on!
