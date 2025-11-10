/**
 * 简化版数据导入 - 导入示例数据用于API测试
 */

import "dotenv/config";
import { db } from "../server/db.js";
import {
  trainingLevels,
  trainingSkills,
  subSkills,
  trainingUnits,
} from "../shared/schema.js";

console.log("🚀 开始导入示例数据...\n");

async function seedData() {
  try {
    // 插入1个测试Level
    console.log("📊 插入测试Level...");
    const [level1] = await db
      .insert(trainingLevels)
      .values({
        levelNumber: 1,
        title: "新手起步",
        description: "台球入门：掌握基本功",
        prerequisiteLevelId: null,
        orderIndex: 1,
        isActive: true,
      })
      .returning();

    console.log(`   ✅ Level 1: ${level1.title}`);

    // 插入1个测试Skill
    console.log("\n🎯 插入测试Skill...");
    const [skill1] = await db
      .insert(trainingSkills)
      .values({
        levelId: level1.id,
        skillName: "基本功",
        skillOrder: 1,
        description: "台球的根基：手架、握杆、入位、姿势",
      })
      .returning();

    console.log(`   ✅ ${skill1.skillName}`);

    // 插入1个测试SubSkill
    console.log("\n📖 插入测试SubSkill...");
    const [subSkill1] = await db
      .insert(subSkills)
      .values({
        skillId: skill1.id,
        subSkillName: "稳固的根基",
        subSkillOrder: 1,
        description: "掌握手架和握杆的基础技巧",
      })
      .returning();

    console.log(`   ✅ ${subSkill1.subSkillName}`);

    // 插入1个测试TrainingUnit
    console.log("\n🎮 插入测试TrainingUnit...");
    const [unit1] = await db
      .insert(trainingUnits)
      .values({
        subSkillId: subSkill1.id,
        unitType: "theory",
        unitOrder: 1,
        title: "认识台球四大基本动作",
        content: {
          type: "theory",
          text: "台球的四大基本动作是：手架、握杆、入位、姿势。这是所有技巧的基础。",
          images: [],
          video: "",
        } as any,
        xpReward: 10,
        estimatedMinutes: 5,
      })
      .returning();

    console.log(`   ✅ [theory] ${unit1.title}`);

    console.log("\n🎉 示例数据导入成功！\n");
    console.log("现在可以运行: npx tsx scripts/test-training-api.ts\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ 导入失败:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
