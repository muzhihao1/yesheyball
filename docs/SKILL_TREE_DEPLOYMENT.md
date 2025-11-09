# Skill Tree System Deployment Guide

**Created**: 2025-11-09
**Feature**: 技能树框架 (S2)
**Status**: 🔧 开发中

---

## 📊 Progress Overview

### Milestone M1: Database & Seed Data ⏳
- [x] M1.1: Create database schema (local)
- [ ] M1.1: Execute migration in production (manual step required)
- [ ] M1.2: Seed data preparation

### Milestone M2: Backend API 🔜
- [ ] M2.1: API contract definition
- [ ] M2.2: Implement GET /api/skill-tree
- [ ] M2.3: Implement GET /api/skills/:id
- [ ] M2.4: Implement POST /api/skills/:id/unlock

### Milestone M3: Frontend Visualization 🔜
- [ ] M3.1: React Flow setup
- [ ] M3.2: Custom skill node component
- [ ] M3.3: State management & mock data

---

## 🗄️ Database Migration (M1.1)

### Tables Created

1. **skills** - Skill nodes in the skill tree
2. **skill_dependencies** - Parent-child relationships between skills
3. **skill_unlock_conditions** - Requirements to unlock each skill
4. **user_skill_progress** - User's unlocked skills tracking

### Migration File

Location: `/migrations/001_create_skill_tree_tables.sql`

### Manual Execution Steps (Production)

Since automatic `db:push` failed due to connection issues, execute manually:

#### Option A: Supabase SQL Editor (Recommended)

1. Login to Supabase Dashboard: https://supabase.com/dashboard
2. Select project (waytoheyball)
3. Navigate to **SQL Editor** → **New Query**
4. Copy contents from `/migrations/001_create_skill_tree_tables.sql`
5. Click **Run** button
6. Verify output shows 4 tables created

#### Option B: Vercel Postgres SQL Editor

1. Login to Vercel Dashboard
2. Navigate to **Storage** → **Postgres**
3. Open **SQL Editor**
4. Paste migration SQL
5. Execute and verify

### Verification Query

```sql
-- Check all 4 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('skills', 'skill_dependencies', 'skill_unlock_conditions', 'user_skill_progress')
ORDER BY table_name;

-- Should return 4 rows
```

---

## 🌱 Seed Data (M1.2 - TODO)

### Planned Content

8 Skill Nodes corresponding to 8-level growth path:

| Skill ID | Name | Level Req | Description |
|----------|------|-----------|-------------|
| 1 | 初窥门径 | 1 | 基础握杆与站位 |
| 2 | 小有所成 | 2 | 手架与瞄准技巧 |
| 3 | 渐入佳境 | 3 | 球控与走位 |
| 4 | 炉火纯青 | 4 | 发力平顺度 |
| 5 | 登堂入室 | 5 | 高级球技 |
| 6 | 超群绝伦 | 6 | 战术应用 |
| 7 | 登峰造极 | 7 | 大师级技巧 |
| 8 | 出神入化 | 8 | 完美掌控 |

### Unlock Condition Types

- `LEVEL`: Reach specific level (e.g., level 3)
- `COURSE`: Complete X courses/exercises
- `ACHIEVEMENT`: Unlock specific achievement
- `DAILY_GOAL`: Complete X daily goals

---

## 📝 Schema Details

### skills
```typescript
{
  id: number (PK)
  name: string
  description: string | null
  position: { x: number, y: number }  // For React Flow rendering
  metadata: { icon?: string, color?: string }
  created_at: timestamp
}
```

### skill_dependencies
```typescript
{
  source_skill_id: number (FK → skills.id)
  target_skill_id: number (FK → skills.id)
  PRIMARY KEY (source_skill_id, target_skill_id)
}
```

### skill_unlock_conditions
```typescript
{
  id: number (PK)
  skill_id: number (FK → skills.id)
  condition_type: 'LEVEL' | 'COURSE' | 'ACHIEVEMENT' | 'DAILY_GOAL'
  condition_value: string  // The specific value (e.g., "3" for level 3)
  required_count: number (default: 1)
  condition_description: string | null
  created_at: timestamp
}
```

### user_skill_progress
```typescript
{
  user_id: string (FK → users.id)
  skill_id: number (FK → skills.id)
  unlocked_at: timestamp
  unlock_context: { level?: number, achievements?: number[] }
  PRIMARY KEY (user_id, skill_id)
}
```

---

## 🔄 Next Steps

After M1.1 migration is executed in production:

1. **M1.2**: Create seed data script
   - Define 8 skill nodes
   - Define dependencies (linear path or branching tree?)
   - Define unlock conditions for each skill

2. **M2.1**: API Contract
   - Document API endpoints in Swagger/OpenAPI format
   - Share with frontend team for parallel development

3. **Development Environment**
   - Run migration locally: `npm run db:push`
   - Or manually execute in local Supabase instance

---

## ⚠️ Migration Notes

- **Cascade Deletes**: All tables use `ON DELETE CASCADE` for referential integrity
- **Indexes**: Added for performance on foreign keys and frequent queries
- **JSONB Fields**: `position` and `metadata` use JSON for flexibility
- **Idempotent**: All statements use `IF NOT EXISTS` for safe re-execution

---

## 📊 System Design Decisions

### Why 8 Skills?

Aligned with existing **8-level growth path** system:
- users.currentLevel (1-8)
- Provides clear milestone rewards
- Manageable scope for MVP

### Why JSON for position/metadata?

- Frontend rendering requirements may evolve
- React Flow coordinates can change based on UI updates
- Metadata (icons, colors, badges) flexible for future design iterations

### Why separate unlock_conditions table?

**Extensibility**:
- Easy to add new condition types without schema changes
- Multiple conditions per skill (AND logic)
- Future: Could support OR logic with condition groups

---

## 🧪 Testing Strategy (Post-Migration)

1. **Schema Validation**
   - Verify all 4 tables exist
   - Check indexes created
   - Test foreign key constraints

2. **Seed Data Validation** (M1.2)
   - Insert 8 skill nodes
   - Verify dependencies form valid tree structure
   - Check unlock conditions logic

3. **API Integration** (M2+)
   - GET /api/skill-tree returns correct structure
   - POST /api/skills/:id/unlock validates conditions
   - User progress persists correctly

---

**Last Updated**: 2025-11-09
**Migration Status**: ⏳ Ready for manual execution
