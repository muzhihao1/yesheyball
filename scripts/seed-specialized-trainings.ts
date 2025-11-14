/**
 * Seed script for 8 specialized training categories
 * 专项训练道场初始数据导入
 */

import "dotenv/config";
import { db } from "../server/db.js";
import { specializedTrainingsV3 } from "../shared/schema.js";

console.log("🎯 开始导入专项训练道场数据...\n");

const trainings = [
  {
    id: 'st_basic',
    title: '基本功道场',
    description: '站位、手架、出杆的稳定性训练',
    iconName: 'Layers',
    category: '基础训练',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'st_power',
    title: '发力训练营',
    description: '掌握大力、中力、小力的发力控制',
    iconName: 'Zap',
    category: '力度控制',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'st_accuracy',
    title: '准度射击场',
    description: '提升瞄准精度和击球准确性',
    iconName: 'Target',
    category: '准度训练',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'st_spin',
    title: '杆法实验室',
    description: '高杆、低杆、偏杆等杆法的系统练习',
    iconName: 'Rotate3D',
    category: '杆法训练',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'st_angle',
    title: '分离角计算器',
    description: '理解和掌握分离角的计算与应用',
    iconName: 'Compass',
    category: '角度训练',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'st_positioning',
    title: '走位规划室',
    description: '母球走位路线的规划与控制',
    iconName: 'Route',
    category: '走位训练',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'st_clearance',
    title: '清台挑战赛',
    description: '从开球到清台的全局思维训练',
    iconName: 'Trophy',
    category: '实战训练',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'st_five_points',
    title: '五分点速成班',
    description: '快速掌握五分点理论与实战应用',
    iconName: 'Grid3x3',
    category: '理论实践',
    sortOrder: 8,
    isActive: true,
  },
];

async function seedSpecializedTrainings() {
  try {
    console.log("📝 插入 8 个专项训练类别...\n");

    for (const training of trainings) {
      await db
        .insert(specializedTrainingsV3)
        .values(training)
        .onConflictDoNothing();

      console.log(`   ✅ ${training.sortOrder}. ${training.title} (${training.id})`);
    }

    console.log("\n✨ 专项训练道场数据导入完成！\n");
    console.log("📊 数据统计:");
    console.log(`   - 总类别数: ${trainings.length}`);
    console.log(`   - 基础训练: 1`);
    console.log(`   - 技术训练: 5`);
    console.log(`   - 实战训练: 2`);
    console.log("\n🎉 可以开始创建训练计划了！");

  } catch (error) {
    console.error("❌ 导入失败:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedSpecializedTrainings();
