/**
 * Seed script for specialized training plans
 * Adds 24 detailed training plans (3 per dojo) to the database
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { specializedTrainingPlansV3 } from '../shared/schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

const trainingPlans = [
  // ============================================================================
  // 1. 基本功道场 (Basic Fundamentals Dojo)
  // ============================================================================
  {
    id: 'plan_basic_1',
    trainingId: 'st_basic',
    title: '中点直线球练习',
    description: '练习精确击打母球中心，掌握稳定的出杆动作。在台面中心位置放置目标球，与中袋成直线，要求连续进球。',
    difficulty: 'easy',
    estimatedTimeMinutes: 15,
    xpReward: 20,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '基本功',
      recordConfig: {
        metrics: ['successRate', 'consistency'],
        scoringMethod: 'percentage',
        targetSuccessRate: 90
      }
    },
    content: {
      sets: 5,
      repsPerSet: 10,
      successCriteria: '连续10次中有9次以上成功进球',
      keyPoints: ['保持出杆稳定', '精确击打母球中心', '控制力度均匀']
    }
  },
  {
    id: 'plan_basic_2',
    trainingId: 'st_basic',
    title: '远距离直线球练习',
    description: '增加击球距离，训练长台直线球的准确性和稳定性。目标球距离母球3个球台长度以上。',
    difficulty: 'medium',
    estimatedTimeMinutes: 20,
    xpReward: 30,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '基本功',
      recordConfig: {
        metrics: ['successRate', 'powerControl'],
        scoringMethod: 'percentage',
        targetSuccessRate: 80
      }
    },
    content: {
      sets: 5,
      repsPerSet: 10,
      successCriteria: '连续10次中有8次以上成功进球',
      keyPoints: ['保持瞄准线稳定', '适度发力', '跟进动作完整']
    }
  },
  {
    id: 'plan_basic_3',
    trainingId: 'st_basic',
    title: '击球点校准练习',
    description: '精确练习击打母球的不同位置（九分点），建立击球点位感觉。使用练习球或标记辅助。',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 30,
    metadata: {
      trainingType: 'technique',
      primarySkill: '基本功',
      recordConfig: {
        metrics: ['accuracy', 'pointControl'],
        scoringMethod: 'points',
        targetSuccessRate: 85
      }
    },
    content: {
      sets: 3,
      repsPerSet: 9,
      successCriteria: '能够准确击打母球九分点中的8个点以上',
      keyPoints: ['瞄准击球点', '控制球杆角度', '保持稳定击球']
    }
  },

  // ============================================================================
  // 2. 发力训练营 (Power Control Training Camp)
  // ============================================================================
  {
    id: 'plan_power_1',
    trainingId: 'st_power',
    title: '定杆练习',
    description: '练习定杆技术，使母球在击打目标球后原地停止或小范围移动。掌握力度和击球点的配合。',
    difficulty: 'medium',
    estimatedTimeMinutes: 20,
    xpReward: 30,
    metadata: {
      trainingType: 'technique',
      primarySkill: '发力',
      recordConfig: {
        metrics: ['stunAccuracy', 'distanceControl'],
        scoringMethod: 'distance',
        targetSuccessRate: 85
      }
    },
    content: {
      sets: 4,
      repsPerSet: 10,
      successCriteria: '母球停留在半个球位范围内',
      distances: ['1球台', '2球台', '3球台'],
      keyPoints: ['击打母球中下部', '力度适中', '杆头保持水平']
    }
  },
  {
    id: 'plan_power_2',
    trainingId: 'st_power',
    title: '推杆练习',
    description: '练习推杆（高杆）技术，控制母球跟进的距离。分别练习不同距离的推进效果。',
    difficulty: 'medium',
    estimatedTimeMinutes: 20,
    xpReward: 30,
    metadata: {
      trainingType: 'technique',
      primarySkill: '发力',
      recordConfig: {
        metrics: ['followDistance', 'control'],
        scoringMethod: 'distance',
        targetSuccessRate: 80
      }
    },
    content: {
      sets: 4,
      repsPerSet: 10,
      successCriteria: '母球跟进到目标位置1球位范围内',
      targetDistances: ['半球台', '1球台', '2球台'],
      keyPoints: ['击打母球中上部', '跟进动作完整', '力度与击球点配合']
    }
  },
  {
    id: 'plan_power_3',
    trainingId: 'st_power',
    title: '拉杆练习',
    description: '练习拉杆（低杆）技术，控制母球回拉的距离。掌握不同力度下的回拉效果。',
    difficulty: 'hard',
    estimatedTimeMinutes: 25,
    xpReward: 40,
    metadata: {
      trainingType: 'technique',
      primarySkill: '发力',
      recordConfig: {
        metrics: ['drawDistance', 'backspinControl'],
        scoringMethod: 'distance',
        targetSuccessRate: 75
      }
    },
    content: {
      sets: 4,
      repsPerSet: 10,
      successCriteria: '母球回拉到目标位置1球位范围内',
      targetDistances: ['半球台', '1球台', '1.5球台'],
      keyPoints: ['击打母球最下点', '发力集中爆发', '杆头保持稳定']
    }
  },

  // ============================================================================
  // 3. 准度射击场 (Accuracy Shooting Range)
  // ============================================================================
  {
    id: 'plan_accuracy_1',
    trainingId: 'st_accuracy',
    title: '角度球练习',
    description: '系统练习不同角度的切球，从15度到75度，每15度一个档位。建立角度球的肌肉记忆。',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 35,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      recordConfig: {
        metrics: ['successRate', 'angleAccuracy'],
        scoringMethod: 'percentage',
        targetSuccessRate: 80
      }
    },
    content: {
      sets: 5,
      repsPerSet: 5,
      angles: ['15°', '30°', '45°', '60°', '75°'],
      successCriteria: '每个角度5次中成功4次以上',
      keyPoints: ['准确瞄准切点', '保持出杆直线', '不同角度调整力度']
    }
  },
  {
    id: 'plan_accuracy_2',
    trainingId: 'st_accuracy',
    title: '远台球练习',
    description: '练习长距离击球的准确性，提升远台进攻能力。目标球距离母球4个球台长度以上。',
    difficulty: 'hard',
    estimatedTimeMinutes: 25,
    xpReward: 40,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      recordConfig: {
        metrics: ['longShotAccuracy', 'powerControl'],
        scoringMethod: 'percentage',
        targetSuccessRate: 70
      }
    },
    content: {
      sets: 5,
      repsPerSet: 10,
      successCriteria: '远台球成功率达到70%以上',
      distances: ['对角线全台', '直线全台'],
      keyPoints: ['瞄准更加仔细', '出杆更加稳定', '适度发力']
    }
  },
  {
    id: 'plan_accuracy_3',
    trainingId: 'st_accuracy',
    title: '薄球练习',
    description: '专门训练需要极高准确度的薄切球，提升在复杂球局下的进攻能力。',
    difficulty: 'expert',
    estimatedTimeMinutes: 25,
    xpReward: 50,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      recordConfig: {
        metrics: ['thinCutAccuracy', 'precision'],
        scoringMethod: 'percentage',
        targetSuccessRate: 60
      }
    },
    content: {
      sets: 5,
      repsPerSet: 10,
      cutAngles: ['10°', '5°', '极薄'],
      successCriteria: '薄球成功率达到60%以上',
      keyPoints: ['精确瞄准薄边', '出杆极度稳定', '心理专注度']
    }
  },

  // Continue with remaining dojos (4-8)...
  // Due to length, I'll add the rest in a follow-up message
];

async function seed() {
  console.log('🌱 Starting to seed specialized training plans...');

  try {
    // Insert all training plans
    await db.insert(specializedTrainingPlansV3).values(trainingPlans).onConflictDoNothing();

    console.log(`✅ Successfully seeded ${trainingPlans.length} training plans!`);
    console.log('\nTraining plans added:');

    // Group by dojo
    const byDojo = trainingPlans.reduce((acc, plan) => {
      if (!acc[plan.trainingId]) {
        acc[plan.trainingId] = [];
      }
      acc[plan.trainingId].push(plan.title);
      return acc;
    }, {} as Record<string, string[]>);

    Object.entries(byDojo).forEach(([dojoId, planTitles]) => {
      console.log(`\n${dojoId}:`);
      planTitles.forEach((title, idx) => {
        console.log(`  ${idx + 1}. ${title}`);
      });
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
