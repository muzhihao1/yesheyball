# Skill Tree API Contract

**Version**: 1.0.0
**Created**: 2025-11-09
**Status**: 🔧 In Development

---

## Overview

This document defines the API contract for the Skill Tree System, which provides a gamified progression framework aligned with the 8-level growth path.

**Base URL**: `/api`

**Authentication**: All endpoints require valid user session (checked via `isAuthenticated` middleware)

**Response Format**: All responses use JSON with consistent structure:
- Success: `{ data: {...} }` or `{ message: "..." }`
- Error: `{ message: "error description" }` with appropriate HTTP status code

---

## Endpoints

### 1. GET /api/skill-tree

**Description**: Retrieves the complete skill tree structure with user's unlock status and progress.

**Authentication**: Required

**Request**:
```http
GET /api/skill-tree HTTP/1.1
Host: api.waytoheyball.com
Cookie: connect.sid=<session-token>
```

**Response** (200 OK):
```json
{
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "初窥门径",
        "description": "掌握台球基础：正确的握杆、站位和基本击球姿势",
        "position": { "x": 400, "y": 100 },
        "metadata": {
          "icon": "🌱",
          "color": "#10b981",
          "level": 1
        },
        "isUnlocked": true,
        "unlockedAt": "2025-01-15T08:30:00Z",
        "unlockContext": {
          "level": 1,
          "achievements": []
        }
      },
      {
        "id": 2,
        "name": "小有所成",
        "description": "熟练运用手架技巧，建立稳定的瞄准系统",
        "position": { "x": 400, "y": 250 },
        "metadata": {
          "icon": "🎯",
          "color": "#3b82f6",
          "level": 2
        },
        "isUnlocked": false,
        "conditions": [
          {
            "id": 1,
            "type": "LEVEL",
            "value": "2",
            "requiredCount": 1,
            "description": "达到等级 2",
            "currentProgress": 1,
            "isMet": false
          },
          {
            "id": 2,
            "type": "COURSE",
            "value": "5",
            "requiredCount": 1,
            "description": "完成 5 个训练课程",
            "currentProgress": 3,
            "isMet": false
          }
        ]
      }
    ],
    "dependencies": [
      {
        "sourceSkillId": 1,
        "targetSkillId": 2
      },
      {
        "sourceSkillId": 2,
        "targetSkillId": 3
      }
    ],
    "userProgress": {
      "totalSkills": 8,
      "unlockedSkills": 1,
      "progressPercentage": 12.5,
      "nextUnlockableSkills": [2]
    }
  }
}
```

**Response Schema**:
```typescript
interface SkillTreeResponse {
  data: {
    skills: SkillNode[];
    dependencies: SkillDependency[];
    userProgress: UserProgressSummary;
  };
}

interface SkillNode {
  id: number;
  name: string;
  description: string;
  position: { x: number; y: number };
  metadata: {
    icon: string;
    color: string;
    level: number;
    [key: string]: any;
  };
  isUnlocked: boolean;
  unlockedAt?: string; // ISO 8601 timestamp
  unlockContext?: {
    level?: number;
    achievements?: number[];
    [key: string]: any;
  };
  conditions?: UnlockCondition[]; // Only present if not unlocked
}

interface UnlockCondition {
  id: number;
  type: 'LEVEL' | 'COURSE' | 'ACHIEVEMENT' | 'DAILY_GOAL';
  value: string;
  requiredCount: number;
  description: string;
  currentProgress: number;
  isMet: boolean;
}

interface SkillDependency {
  sourceSkillId: number;
  targetSkillId: number;
}

interface UserProgressSummary {
  totalSkills: number;
  unlockedSkills: number;
  progressPercentage: number;
  nextUnlockableSkills: number[]; // IDs of skills that can be unlocked next
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Database or server error

---

### 2. GET /api/skills/:id

**Description**: Retrieves detailed information about a specific skill including its dependencies, unlock conditions, and user's unlock status.

**Authentication**: Required

**Path Parameters**:
- `id` (number, required): Skill ID

**Request**:
```http
GET /api/skills/2 HTTP/1.1
Host: api.waytoheyball.com
Cookie: connect.sid=<session-token>
```

**Response** (200 OK):
```json
{
  "data": {
    "skill": {
      "id": 2,
      "name": "小有所成",
      "description": "熟练运用手架技巧，建立稳定的瞄准系统",
      "position": { "x": 400, "y": 250 },
      "metadata": {
        "icon": "🎯",
        "color": "#3b82f6",
        "level": 2
      },
      "isUnlocked": false,
      "dependencies": [
        {
          "skillId": 1,
          "name": "初窥门径",
          "isUnlocked": true
        }
      ],
      "conditions": [
        {
          "id": 1,
          "type": "LEVEL",
          "value": "2",
          "requiredCount": 1,
          "description": "达到等级 2",
          "currentProgress": 1,
          "isMet": false
        },
        {
          "id": 2,
          "type": "COURSE",
          "value": "5",
          "requiredCount": 1,
          "description": "完成 5 个训练课程",
          "currentProgress": 3,
          "isMet": false
        }
      ],
      "canUnlock": false,
      "blockingReasons": [
        "需要达到等级 2",
        "需要完成 5 个训练课程"
      ]
    }
  }
}
```

**Response Schema**:
```typescript
interface SkillDetailResponse {
  data: {
    skill: {
      id: number;
      name: string;
      description: string;
      position: { x: number; y: number };
      metadata: Record<string, any>;
      isUnlocked: boolean;
      unlockedAt?: string;
      unlockContext?: Record<string, any>;
      dependencies: SkillDependencyDetail[];
      conditions?: UnlockCondition[];
      canUnlock: boolean;
      blockingReasons: string[];
    };
  };
}

