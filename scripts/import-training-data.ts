/**
 * V2.1 训练数据导入脚本 (Enhanced Version)
 *
 * 功能：将"十大招"课程内容导入到Supabase数据库
 * 映射方案：方案A（8个成长等级 + 10个招式）
 *
 * 使用方法：
 *   npx tsx scripts/import-training-data.ts          # 正常导入
 *   npx tsx scripts/import-training-data.ts --dry-run # 试运行模式（不写入数据库）
 *   npx tsx scripts/import-training-data.ts --force   # 强制导入（清除现有数据）
 *
 * 增强功能：
 *   - 数据验证：导入前检查必填字段和数据格式
 *   - 错误处理：单个记录失败不影响整体导入
 *   - 幂等性：检测已存在数据，避免重复导入
 *   - 试运行模式：验证数据但不实际写入数据库
 *   - 详细日志：显示每条记录的导入进度和结果
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import {
  trainingLevels,
  trainingSkills,
  subSkills,
  trainingUnits,
  specializedTrainings,
  specializedTrainingPlans,
} from "../shared/schema.js";

dotenv.config();

// ============================================================================
// 命令行参数解析
// ============================================================================

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForceMode = args.includes("--force");

if (isDryRun) {
  console.log("🔍 试运行模式已启用 - 数据将被验证但不会写入数据库\n");
}

if (isForceMode) {
  console.log("⚠️  强制模式已启用 - 将清除现有数据后重新导入\n");
}

// ============================================================================
// 数据库连接
// ============================================================================

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not set in .env file");
  process.exit(1);
}

const connection = neon(databaseUrl);
const db = drizzle(connection);

// ============================================================================
// 导入统计
// ============================================================================

interface ImportStats {
  levels: { total: number; success: number; skipped: number; failed: number };
  skills: { total: number; success: number; skipped: number; failed: number };
  subSkills: { total: number; success: number; skipped: number; failed: number };
  units: { total: number; success: number; skipped: number; failed: number };
  specialized: { total: number; success: number; skipped: number; failed: number };
  errors: Array<{ step: string; item: string; error: string }>;
}

const stats: ImportStats = {
  levels: { total: 0, success: 0, skipped: 0, failed: 0 },
  skills: { total: 0, success: 0, skipped: 0, failed: 0 },
  subSkills: { total: 0, success: 0, skipped: 0, failed: 0 },
  units: { total: 0, success: 0, skipped: 0, failed: 0 },
  specialized: { total: 0, success: 0, skipped: 0, failed: 0 },
  errors: [],
};

// ============================================================================
// 数据验证函数
// ============================================================================

/**
 * 验证训练单元的content字段
 */
function validateUnitContent(unit: any): string[] {
  const errors: string[] = [];

  if (!unit.content || typeof unit.content !== "object") {
    errors.push("content字段缺失或格式错误");
    return errors;
  }

  const { type } = unit.content;

  // 验证Theory类型
  if (type === "theory") {
    if (!unit.content.text || typeof unit.content.text !== "string") {
      errors.push("Theory类型缺少text字段或格式错误");
    }
    if (!Array.isArray(unit.content.images)) {
      errors.push("Theory类型images字段格式错误（应为数组）");
    }
  }

  // 验证Practice类型
  if (type === "practice") {
    if (!unit.content.instructions || typeof unit.content.instructions !== "string") {
      errors.push("Practice类型缺少instructions字段或格式错误");
    }
    if (!unit.content.success_criteria || typeof unit.content.success_criteria !== "object") {
      errors.push("Practice类型缺少success_criteria字段");
    } else {
      const { type: criteriaType, target } = unit.content.success_criteria;
      if (!["repetitions", "duration", "accuracy", "custom"].includes(criteriaType)) {
        errors.push(`Practice类型success_criteria的type无效: ${criteriaType}`);
      }
      if (criteriaType !== "custom" && (typeof target !== "number" || target <= 0)) {
        errors.push(`Practice类型success_criteria的target无效: ${target}`);
      }
    }
  }

  // 验证Challenge类型
  if (type === "challenge") {
    if (!unit.content.description || typeof unit.content.description !== "string") {
      errors.push("Challenge类型缺少description字段或格式错误");
    }
    if (!unit.content.success_criteria || typeof unit.content.success_criteria !== "object") {
      errors.push("Challenge类型缺少success_criteria字段");
    } else {
      const { type: criteriaType, description } = unit.content.success_criteria;
      if (!["score", "combo", "time", "custom"].includes(criteriaType)) {
        errors.push(`Challenge类型success_criteria的type无效: ${criteriaType}`);
      }
      if (!description || typeof description !== "string") {
        errors.push("Challenge类型success_criteria缺少description字段");
      }
    }
  }

  return errors;
}

/**
 * 验证训练单元数据
 */
function validateUnit(unit: any, context: string): string[] {
  const errors: string[] = [];

  // 必填字段验证
  if (!unit.unitType || !["theory", "practice", "challenge"].includes(unit.unitType)) {
    errors.push(`${context}: unitType无效或缺失`);
  }
  if (!unit.title || typeof unit.title !== "string") {
    errors.push(`${context}: title缺失或格式错误`);
  }
  if (typeof unit.unitOrder !== "number" || unit.unitOrder < 1) {
    errors.push(`${context}: unitOrder无效`);
  }
  if (typeof unit.xpReward !== "number" || unit.xpReward < 0) {
    errors.push(`${context}: xpReward无效`);
  }
  if (typeof unit.estimatedMinutes !== "number" || unit.estimatedMinutes < 0) {
    errors.push(`${context}: estimatedMinutes无效`);
  }

  // 内容字段验证
  const contentErrors = validateUnitContent(unit);
  errors.push(...contentErrors.map(e => `${context}: ${e}`));

  return errors;
}

/**
 * 验证子技能数据
 */
