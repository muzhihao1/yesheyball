# Ten Core Skills UI Design Document

## Overview
This document outlines the component architecture for the Ten Core Skills (十大招) system that will replace/supplement the current 8-level exercise system in `/levels` page.

## Current System Analysis
The existing levels page (`client/src/pages/levels.tsx`, 2007 lines) implements:
- 8 sequential levels with 35-60 exercises each
- Duolingo-style vertical progression map
- Exercise groups of 5 with trophy milestones
- Timer-based practice sessions
- Exam system and skip level challenges
- Auto-scroll to user's current position
- Floating navigation button

## New System Requirements
Replace the sequential exercise system with:
- **10 Core Skills** (skill_1 to skill_10) as primary navigation
- **3 Sub-Skills per Skill** (e.g., sub_skill_1_1, sub_skill_1_2, sub_skill_1_3)
- **Training Units** per sub-skill:
  - Theory units (理论) - Reading content
  - Practice units (练习) - Hands-on exercises
  - Challenge units (挑战) - Assessment tasks
- **Progress Tracking** at both skill and sub-skill levels
- **XP Rewards** for completing units

## Component Architecture

### 1. TenCoreSkillsView (Container)
**Location**: `client/src/components/TenCoreSkills/TenCoreSkillsView.tsx`

**Purpose**: Main container component that orchestrates the entire Ten Core Skills experience.

**State**:
- `selectedSkill: SkillV3 | null` - Currently selected skill
- `selectedSubSkill: SubSkillV3 | null` - Currently selected sub-skill
- `selectedUnit: TrainingUnitV3 | null` - Currently opened unit
- `showUnitModal: boolean` - Unit detail modal visibility

**Responsibilities**:
- Fetch all skills using `useSkillsV3()`
- Fetch user progress using `useUserSkillProgressV3()`
- Route between skills overview, sub-skills view, and unit modal
- Handle navigation state

**Layout**:
```
┌─────────────────────────────────────┐
│  Progress Header (Overall Stats)   │
├─────────────────────────────────────┤
│  SkillsOverview (Grid of 10 Skills) │
│  OR                                 │
│  SubSkillsView (Current Skill)     │
└─────────────────────────────────────┘
      └── TrainingUnitModal (Overlay)
```

---

### 2. SkillsOverview (Grid Display)
**Location**: `client/src/components/TenCoreSkills/SkillsOverview.tsx`

**Purpose**: Display all 10 core skills in an attractive grid layout.

**Props**:
```typescript
interface SkillsOverviewProps {
  skills: SkillV3[];
  userProgress: UserSkillProgressV3[];
  onSkillClick: (skill: SkillV3) => void;
}
```

**UI Design**:
- 2-column grid on mobile, 3-column on tablet, 4-column on desktop
- Each skill card shows:
  - Icon (iconName SVG)
  - Skill title (e.g., "第一招：基本功")
  - Short description
  - Progress circle (0-100%) with percentage text
  - Completed sub-skills count (e.g., "2/3 子技能")
  - Total XP earned
  - Lock icon if not unlocked yet
- Hover effects and animations
- Color scheme by skill order (gradient backgrounds)

**Card States**:
- **Locked**: Gray overlay with lock icon
- **In Progress**: Colorful gradient with partial progress
- **Completed**: Green checkmark badge

---

### 3. SubSkillsView (Detail View)
**Location**: `client/src/components/TenCoreSkills/SubSkillsView.tsx`

**Purpose**: Display the 3 sub-skills for a selected skill and their training units.

**Props**:
```typescript
interface SubSkillsViewProps {
  skill: SkillV3;
  subSkills: SubSkillV3[];
  onBack: () => void;
  onUnitClick: (unit: TrainingUnitV3) => void;
}
```