interface SkillDependencyDetail {
  skillId: number;
  name: string;
  isUnlocked: boolean;
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Skill with given ID does not exist
- `500 Internal Server Error`: Database or server error

---

### 3. POST /api/skills/:id/unlock

**Description**: Attempts to unlock a skill for the current user. Validates all unlock conditions and dependencies before unlocking.

**Authentication**: Required

**Path Parameters**:
- `id` (number, required): Skill ID to unlock

**Request**:
```http
POST /api/skills/2/unlock HTTP/1.1
Host: api.waytoheyball.com
Cookie: connect.sid=<session-token>
Content-Type: application/json

{
  "context": {
    "triggeredBy": "manual",
    "sourceScreen": "skill-tree"
  }
}
```

**Request Body Schema**:
```typescript
interface UnlockSkillRequest {
  context?: {
    triggeredBy?: 'manual' | 'auto' | 'achievement' | 'level-up';
    sourceScreen?: string;
    [key: string]: any;
  };
}
```

**Response** (200 OK - Success):
```json
{
  "data": {
    "unlocked": true,
    "skill": {
      "id": 2,
      "name": "小有所成",
      "unlockedAt": "2025-01-20T14:30:00Z"
    },
    "rewards": {
      "exp": 50,
      "message": "恭喜解锁新技能！"
    },
    "nextSkills": [
      {
        "id": 3,
        "name": "渐入佳境",
        "canUnlock": false
      }
    ]
  }
}
```

**Response** (200 OK - Already Unlocked):
```json
{
  "data": {
    "unlocked": false,
    "alreadyUnlocked": true,
    "unlockedAt": "2025-01-15T08:30:00Z",
    "message": "该技能已解锁"
  }
}
```

**Response** (400 Bad Request - Conditions Not Met):
```json
{
  "message": "无法解锁技能：前置条件未满足",
  "details": {
    "unmetConditions": [
      {
        "type": "LEVEL",
        "description": "达到等级 2",
        "currentProgress": 1,
        "requiredCount": 1
      },
      {
        "type": "COURSE",
        "description": "完成 5 个训练课程",
        "currentProgress": 3,
        "requiredCount": 1
      }
    ],
    "unmetDependencies": []
  }
}
```

**Response Schema**:
```typescript
interface UnlockSkillResponse {
  data: {
    unlocked: boolean;
    alreadyUnlocked?: boolean;
    unlockedAt?: string;
    message?: string;
    skill?: {
      id: number;
      name: string;
      unlockedAt: string;
    };
    rewards?: {
      exp?: number;
      message?: string;
    };
    nextSkills?: Array<{
      id: number;
      name: string;
      canUnlock: boolean;
    }>;
  };
}

interface UnlockSkillError {
  message: string;
  details: {
    unmetConditions: Array<{
      type: string;
      description: string;
      currentProgress: number;
      requiredCount: number;
    }>;
    unmetDependencies: Array<{
      skillId: number;
      name: string;
    }>;
  };
}
```

**Error Responses**:
- `400 Bad Request`: Conditions not met or invalid request
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Skill with given ID does not exist
- `500 Internal Server Error`: Database or server error

---

## Condition Type Reference

| Type | Value Format | Description | Progress Calculation |
|------|-------------|-------------|---------------------|
| `LEVEL` | String (number) | User must reach specific level | `users.currentLevel >= parseInt(value)` |
| `COURSE` | String (number) | Complete X training courses | Count from `trainingSessions` |
| `ACHIEVEMENT` | String (number or ID) | Unlock specific achievement(s) | Check `userAchievements` table |
| `DAILY_GOAL` | String (number) | Complete X daily goals | Count from `dailyGoals` where completed=true |

---

## Validation Rules

### Unlock Conditions (All must pass):
1. **Dependency Check**: All parent skills (sourceSkillId) must be unlocked
2. **Condition Check**: ALL unlock conditions must be met (AND logic)
3. **Duplication Check**: Skill not already unlocked by user

### Progress Calculation:
- **LEVEL**: `users.currentLevel >= requiredLevel`
- **COURSE**: `COUNT(trainingSessions WHERE userId = current) >= requiredCount`
- **ACHIEVEMENT**: `COUNT(userAchievements WHERE userId = current AND achievementId IN (...)) >= requiredCount`
- **DAILY_GOAL**: `COUNT(dailyGoals WHERE userId = current AND completed = true) >= requiredCount`

---

## Database Queries

### Skill Tree Retrieval (Pseudo-SQL):
```sql
-- Get all skills
SELECT * FROM skills ORDER BY id;

-- Get all dependencies
SELECT * FROM skill_dependencies;

-- Get user's unlocked skills
SELECT * FROM user_skill_progress WHERE user_id = :userId;

-- Get unlock conditions for locked skills
SELECT * FROM skill_unlock_conditions WHERE skill_id IN (:lockedSkillIds);

-- Calculate progress for each condition type
-- LEVEL: Check users.currentLevel
-- COURSE: COUNT(training_sessions WHERE user_id = :userId)
-- ACHIEVEMENT: COUNT(user_achievements WHERE user_id = :userId)
-- DAILY_GOAL: COUNT(daily_goals WHERE user_id = :userId AND completed = true)
```

---

## Frontend Integration Notes

### React Flow Integration:
- Use `position` field directly for React Flow node coordinates
- Use `metadata.icon` and `metadata.color` for node styling
- `dependencies` array maps to React Flow edges (source → target)

### State Management:
- Cache skill tree data in TanStack Query
- Invalidate cache on successful unlock
- Use optimistic updates for better UX

### Example Hook:
```typescript
// client/src/hooks/useSkillTree.ts
export function useSkillTree() {
  return useQuery({
    queryKey: ['/api/skill-tree'],
    queryFn: async () => {
      const response = await fetch('/api/skill-tree', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch skill tree');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUnlockSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillId: number) => {
      const response = await fetch(`/api/skills/${skillId}/unlock`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: { triggeredBy: 'manual' } })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skill-tree'] });
    }
  });
}
```

---

## Testing Scenarios

### Happy Path:
1. User unlocks Skill 1 (no conditions) → Success
2. User meets all conditions for Skill 2 → Unlock successful
3. User views skill tree → Correct unlock status displayed

### Edge Cases:
1. User attempts to unlock Skill 3 without unlocking Skill 2 → 400 Error
2. User attempts to unlock already unlocked skill → Already unlocked message
3. User meets some but not all conditions → 400 Error with specific unmet conditions

### Error Cases:
1. Invalid skill ID → 404 Not Found
2. Unauthenticated request → 401 Unauthorized
3. Database connection failure → 500 Internal Server Error

---

## Performance Considerations

- **Caching**: Skill tree structure rarely changes, can be cached client-side
- **Lazy Loading**: Load full condition details only when viewing specific skill
- **Batch Queries**: Use Drizzle relations to fetch related data efficiently
- **Indexing**: Foreign key indexes already in place for performance

---

## Future Enhancements (Out of Scope for V1)

- OR logic for unlock conditions (condition groups)
- Skill tree branches (multiple paths)
- Skill levels (upgrade unlocked skills)
- Prerequisite skills (more complex dependencies)
- Skill categories/tags
- Time-based unlocks (seasonal skills)

---

**Last Updated**: 2025-11-09
**Status**: Ready for implementation (M2.2-M2.4)