function validateSubSkill(subSkill: any, context: string): string[] {
  const errors: string[] = [];

  if (!subSkill.subSkillName || typeof subSkill.subSkillName !== "string") {
    errors.push(`${context}: subSkillName缺失或格式错误`);
  }
  if (typeof subSkill.subSkillOrder !== "number" || subSkill.subSkillOrder < 1) {
    errors.push(`${context}: subSkillOrder无效`);
  }
  if (!subSkill.description || typeof subSkill.description !== "string") {
    errors.push(`${context}: description缺失或格式错误`);
  }
  if (!Array.isArray(subSkill.units)) {
    errors.push(`${context}: units必须是数组`);
  } else if (subSkill.units.length === 0) {
    errors.push(`${context}: units数组不能为空`);
  } else {
    // 验证每个unit
    subSkill.units.forEach((unit: any, idx: number) => {
      const unitErrors = validateUnit(unit, `${context} > Unit ${idx + 1}`);
      errors.push(...unitErrors);
    });
  }

  return errors;
}

/**
 * 验证技能数据
 */
function validateSkill(skill: any, context: string): string[] {
  const errors: string[] = [];

  if (!skill.skillName || typeof skill.skillName !== "string") {
    errors.push(`${context}: skillName缺失或格式错误`);
  }
  if (typeof skill.skillOrder !== "number" || skill.skillOrder < 1) {
    errors.push(`${context}: skillOrder无效`);
  }
  if (typeof skill.levelNumber !== "number" || skill.levelNumber < 1) {
    errors.push(`${context}: levelNumber无效`);
  }
  if (!skill.description || typeof skill.description !== "string") {
    errors.push(`${context}: description缺失或格式错误`);
  }
  if (!Array.isArray(skill.subSkills)) {
    errors.push(`${context}: subSkills必须是数组`);
  } else if (skill.subSkills.length === 0) {
    errors.push(`${context}: subSkills数组不能为空`);
  } else {
    // 验证每个subSkill
    skill.subSkills.forEach((subSkill: any, idx: number) => {
      const subSkillErrors = validateSubSkill(subSkill, `${context} > ${subSkill.subSkillName || `SubSkill ${idx + 1}`}`);
      errors.push(...subSkillErrors);
    });
  }

  return errors;
}

/**
 * 验证等级数据
 */
function validateLevel(level: any, context: string): string[] {
  const errors: string[] = [];

  if (typeof level.levelNumber !== "number" || level.levelNumber < 1) {
    errors.push(`${context}: levelNumber无效`);
  }
  if (!level.title || typeof level.title !== "string") {
    errors.push(`${context}: title缺失或格式错误`);
  }
  if (!level.description || typeof level.description !== "string") {
    errors.push(`${context}: description缺失或格式错误`);
  }
  if (typeof level.orderIndex !== "number" || level.orderIndex < 1) {
    errors.push(`${context}: orderIndex无效`);
  }

  return errors;
}

// ============================================================================
// 数据定义：8个成长等级
// ============================================================================

const TRAINING_LEVELS_DATA = [
  {
    levelNumber: 1,
    title: "新手起步",
    description: "台球入门：掌握基本功，建立正确的姿势和手架",
    prerequisiteLevelId: null,
    orderIndex: 1,
    isActive: true,
  },
  {
    levelNumber: 2,
    title: "力量觉醒",
    description: "学习正确的发力技巧，让每一杆都充满能量",
    prerequisiteLevelId: null, // 将在导入时动态设置
    orderIndex: 2,
    isActive: true,
  },
  {
    levelNumber: 3,
    title: "精准之道",
    description: "掌握定杆技术和多种瞄准方法",
    prerequisiteLevelId: null,
    orderIndex: 3,
    isActive: true,
  },
  {
    levelNumber: 4,
    title: "技巧进阶",
    description: "学习杆法和分离角，提升球路控制能力",
    prerequisiteLevelId: null,
    orderIndex: 4,
    isActive: true,
  },
  {
    levelNumber: 5,
    title: "战术运用",
    description: "掌握走位技巧，学会布局和战术规划",
    prerequisiteLevelId: null,
    orderIndex: 5,
    isActive: true,
  },
  {
    levelNumber: 6,
    title: "实战演练",
    description: "轻松清蛇彩，将技巧转化为实战能力",
    prerequisiteLevelId: null,
    orderIndex: 6,
    isActive: true,
  },
  {
    levelNumber: 7,
    title: "综合提升",
    description: "学习高级技能，成为全面的台球选手",
    prerequisiteLevelId: null,
    orderIndex: 7,
    isActive: true,
  },
  {
    levelNumber: 8,
    title: "大师之境",
    description: "培养思路和心态，领悟台球的战略精髓",
    prerequisiteLevelId: null,
    orderIndex: 8,
    isActive: true,
  },
];

// ============================================================================
// 数据定义："十大招"技能
// ============================================================================

/**
 * 十大招数据结构
 * 注意：levelId 将在导入levels后动态填充
 */