**UI Design**:
```
┌─────────────────────────────────────┐
│  ← Back    第一招：基本功            │
│  掌握最核心的台球动作基础             │
├─────────────────────────────────────┤
│  ┌─── 1.1 站位与姿势 (80%) ────┐    │
│  │  [理论] [练习] [挑战]        │    │
│  │  ✓ unit_1_1_1 核心站位要点   │    │
│  │  ✓ unit_1_1_2 基础站位练习   │    │
│  │  → unit_1_1_3 稳定站位挑战   │    │
│  └────────────────────────────┘    │
│  ┌─── 1.2 手架 (0%) ──────────┐    │
│  │  🔒 完成1.1后解锁            │    │
│  └────────────────────────────┘    │
│  ┌─── 1.3 出杆 (0%) ──────────┐    │
│  │  🔒 完成1.2后解锁            │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Sub-Skill Card Components**:
- Collapsible sections for each sub-skill
- Progress bar at sub-skill level
- List of training units grouped by type:
  - Theory (📖) - Blue theme
  - Practice (🎯) - Green theme
  - Challenge (⚡) - Orange theme
- Unit completion icons:
  - ✓ Completed (green)
  - → Current (blue, animated)
  - 🔒 Locked (gray)

**Sequential Unlock Logic**:
- Sub-skills unlock sequentially (1.1 → 1.2 → 1.3)
- Within each sub-skill, units unlock sequentially
- Cannot skip ahead without completing previous units

---

### 4. TrainingUnitModal (Detail Modal)
**Location**: `client/src/components/TenCoreSkills/TrainingUnitModal.tsx`

**Purpose**: Display full unit content and handle completion workflow.

**Props**:
```typescript
interface TrainingUnitModalProps {
  unit: TrainingUnitV3 | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score?: number, notes?: string) => void;
}
```

**UI Design by Unit Type**:

**Theory Unit (理论)**:
```
┌─────────────────────────────────────┐
│  📖 理论：核心站位要点               │
│  预计用时: 5分钟 | XP奖励: +5       │
├─────────────────────────────────────┤
│  【理论内容】                        │
│  正确的站位是稳定击球的基石...       │
│                                     │
│  【图片】                            │
│  [站位示意图]                        │
│                                     │
│  【关键要点】                        │
│  • 双脚与肩同宽                      │
│  • 重心分配80-15-5原则               │
│  • 保持身体稳定                      │
├─────────────────────────────────────┤
│  [我已阅读完毕] ← 点击完成           │
└─────────────────────────────────────┘
```

**Practice Unit (练习)**:
```
┌─────────────────────────────────────┐
│  🎯 练习：基础站位                   │
│  预计用时: 15分钟 | XP奖励: +10     │
├─────────────────────────────────────┤
│  【练习说明】                        │
│  按照理论要求进行站位练习...         │
│                                     │
│  【练习步骤】                        │
│  1. 确定击球方向                     │
│  2. 调整双脚位置                     │
│  3. 检查身体重心                     │
│                                     │
│  【计时器】                          │
│  ⏱ 00:00 [开始练习] [暂停] [完成]  │
├─────────────────────────────────────┤
│  完成后评分: ⭐⭐⭐⭐⭐              │
│  练习笔记: [可选文本框]              │
│  [确认完成]                         │
└─────────────────────────────────────┘
```

**Challenge Unit (挑战)**:
```
┌─────────────────────────────────────┐
│  ⚡ 挑战：稳定站位30秒                │
│  预计用时: 10分钟 | XP奖励: +15     │
├─────────────────────────────────────┤
│  【挑战要求】                        │
│  保持标准站位30秒不动，身体稳定       │
│                                     │
│  【视频示范】                        │
│  [播放视频]                          │
│                                     │
│  【倒计时】                          │
│  ⏱ 30秒                             │
│  [开始挑战]                          │
├─────────────────────────────────────┤
│  挑战成绩: 85分                      │
│  [重新挑战] [提交成绩]               │
└─────────────────────────────────────┘
```

**Completion Workflow**:
1. User opens unit modal
2. For theory: Click "我已阅读完毕"
3. For practice: Start timer → Complete → Rate → Submit
4. For challenge: Start challenge → Record score → Submit
5. Call `useCompleteTrainingUnit()` mutation
6. Auto-update progress and close modal
7. Unlock next unit if applicable

---

### 5. ProgressHeader (Stats Overview)
**Location**: `client/src/components/TenCoreSkills/ProgressHeader.tsx`

**Purpose**: Show overall progress across all skills.

**Props**:
```typescript
interface ProgressHeaderProps {
  totalSkills: number;
  completedSkills: number;
  totalXP: number;
  currentLevel: number; // Derived from total XP
}
```

**UI Design**:
```
┌─────────────────────────────────────────┐
│  🏆 学习进度                             │
│  ━━━━━━━━━━━━━━ 30%                    │
│  3/10 技能完成 | 总XP: 450 | 等级: 2   │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Initial Load
```
TenCoreSkillsView
  ├─> useSkillsV3() ─────────────→ GET /api/skills-v3
  ├─> useUserSkillProgressV3() ──→ GET /api/user/skills-v3/progress
  └─> useUserUnitCompletions() ──→ GET /api/user/units-v3/completions
```

### Skill Selection
```
User clicks skill card
  ├─> setSelectedSkill(skill)
  ├─> useSubSkillsV3(skill.id) ──→ GET /api/skills-v3/:skillId/sub-skills
  └─> Render SubSkillsView
```