const TEN_SKILLS_DATA = [
  // ===== Level 1: 新手起步 =====
  {
    levelNumber: 1,
    skillName: "基本功",
    skillOrder: 1,
    description: "台球的根基：手架、握杆、入位、姿势四大动作",
    subSkills: [
      {
        subSkillName: "稳固的根基",
        subSkillOrder: 1,
        description: "掌握手架和握杆的基础技巧",
        units: [
          {
            unitType: "theory" as const,
            unitOrder: 1,
            title: "万丈高楼平地起：认识四大动作",
            content: {
              type: "theory" as const,
              text: `
# 台球四大基本动作

台球的四大基本动作是：
1. **手架 (Bridge)** - 稳定球杆的支撑点
2. **握杆 (Grip)** - 正确握持球杆的方式
3. **入位 (Stance)** - 标准的站姿和瞄准姿势
4. **姿势 (Posture)** - 整体的身体协调和平衡

这四个动作是所有台球技巧的基础，必须反复练习直到形成肌肉记忆。

## 为什么基本功如此重要？

- ✅ 稳定的手架 = 准确的出杆
- ✅ 正确的握杆 = 流畅的发力
- ✅ 标准的入位 = 舒适的视角
- ✅ 良好的姿势 = 持久的体能

**记住**：职业选手与业余爱好者的最大区别，就在于基本功的扎实程度！
              `.trim(),
              images: [],
              video: "", // 待提供
            },
            xpReward: 10,
            estimatedMinutes: 5,
          },
          {
            unitType: "practice" as const,
            unitOrder: 2,
            title: "手架：稳如泰山",
            content: {
              type: "practice" as const,
              instructions: `
# 凤眼式手架练习

## 标准动作：
1. 手掌平铺台面，虎口朝向球杆方向
2. 拇指与食指形成"凤眼"，球杆从中穿过
3. 其他三指自然弯曲，稳固支撑

## 练习目标：
- 完成 **5次** 标准手架定型
- 每次保持 **30秒** 不动
- 确保球杆可以在手架中自由滑动

## 自我检查：
- [ ] 手掌是否完全贴合台面？
- [ ] 虎口是否紧贴球杆？
- [ ] 手架是否稳定不晃动？
              `.trim(),
              demo_video: "", // 待提供
              success_criteria: {
                type: "repetitions" as const,
                target: 5,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 3,
            title: "握杆：松紧有度",
            content: {
              type: "practice" as const,
              instructions: `
# 正确握杆练习

## 标准动作：
1. 轻握球杆后端，手指自然弯曲包裹
2. 拇指与食指形成"V"字形，指向杆尾
3. 握杆力度：能稳固控制，但不僵硬
4. 手腕保持放松，允许杆体在手中自然滑动

## 练习目标：
- 完成 **10次** 握杆-松开动作
- 每次握杆时感受"轻而稳"的力度
- 试杆时确保手腕灵活

## 自我检查：
- [ ] 握杆是否过紧导致手腕僵硬？
- [ ] 杆体是否能在手中自然前后滑动？
- [ ] V字形是否正确指向杆尾？

## 常见错误：
- ❌ 握杆过紧，导致出杆僵硬
- ❌ 握杆位置过前或过后
- ❌ 手指张开过大，失去控制
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 10,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 4,
            title: "入位：瞄准视角",
            content: {
              type: "practice" as const,
              instructions: `
# 标准入位练习

## 标准动作：
1. 双脚与肩同宽，前脚指向目标球
2. 上身前倾45度，下颌贴近球杆
3. 后手握杆自然下垂，前手形成手架
4. 眼睛-球杆-白球-目标球成一直线

## 练习目标：
- 完成 **8次** 标准入位动作
- 每次入位后保持姿势15秒
- 确保视线、球杆、目标球对齐

## 自我检查：
- [ ] 双脚站位是否稳定？
- [ ] 上身是否保持前倾45度？
- [ ] 眼睛是否沿着球杆瞄向目标？
- [ ] 身体是否放松不僵硬？

## 要点提示：
- 前脚脚尖对准目标球，后脚自然站立
- 下颌贴近球杆，但不要压在上面
- 瞄准线：眼→杆→白球→目标球
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 8,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 5,
            title: "姿势：整体协调",
            content: {
              type: "practice" as const,
              instructions: `
# 整体姿势协调练习

## 标准动作流程：
1. **站位**：双脚分开，身体对准目标
2. **下蹲**：上身前倾，下颌接近球杆
3. **手架**：前手稳固支撑在台面
4. **握杆**：后手轻握杆尾，手腕放松
5. **瞄准**：眼睛沿杆体看向目标球

## 练习目标：
- 完成 **6次** 完整姿势流程
- 每次从站立到瞄准一气呵成
- 保持最终姿势20秒不动

## 自我检查：
- [ ] 动作流程是否连贯自然？
- [ ] 最终姿势是否稳定舒适？
- [ ] 身体各部位是否协调配合？
- [ ] 瞄准线是否清晰准确？

## 协调要点：
- 下身稳定，上身灵活
- 前手支撑，后手控制
- 身心放松，注意力集中
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 6,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
        ],
      },
      {
        subSkillName: "笔直的出杆",
        subSkillOrder: 2,
        description: "训练稳定、笔直的出杆动作",
        units: [
          {
            unitType: "theory" as const,
            unitOrder: 1,
            title: "笔直出杆的重要性",
            content: {
              type: "theory" as const,
              text: `
# 为什么出杆必须笔直？

## 核心原理

笔直的出杆是准确击球的基础。如果出杆轨迹偏离，即使瞄准再准确，也无法将力量准确传递给目标球。

## 笔直出杆的三大好处

### 1. 提升准确性 ✅
- 球杆沿直线运动，力的方向与瞄准方向一致
- 减少偏差，提高进球率

### 2. 稳定发力 ✅
- 直线运动的力量传递最高效
- 避免侧旋等非预期效果

### 3. 控制母球 ✅
- 精准控制母球的走位
- 为下一杆创造有利位置

## 常见的出杆偏移

- ❌ **左右偏移**：手架不稳，球杆横向摆动
- ❌ **上下起伏**：握杆过紧，手腕僵硬
- ❌ **加速不均**：出杆时突然加速或减速

## 检测方法

将一瓶矿泉水立在台面上，球杆从瓶口穿过试杆。如果杆体碰到瓶口，说明出杆不够笔直。
              `.trim(),
              images: [],
              video: "",
            },
            xpReward: 10,
            estimatedMinutes: 5,
          },
          {
            unitType: "practice" as const,
            unitOrder: 2,
            title: "慢速出杆练习",
            content: {
              type: "practice" as const,
              instructions: `
# 慢动作出杆练习

## 练习方法：
1. 标准入位，手架稳固
2. 握杆放松，手腕自然
3. **极慢速度**完成出杆动作（至少3秒）
4. 感受球杆沿直线运动的感觉
5. 击打白球后，杆头自然停在原位

## 练习目标：
- 完成 **15次** 慢速出杆
- 每次出杆时间不少于3秒
- 杆头轨迹保持水平直线

## 自我检查：
- [ ] 出杆过程中是否有左右摆动？
- [ ] 手腕是否保持放松？
- [ ] 杆头是否平稳向前推进？
- [ ] 击球点是否准确？

## 关键要点：
- **慢**：慢到能清晰感受每一寸运动
- **稳**：手架稳定，握杆不变
- **直**：杆体始终保持水平
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 15,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 3,
            title: "击打白球定杆",
            content: {
              type: "practice" as const,
              instructions: `
# 定杆练习（击打白球中心点）

## 练习方法：
1. 将白球放在台面中央
2. 瞄准白球正中心（5分点）
3. 轻力出杆，击打白球
4. 观察白球是否原地旋转不走（定杆效果）

## 练习目标：
- 完成 **10次** 成功定杆
- 白球在击打后原地旋转
- 旋转幅度小于一个球的直径

## 成功标准：
- 白球被击打后几乎不前进
- 只有轻微的原地旋转
- 没有明显的前进或后退

## 自我检查：
- [ ] 击球点是否准确在白球中心？
- [ ] 出杆是否笔直水平？
- [ ] 力度是否适中（不过大不过小）？

## 失败分析：
- 白球向前走：击球点偏上
- 白球向后退：击球点偏下
- 白球偏左右：出杆不够笔直
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 10,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 4,
            title: "瓶子练习法",
            content: {
              type: "practice" as const,
              instructions: `
# 矿泉水瓶穿越练习

## 器材准备：
- 一个空的矿泉水瓶（500ml）
- 将瓶子立在台面上

## 练习方法：
1. 将瓶子放在白球后方约15cm处
2. 标准入位，球杆从瓶口穿过
3. 进行试杆动作（不击球）
4. 确保球杆前后运动时不碰到瓶口

## 练习目标：
- 完成 **20次** 试杆穿越
- 试杆过程中不碰到瓶子
- 保持自然的出杆速度

## 自我检查：
- [ ] 球杆是否从瓶口正中穿过？
- [ ] 前后试杆是否碰到瓶壁？
- [ ] 出杆轨迹是否保持水平？

## 进阶挑战：
- 将瓶子换成口径更小的（如可乐瓶）
- 增加试杆速度
- 完成10次连续不碰瓶
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 20,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "challenge" as const,
            unitOrder: 5,
            title: "出杆稳定性测试",
            content: {
              type: "challenge" as const,
              description: `
# 笔直出杆综合挑战

## 挑战内容：

综合运用本章节所学的技巧，完成以下三项测试：

### 测试一：慢速定杆（5次）
- 慢速出杆，击打白球中心
- 白球原地旋转不前进
- 5次中至少成功3次

### 测试二：瓶子穿越（15次）
- 球杆从矿泉水瓶口穿越
- 试杆时不碰到瓶壁
- 15次中至少成功12次

### 测试三：连续定杆（3次）
- 连续3次成功定杆
- 中间不能失败
- 每次白球位移小于半个球

## 通过标准：
- 三项测试全部达标
- 总耗时不超过10分钟

## 失败后建议：
- 回顾"慢速出杆练习"
- 加强"击打白球定杆"训练
- 重点练习手架的稳定性
              `.trim(),
              success_criteria: {
                type: "custom",
                description: "三项测试全部达标，且在10分钟内完成",
              },
              hints: [
                "慢即是快，不要急于求成",
                "手架稳定是笔直出杆的基础",
                "瓶子练习能快速发现出杆问题",
              ],
              demo_video: "",
            },
            xpReward: 30,
            estimatedMinutes: 20,
          },
        ],
      },
    ],
  },

  // ===== Level 2: 力量觉醒 =====
  {
    levelNumber: 2,
    skillName: "发力",
    skillOrder: 2,
    description: "掌握正确的发力技巧，提升击球力量和稳定性",
    subSkills: [
      {
        subSkillName: "发力基础",
        subSkillOrder: 1,
        description: "学习基本的发力原理和技巧",
        units: [
          {
            unitType: "theory" as const,
            unitOrder: 1,
            title: "发力原理与技巧",
            content: {
              type: "theory" as const,
              text: `
# 台球发力的核心原理

## 什么是正确的发力？

台球的发力不是靠手臂的力量，而是通过**小臂的自然摆动**和**手腕的瞬间释放**来完成的。

## 三个发力关键点

### 1. 大臂固定 🔒
- 大臂（肘关节以上）保持相对静止
- 肘关节作为支点，不上下移动
- 这是稳定发力的基础

### 2. 小臂摆动 🔄
- 小臂（肘关节到手腕）像钟摆一样自然摆动
- 利用重力和惯性，而非肌肉力量
- 保持放松，避免僵硬

### 3. 手腕释放 ⚡
- 击球瞬间手腕自然向前送
- 像鞭子一样甩出去，而非推出去
- 释放要果断，不能犹豫

## 力量来源

| 错误认知 | 正确理解 |
|---------|---------|
| ❌ 手臂用力推 | ✅ 小臂自然摆 |
| ❌ 握杆越紧越好 | ✅ 握杆放松，瞬间收紧 |
| ❌ 全身用力 | ✅ 身体稳定，手臂发力 |

## 发力的三个阶段

1. **准备阶段**：握杆放松，小臂向后拉
2. **加速阶段**：小臂向前摆动，逐渐加速
3. **击球阶段**：手腕瞬间释放，完成击球

**记住**：发力的本质是"释放"而非"用力"！
              `.trim(),
              images: [],
              video: "",
            },
            xpReward: 10,
            estimatedMinutes: 5,
          },
          {
            unitType: "practice" as const,
            unitOrder: 2,
            title: "小臂摆动练习",
            content: {
              type: "practice" as const,
              instructions: `
# 钟摆式小臂练习

## 练习方法：
1. 标准入位姿势
2. 大臂保持静止（可以贴墙练习）
3. 只用小臂做前后摆动
4. 速度由慢到快，感受自然节奏

## 练习目标：
- 完成 **20次** 小臂摆动
- 保持大臂完全静止
- 摆动幅度逐渐增大
- 最后10次要有明显的加速感

## 自我检查：
- [ ] 大臂是否保持固定？
- [ ] 小臂摆动是否自然流畅？
- [ ] 肘关节是否作为唯一支点？
- [ ] 握杆是否保持放松？

## 常见错误：
- ❌ 大臂跟着动，整个手臂上下移动
- ❌ 小臂摆动僵硬，不够自然
- ❌ 摆动速度过快，失去控制

## 进阶要点：
- 慢速摆动时感受重力作用
- 快速摆动时体会惯性力量
- 击球瞬间手腕自然向前送
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 20,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "practice" as const,
            unitOrder: 3,
            title: "力量渐进训练",
            content: {
              type: "practice" as const,
              instructions: `
# 渐进式力量控制练习

## 练习设置：
在台面上放置3个目标区域：
- 近距离区（1个球位）
- 中距离区（2个球位）
- 远距离区（3个球位）

## 练习方法：
1. 从近距离开始，轻力击打白球
2. 让白球滚到近距离区停下
3. 逐步增加力量，到达中距离区
4. 最后用较大力量，到达远距离区

## 练习目标：
- 每个区域各成功 **5次**
- 总计15次成功控制
- 体会不同力量等级的发力感觉

## 力量等级参考：
- **轻力**（1级）：小臂轻轻向前送
- **中力**（3级）：小臂自然摆动
- **重力**（5级）：小臂快速摆动+手腕释放

## 自我检查：
- [ ] 能否精准控制白球停位？
- [ ] 不同力量是否有明显区别？
- [ ] 发力是否保持流畅？

## 关键要点：
轻力靠"送"，重力靠"甩"
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "custom",
                description: "3个距离区各成功5次，共15次",
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "challenge" as const,
            unitOrder: 4,
            title: "发力准确性测试",
            content: {
              type: "challenge" as const,
              description: `
# 发力控制综合挑战

## 挑战说明：

完成三个不同难度的发力测试，验证对力量的精准控制能力。

### 挑战一：定点停球（轻力）
- 用最轻的力量击打白球
- 让白球在1个球位内停下
- 连续成功 **5次**

### 挑战二：中距离控制（中力）
- 击打白球到达台面中央
- 停球位置误差不超过半个球
- 连续成功 **5次**

### 挑战三：远距离精准（重力）
- 击打白球到达对面短边
- 白球反弹后停在台面中央区域
- 连续成功 **3次**

## 通过标准：
- 三个挑战全部完成
- 轻、中、重力量都能精准控制
- 总时间不超过12分钟

## 评分标准：
- 🌟🌟🌟 12分钟内完成所有挑战
- 🌟🌟 15分钟内完成所有挑战
- 🌟 18分钟内完成所有挑战

## 失败后建议：
- 复习"小臂摆动练习"找回发力感觉
- 加强"力量渐进训练"提升控制力
- 每个力量等级单独练习直到稳定
              `.trim(),
              success_criteria: {
                type: "custom",
                description: "完成三项挑战，展现对轻、中、重力量的精准控制",
              },
              hints: [
                "轻力击球：小臂轻送，手腕不发力",
                "中力击球：小臂自然摆，节奏均匀",
                "重力击球：快速摆臂+手腕瞬间释放",
              ],
              demo_video: "",
            },
            xpReward: 30,
            estimatedMinutes: 20,
          },
        ],
      },
    ],
  },

  // ===== Level 3: 精准之道 =====
  {
    levelNumber: 3,
    skillName: "高效五分点",
    skillOrder: 3,
    description: "定杆马拉松核心技能：精准控制击球点",
    subSkills: [
      {
        subSkillName: "五分点理论",
        subSkillOrder: 1,
        description: "理解五分点系统的原理",
        units: [
          {
            unitType: "theory" as const,
            unitOrder: 1,
            title: "五分点系统解析",
            content: {
              type: "theory" as const,
              text: `
# 什么是五分点？

## 核心概念

五分点是将白球表面分为5个击球点的系统，每个点产生不同的击球效果。这是台球控制的基础。

## 五分点分布

将白球从上到下垂直分为5个点：

\`\`\`
    ①  上旋点（高杆）- 白球前进
    ②  中上点（推杆）- 白球前进
    ③  中心点（定杆）- 白球原地
    ④  中下点（缩杆）- 白球后退
    ⑤  下旋点（低杆）- 白球后退
\`\`\`

## 各点效果详解

### ① 上旋点（高杆）
- **位置**：白球上方1/3处
- **效果**：白球向前追随目标球
- **应用**：需要白球前进走位时使用

### ② 中上点（推杆）
- **位置**：白球上方1/6处
- **效果**：白球略微前进
- **应用**：最常用的击球点

### ③ 中心点（定杆）⭐
- **位置**：白球正中心
- **效果**：白球原地不动或微动
- **应用**：需要白球停在原位时使用

### ④ 中下点（缩杆）
- **位置**：白球下方1/6处
- **效果**：白球略微后退
- **应用**：需要白球后退一点距离

### ⑤ 下旋点（低杆）
- **位置**：白球下方1/3处
- **效果**：白球快速后退
- **应用**：需要白球大幅后退时使用

## 定杆（中心点）的重要性

掌握中心点击球是五分点系统的基础：
- ✅ 最容易控制的击球点
- ✅ 出杆要求最低
- ✅ 是定杆马拉松的核心技能

## 学习顺序建议

1. **先掌握定杆**（中心点）
2. 练习推杆（中上点）
3. 学习缩杆（中下点）
4. 最后挑战高杆和低杆
              `.trim(),
              images: [],
              video: "",
            },
            xpReward: 10,
            estimatedMinutes: 5,
          },
          {
            unitType: "practice" as const,
            unitOrder: 2,
            title: "五分点基础练习",
            content: {
              type: "practice" as const,
              instructions: `
# 五分点识别与击打练习

## 练习方法：

### 第一步：识别五分点
1. 在白球上贴上5个小标记（可用可擦笔）
2. 从上到下标记①②③④⑤
3. 熟悉每个点的位置

### 第二步：依次击打
1. 从中心点③开始练习（最简单）
2. 击打后观察白球的运动轨迹
3. 依次练习其他4个点

## 练习目标：
- 每个击球点各练习 **8次**
- 总计40次击球
- 熟悉每个点产生的效果

## 观察要点：

### 击打中心点③（定杆）
- 白球应该原地旋转，几乎不前进
- 如果白球前进 → 击球点偏高
- 如果白球后退 → 击球点偏低

### 击打中上点②（推杆）
- 白球应该向前滚动
- 注意前进距离不要太远

### 击打中下点④（缩杆）
- 白球应该向后移动
- 后退距离应该可控

## 自我检查：
- [ ] 能否准确找到每个击球点？
- [ ] 不同击球点的效果是否明显？
- [ ] 出杆是否保持笔直？

## 成功标志：
击打中心点时，白球能稳定地原地旋转
              `.trim(),
              demo_video: "",
              success_criteria: {
                type: "repetitions" as const,
                target: 40,
              },
            },
            xpReward: 20,
            estimatedMinutes: 15,
          },
          {
            unitType: "challenge" as const,
            unitOrder: 3,
            title: "定杆马拉松挑战",
            content: {
              type: "challenge" as const,
              description: `
# 定杆马拉松：连续20颗挑战

## 挑战说明：

这是"定杆马拉松"的入门挑战。目标是连续击打白球中心点（③），让白球保持在原位，挑战连续成功次数。

## 挑战规则：

### 基础规则
1. 将白球放在台面中央
2. 每次击打白球中心点
3. 白球位移不超过半个球直径
4. 连续击打，挑战最高记录

### 成功标准
- **⭐ 入门级**：连续成功 **10次**
- **⭐⭐ 熟练级**：连续成功 **15次**
- **⭐⭐⭐ 大师级**：连续成功 **20次**

### 失败条件
- 白球位移超过半个球直径
- 出杆明显不笔直
- 击球点偏离中心过多

## 评分说明：

| 连续次数 | 评级 | 说明 |
|---------|------|------|
| 20+ | 🏆 大师 | 完美掌握定杆技术 |
| 15-19 | 🥇 熟练 | 定杆技术稳定 |
| 10-14 | 🥈 入门 | 基本掌握定杆 |
| < 10 | 🥉 练习 | 需要更多练习 |

## 技巧提示：
- 保持呼吸平稳，不要紧张
- 每次击球前都要重新瞄准
- 发力要稳定，不要忽轻忽重
- 失败后不要气馁，从头开始

## 失败后建议：
- 如果经常打偏上或偏下：复习"五分点识别"
- 如果白球左右偏移：回顾"笔直出杆"章节
- 如果力量不稳定：复习"发力控制"章节

## 长期目标：
这个挑战没有上限！
- 30次：业余高手
- 50次：准专业水平
- 100次：职业级定杆能力
              `.trim(),
              success_criteria: {
                type: "custom",
                description: "连续成功击打中心点20次，白球位移不超过半个球直径",
              },
              hints: [
                "放松心态，定杆比你想象的简单",
                "击球点比力量更重要，准确第一",
                "保持节奏一致，不要越打越快",
              ],
              demo_video: "",
            },
            xpReward: 30,
            estimatedMinutes: 20,
          },
        ],
      },
    ],
  },
  // ===== 第四~十招 =====
  // TODO: 补充剩余招式数据
  // 注意：准度、杆法、分离角、走位、清蛇彩、练习、思路、心态
];

// ============================================================================
// 专项训练数据
// ============================================================================

const SPECIALIZED_TRAININGS_DATA = [
  {
    trainingName: "基本功强化",
    category: "基础训练",
    description: "针对性提升手架、握杆、姿势的稳定性",
    difficulty: "初级",
    plans: [
      {
        planName: "30天手架稳定计划",
        description: "每日10分钟手架定型练习",
        duration: 30,
        sessionsPerWeek: 7,
        planContent: {
          // TODO: 详细训练计划
        },
      },
      // TODO: 添加更多训练计划
    ],
  },
  // TODO: 添加其他7个专项训练
];

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 清除所有训练数据（强制模式）
 */
async function clearAllData() {
  console.log("🗑️  清除现有数据...");

  try {
    await db.delete(specializedTrainingPlans);
    await db.delete(specializedTrainings);
    await db.delete(trainingUnits);
    await db.delete(subSkills);
    await db.delete(trainingSkills);
    await db.delete(trainingLevels);

    console.log("✅ 现有数据已清除\n");
  } catch (error: any) {
    console.error("❌ 清除数据失败:", error.message);
    throw error;
  }
}

/**
 * 打印导入统计信息
 */
function printStats() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 导入统计报告");
  console.log("=".repeat(60) + "\n");

  const sections = [
    { name: "训练等级", stats: stats.levels },
    { name: "技能(十大招)", stats: stats.skills },
    { name: "子技能(章节)", stats: stats.subSkills },
    { name: "训练单元(关卡)", stats: stats.units },
    { name: "专项训练", stats: stats.specialized },
  ];

  sections.forEach(({ name, stats: s }) => {
    console.log(`${name}:`);
    console.log(`  总计: ${s.total}`);
    console.log(`  ✅ 成功: ${s.success}`);
    if (s.skipped > 0) console.log(`  ⏭️  跳过: ${s.skipped}`);
    if (s.failed > 0) console.log(`  ❌ 失败: ${s.failed}`);
    console.log();
  });

  // 显示错误详情
  if (stats.errors.length > 0) {
    console.log("❌ 错误详情:");
    stats.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. [${err.step}] ${err.item}`);
      console.log(`     ${err.error}`);
    });
    console.log();
  }

  const totalSuccess =
    stats.levels.success +
    stats.skills.success +
    stats.subSkills.success +
    stats.units.success +
    stats.specialized.success;

  const totalFailed =
    stats.levels.failed +
    stats.skills.failed +
    stats.subSkills.failed +
    stats.units.failed +
    stats.specialized.failed;

  console.log("=".repeat(60));
  console.log(`总成功: ${totalSuccess} | 总失败: ${totalFailed}`);
  console.log("=".repeat(60) + "\n");
}

// ============================================================================
// 主导入逻辑
// ============================================================================

async function importTrainingData() {
  console.log("🚀 开始导入V2.1训练数据...\n");

  // 强制模式：清除现有数据
  if (isForceMode && !isDryRun) {
    await clearAllData();
  }

  try {
    // ========== 数据预验证 ==========
    console.log("🔍 Step 0/5: 数据预验证...\n");

    let validationErrors: string[] = [];

    // 验证等级数据
    TRAINING_LEVELS_DATA.forEach((level, idx) => {
      const errors = validateLevel(level, `Level ${idx + 1}`);
      validationErrors.push(...errors);
    });

    // 验证技能数据
    TEN_SKILLS_DATA.forEach((skill) => {
      const errors = validateSkill(skill, `Skill: ${skill.skillName}`);
      validationErrors.push(...errors);
    });

    if (validationErrors.length > 0) {
      console.error("❌ 数据验证失败，发现以下错误:\n");
      validationErrors.forEach((err, idx) => {
        console.error(`  ${idx + 1}. ${err}`);
      });
      console.error("\n请修复数据后重试。");
      process.exit(1);
    }

    console.log("✅ 数据验证通过\n");

    // ========== Step 1: 导入训练等级 ==========
    console.log("📊 Step 1/5: 导入8个训练等级...");
    const insertedLevels = [];

    for (let i = 0; i < TRAINING_LEVELS_DATA.length; i++) {
      const levelData = { ...TRAINING_LEVELS_DATA[i] };
      stats.levels.total++;

      try {
        // 设置prerequisite（每个level的前置是上一个level）
        if (i > 0 && insertedLevels[i - 1]) {
          levelData.prerequisiteLevelId = insertedLevels[i - 1].id;
        }

        // 检查是否已存在（幂等性）
        if (!isForceMode && !isDryRun) {
          const existing = await db
            .select()
            .from(trainingLevels)
            .where(eq(trainingLevels.levelNumber, levelData.levelNumber))
            .limit(1);

          if (existing.length > 0) {
            console.log(`   ⏭️  Level ${levelData.levelNumber}: ${levelData.title} (已存在，跳过)`);
            insertedLevels.push(existing[0]);
            stats.levels.skipped++;
            continue;
          }
        }

        // 试运行模式：不实际插入
        if (isDryRun) {
          console.log(`   🔍 Level ${levelData.levelNumber}: ${levelData.title} (验证通过)`);
          insertedLevels.push({ id: `dry-run-level-${i}`, ...levelData } as any);
          stats.levels.success++;
          continue;
        }

        // 实际插入
        const [inserted] = await db.insert(trainingLevels).values(levelData).returning();
        insertedLevels.push(inserted);
        console.log(`   ✅ Level ${levelData.levelNumber}: ${levelData.title}`);
        stats.levels.success++;
      } catch (error: any) {
        console.error(`   ❌ Level ${levelData.levelNumber}: ${error.message}`);
        stats.levels.failed++;
        stats.errors.push({
          step: "导入等级",
          item: `Level ${levelData.levelNumber}: ${levelData.title}`,
          error: error.message,
        });
      }
    }

    console.log(`\n✅ Step 1 完成: 成功 ${stats.levels.success}/${stats.levels.total}\n`);

    // ========== Step 2: 导入技能（十大招） ==========
    console.log("🎯 Step 2/5: 导入十大招技能...");
    const insertedSkills = [];

    for (const skillData of TEN_SKILLS_DATA) {
      stats.skills.total++;

      try {
        const levelId = insertedLevels.find(l => l.levelNumber === skillData.levelNumber)?.id;
        if (!levelId) {
          throw new Error(`找不到Level ${skillData.levelNumber}`);
        }

        // 检查是否已存在（幂等性）
        if (!isForceMode && !isDryRun) {
          const existing = await db
            .select()
            .from(trainingSkills)
            .where(
              and(
                eq(trainingSkills.levelId, levelId),
                eq(trainingSkills.skillOrder, skillData.skillOrder)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            console.log(`   ⏭️  ${skillData.skillName} (Level ${skillData.levelNumber}) - 已存在，跳过`);
            insertedSkills.push({ ...existing[0], subSkills: skillData.subSkills } as any);
            stats.skills.skipped++;
            continue;
          }
        }

        // 试运行模式
        if (isDryRun) {
          console.log(`   🔍 ${skillData.skillName} (Level ${skillData.levelNumber}) - 验证通过`);
          insertedSkills.push({
            id: `dry-run-skill-${skillData.skillOrder}`,
            levelId,
            ...skillData,
          } as any);
          stats.skills.success++;
          continue;
        }

        // 实际插入
        const [insertedSkill] = await db
          .insert(trainingSkills)
          .values({
            levelId,
            skillName: skillData.skillName,
            skillOrder: skillData.skillOrder,
            description: skillData.description,
          })
          .returning();

        insertedSkills.push({ ...insertedSkill, subSkills: skillData.subSkills } as any);
        console.log(`   ✅ ${skillData.skillName} (Level ${skillData.levelNumber})`);
        stats.skills.success++;
      } catch (error: any) {
        console.error(`   ❌ ${skillData.skillName}: ${error.message}`);
        stats.skills.failed++;
        stats.errors.push({
          step: "导入技能",
          item: `${skillData.skillName} (Level ${skillData.levelNumber})`,
          error: error.message,
        });
      }
    }

    console.log(`\n✅ Step 2 完成: 成功 ${stats.skills.success}/${stats.skills.total}\n`);

    // ========== Step 3: 导入子技能（章节） ==========
    console.log("📖 Step 3/5: 导入子技能（章节）...");

    for (const skill of insertedSkills) {
      for (const subSkillData of skill.subSkills || []) {
        stats.subSkills.total++;

        try {
          // 检查是否已存在（幂等性）
          if (!isForceMode && !isDryRun) {
            const existing = await db
              .select()
              .from(subSkills)
              .where(
                and(
                  eq(subSkills.skillId, skill.id),
                  eq(subSkills.subSkillOrder, subSkillData.subSkillOrder)
                )
              )
              .limit(1);

            if (existing.length > 0) {
              console.log(`   ⏭️  ${subSkillData.subSkillName} (${skill.skillName}) - 已存在，跳过`);
              (existing[0] as any).units = subSkillData.units;
              (skill.subSkills as any)[subSkillData.subSkillOrder - 1] = existing[0];
              stats.subSkills.skipped++;
              continue;
            }
          }

          // 试运行模式
          if (isDryRun) {
            console.log(`   🔍 ${subSkillData.subSkillName} (${skill.skillName}) - 验证通过`);
            const dryRunSubSkill = {
              id: `dry-run-subskill-${stats.subSkills.total}`,
              skillId: skill.id,
              ...subSkillData,
            };
            (dryRunSubSkill as any).units = subSkillData.units;
            (skill.subSkills as any)[subSkillData.subSkillOrder - 1] = dryRunSubSkill;
            stats.subSkills.success++;
            continue;
          }

          // 实际插入
          const [insertedSubSkill] = await db
            .insert(subSkills)
            .values({
              skillId: skill.id,
              subSkillName: subSkillData.subSkillName,
              subSkillOrder: subSkillData.subSkillOrder,
              description: subSkillData.description,
            })
            .returning();

          // 保存units用于下一步
          (insertedSubSkill as any).units = subSkillData.units;
          (skill.subSkills as any)[subSkillData.subSkillOrder - 1] = insertedSubSkill;

          console.log(`   ✅ ${subSkillData.subSkillName} (${skill.skillName})`);
          stats.subSkills.success++;
        } catch (error: any) {
          console.error(`   ❌ ${subSkillData.subSkillName}: ${error.message}`);
          stats.subSkills.failed++;
          stats.errors.push({
            step: "导入子技能",
            item: `${subSkillData.subSkillName} (${skill.skillName})`,
            error: error.message,
          });
        }
      }
    }

    console.log(`\n✅ Step 3 完成: 成功 ${stats.subSkills.success}/${stats.subSkills.total}\n`);

    // ========== Step 4: 导入训练单元（关卡） ==========
    console.log("🎮 Step 4/5: 导入训练单元（关卡）...");

    for (const skill of insertedSkills) {
      for (const subSkill of skill.subSkills || []) {
        const units = (subSkill as any).units || [];

        for (const unitData of units) {
          stats.units.total++;

          try {
            // 检查是否已存在（幂等性）
            if (!isForceMode && !isDryRun) {
              const existing = await db
                .select()
                .from(trainingUnits)
                .where(
                  and(
                    eq(trainingUnits.subSkillId, subSkill.id),
                    eq(trainingUnits.unitOrder, unitData.unitOrder)
                  )
                )
                .limit(1);

              if (existing.length > 0) {
                console.log(`   ⏭️  [${unitData.unitType}] ${unitData.title} - 已存在，跳过`);
                stats.units.skipped++;
                continue;
              }
            }

            // 试运行模式
            if (isDryRun) {
              console.log(`   🔍 [${unitData.unitType}] ${unitData.title} - 验证通过`);
              stats.units.success++;
              continue;
            }

            // 实际插入
            await db.insert(trainingUnits).values({
              subSkillId: subSkill.id,
              unitType: unitData.unitType,
              unitOrder: unitData.unitOrder,
              title: unitData.title,
              content: unitData.content as any,
              xpReward: unitData.xpReward,
              estimatedMinutes: unitData.estimatedMinutes,
            });

            console.log(`   ✅ [${unitData.unitType}] ${unitData.title}`);
            stats.units.success++;
          } catch (error: any) {
            console.error(`   ❌ ${unitData.title}: ${error.message}`);
            stats.units.failed++;
            stats.errors.push({
              step: "导入训练单元",
              item: `[${unitData.unitType}] ${unitData.title}`,
              error: error.message,
            });
          }
        }
      }
    }

    console.log(`\n✅ Step 4 完成: 成功 ${stats.units.success}/${stats.units.total}\n`);

    // ========== Step 5: 导入专项训练 ==========
    console.log("💪 Step 5/5: 导入专项训练...");

    for (const trainingData of SPECIALIZED_TRAININGS_DATA) {
      stats.specialized.total++;

      try {
        // 检查是否已存在（幂等性）
        if (!isForceMode && !isDryRun) {
          const existing = await db
            .select()
            .from(specializedTrainings)
            .where(eq(specializedTrainings.trainingName, trainingData.trainingName))
            .limit(1);

          if (existing.length > 0) {
            console.log(`   ⏭️  ${trainingData.trainingName} - 已存在，跳过`);
            stats.specialized.skipped++;
            continue;
          }
        }

        // 试运行模式
        if (isDryRun) {
          console.log(`   🔍 ${trainingData.trainingName} - 验证通过`);
          stats.specialized.success++;
          continue;
        }

        // 实际插入
        const [insertedTraining] = await db
          .insert(specializedTrainings)
          .values({
            trainingName: trainingData.trainingName,
            category: trainingData.category,
            description: trainingData.description,
            difficulty: trainingData.difficulty,
          })
          .returning();

        // 插入训练计划
        for (const planData of trainingData.plans) {
          await db.insert(specializedTrainingPlans).values({
            trainingId: insertedTraining.id,
            planName: planData.planName,
            description: planData.description,
            duration: planData.duration,
            sessionsPerWeek: planData.sessionsPerWeek,
            planContent: planData.planContent as any,
          });
        }

        console.log(`   ✅ ${trainingData.trainingName} (含 ${trainingData.plans.length} 个计划)`);
        stats.specialized.success++;
      } catch (error: any) {
        console.error(`   ❌ ${trainingData.trainingName}: ${error.message}`);
        stats.specialized.failed++;
        stats.errors.push({
          step: "导入专项训练",
          item: trainingData.trainingName,
          error: error.message,
        });
      }
    }

    console.log(`\n✅ Step 5 完成: 成功 ${stats.specialized.success}/${stats.specialized.total}\n`);

    // ========== 导入完成，打印统计报告 ==========
    printStats();

    if (isDryRun) {
      console.log("🔍 试运行模式：数据验证成功，未写入数据库");
    } else {
      console.log("🎉 数据导入完成！");
    }
  } catch (error: any) {
    console.error("\n❌ 导入失败:", error.message);
    console.error(error);
    printStats();
    process.exit(1);
  }
}

// 运行导入
importTrainingData()
  .then(() => {
    console.log("\n✅ 脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 脚本执行失败:", error);
    process.exit(1);
  });