### Sub-Skill Expansion
```
User expands sub-skill
  └─> useTrainingUnitsV3(subSkill.id) → GET /api/sub-skills-v3/:subSkillId/units
```

### Unit Completion
```
User completes unit
  └─> useCompleteTrainingUnit().mutate()
        ├─> POST /api/training-units-v3/:unitId/complete
        ├─> Invalidate queries (progress, completions)
        └─> Re-render with updated progress
```

---

## Styling Guidelines

### Color Scheme
- **Skill 1**: Emerald (基本功) - `from-emerald-400 to-green-500`
- **Skill 2**: Blue (发力) - `from-blue-400 to-blue-500`
- **Skill 3**: Purple (五分点) - `from-purple-400 to-purple-500`
- **Skill 4**: Orange (准度) - `from-orange-400 to-orange-500`
- **Skill 5**: Pink (杆法) - `from-pink-400 to-pink-500`
- **Skill 6**: Indigo (分离角) - `from-indigo-400 to-indigo-500`
- **Skill 7**: Red (走位) - `from-red-400 to-red-500`
- **Skill 8**: Amber (清蛇彩) - `from-amber-400 to-yellow-500`
- **Skill 9**: Teal (技能) - `from-teal-400 to-cyan-500`
- **Skill 10**: Violet (思路) - `from-violet-400 to-purple-600`

### Unit Type Colors
- **Theory (理论)**: Blue theme - `bg-blue-50 border-blue-500 text-blue-700`
- **Practice (练习)**: Green theme - `bg-green-50 border-green-500 text-green-700`
- **Challenge (挑战)**: Orange theme - `bg-orange-50 border-orange-500 text-orange-700`

### Animations
- Card hover: `transform hover:scale-105 transition-all duration-300`
- Progress bars: `transition-all duration-700 ease-out`
- Pulse effect for current unit: `animate-pulse`

---

## Integration with Existing Code

### Approach: Feature Flag Toggle
Add a toggle to switch between old and new systems:

**In levels.tsx**:
```typescript
const [viewMode, setViewMode] = useState<'legacy' | 'tencore'>('tencore');

return (
  <div>
    <div className="flex justify-center mb-4">
      <button onClick={() => setViewMode('legacy')}>8级系统</button>
      <button onClick={() => setViewMode('tencore')}>十大招系统</button>
    </div>

    {viewMode === 'legacy' ? (
      <LegacyLevelsView />
    ) : (
      <TenCoreSkillsView />
    )}
  </div>
);
```

### Backward Compatibility
- Keep all existing `levelStages` and exercise logic intact
- Users who started with old system can still access it
- New users default to Ten Core Skills system
- Eventually deprecate old system after migration period

---

## Implementation Checklist

### Phase 1: Core Components
- [ ] Create `TenCoreSkillsView.tsx` container
- [ ] Create `SkillsOverview.tsx` grid display
- [ ] Create `SubSkillsView.tsx` detail view
- [ ] Create `TrainingUnitModal.tsx` unit modal
- [ ] Create `ProgressHeader.tsx` stats header

### Phase 2: Integration
- [ ] Add feature flag toggle to levels.tsx
- [ ] Extract legacy code to `LegacyLevelsView.tsx`
- [ ] Wire up TenCoreSkillsView to levels.tsx
- [ ] Test navigation flow

### Phase 3: Completion Flow
- [ ] Implement unit completion logic
- [ ] Integrate `useCompleteTrainingUnit()` mutation
- [ ] Add XP reward animations
- [ ] Test progress auto-update

### Phase 4: Polish
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add empty states
- [ ] Optimize performance with React.memo
- [ ] Add keyboard navigation support
- [ ] Test on mobile devices

---

## File Structure
```
client/src/
├── components/
│   └── TenCoreSkills/
│       ├── README.md                 (This file)
│       ├── TenCoreSkillsView.tsx     (Container)
│       ├── SkillsOverview.tsx        (Grid)
│       ├── SubSkillsView.tsx         (Detail)
│       ├── TrainingUnitModal.tsx     (Modal)
│       ├── ProgressHeader.tsx        (Header)
│       └── SkillCard.tsx             (Reusable card)
├── hooks/
│   └── useSkillsV3.ts                (✅ Already created)
└── pages/
    └── levels.tsx                     (Refactor for toggle)
```

---

## Notes
- Mobile-first responsive design
- Use existing shadcn/ui components (Card, Dialog, Progress, Badge)
- Reuse color schemes from current levels page
- Maintain Duolingo-style visual language
- Prioritize smooth animations and transitions
- Consider accessibility (ARIA labels, keyboard navigation)
