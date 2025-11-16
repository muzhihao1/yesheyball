/**
 * Seed training plans via API endpoint
 * This bypasses direct database connection issues
 */

const trainingPlans = [
  // 基本功训练道场
  {
    id: 'plan_basic_beginner',
    trainingId: 'st_basic',
    title: '站位与姿势练习',
    description: '入门级基本功训练：反复练习标准的站位和姿势，做到稳定、舒适。形成标准的击球姿势。',
    difficulty: 'easy',
    estimatedTimeMinutes: 30,
    xpReward: 20,
    metadata: {
      trainingType: 'fundamentals',
      primarySkill: '基本功',
      level: '入门',
      recordConfig: {
        metrics: ['stability', 'consistency'],
        scoringMethod: 'performance',
        targetSuccessRate: 85
      }
    },
    content: {
      duration: 30,
      goal: '形成标准的击球姿势',
      evaluation: '每次击球都能保持稳定的姿势',
      keyPoints: ['站位稳定', '重心平衡', '姿势舒适', '视线正确'],
      practice: ['镜前练习站位', '空杆练习', '观察专业选手姿势']
    }
  },
  {
    id: 'plan_basic_intermediate',
    trainingId: 'st_basic',
    title: '握杆与手架练习',
    description: '进阶级基本功训练：练习正确的握杆方法和稳固的手架，能够根据不同球形变换手架。',
    difficulty: 'medium',
    estimatedTimeMinutes: 45,
    xpReward: 30,
    metadata: {
      trainingType: 'fundamentals',
      primarySkill: '基本功',
      level: '进阶',
      recordConfig: {
        metrics: ['gripControl', 'bridgeStability'],
        scoringMethod: 'performance',
        targetSuccessRate: 80
      }
    },
    content: {
      duration: 45,
      goal: '掌握稳固的握杆和手架',
      evaluation: '能够根据不同球形变换手架',
      keyPoints: ['握杆松紧适度', '手架稳固', '能变换不同手架', '远台手架'],
      practice: ['标准握杆练习', '凤眼手架', 'V形手架', '远台手架']
    }
  },
  {
    id: 'plan_basic_master',
    trainingId: 'st_basic',
    title: '出杆精准度练习',
    description: '大师级基本功训练：做到出杆笔直、平顺，能够长时间保持出杆的稳定性。',
    difficulty: 'hard',
    estimatedTimeMinutes: 60,
    xpReward: 40,
    metadata: {
      trainingType: 'fundamentals',
      primarySkill: '基本功',
      level: '大师',
      recordConfig: {
        metrics: ['strokeAccuracy', 'consistency'],
        scoringMethod: 'performance',
        targetSuccessRate: 90
      }
    },
    content: {
      duration: 60,
      goal: '做到出杆笔直、平顺',
      evaluation: '能够长时间保持出杆的稳定性',
      keyPoints: ['出杆笔直', '运杆平顺', '延伸完整', '回杆稳定'],
      practice: ['空杆练习200次', '瓶颈练习', '摆球练习', '长时间练习']
    }
  },

  // 准度训练道场
  {
    id: 'plan_accuracy_beginner',
    trainingId: 'st_accuracy',
    title: '直线球练习（短、中距离）',
    description: '入门级准度训练：练习不同距离下的直线球击打，掌握直线球的稳定击打。',
    difficulty: 'easy',
    estimatedTimeMinutes: 30,
    xpReward: 20,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      level: '入门',
      recordConfig: {
        metrics: ['successRate'],
        scoringMethod: 'percentage',
        targetSuccessRate: 80
      }
    },
    content: {
      duration: 30,
      goal: '掌握直线球的稳定击打',
      evaluation: '10颗球进8颗为合格',
      sets: 5,
      repsPerSet: 10,
      keyPoints: ['瞄准球心', '出杆稳定', '力度均匀', '延伸完整'],
      distances: ['近台(1球台)', '中台(2球台)', '远台(3球台)']
    }
  },
  {
    id: 'plan_accuracy_intermediate',
    trainingId: 'st_accuracy',
    title: '角度球练习（15、30度）',
    description: '进阶级准度训练：练习15、30度等常见角度的击打，建立角度球的初步感觉。',
    difficulty: 'medium',
    estimatedTimeMinutes: 45,
    xpReward: 30,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      level: '进阶',
      recordConfig: {
        metrics: ['angleAccuracy'],
        scoringMethod: 'percentage',
        targetSuccessRate: 60
      }
    },
    content: {
      duration: 45,
      goal: '建立角度球的初步感觉',
      evaluation: '10颗球进6颗为合格',
      sets: 5,
      repsPerSet: 10,
      angles: ['15度', '30度', '45度'],
      keyPoints: ['找准切点', '瞄准修正', '力度控制', '杆法配合']
    }
  },
  {
    id: 'plan_accuracy_master',
    trainingId: 'st_accuracy',
    title: '贴库球与翻袋练习',
    description: '大师级准度训练：克服特殊球形的心理障碍，掌握贴库球和翻袋技巧。',
    difficulty: 'hard',
    estimatedTimeMinutes: 60,
    xpReward: 50,
    metadata: {
      trainingType: 'accuracy',
      primarySkill: '准度',
      level: '大师',
      recordConfig: {
        metrics: ['specialShotAccuracy'],
        scoringMethod: 'percentage',
        targetSuccessRate: 50
      }
    },
    content: {
      duration: 60,
      goal: '克服特殊球形的心理障碍',
      evaluation: '10颗球进5颗为合格',
      sets: 5,
      repsPerSet: 10,
      shotTypes: ['贴库球', '中袋翻袋', '底袋翻袋'],
      keyPoints: ['克服心理压力', '精确瞄准', '力度把控', '杆法运用']
    }
  },
];

console.log('📋 Training Plans Data Structure:');
console.log(`Total plans: ${trainingPlans.length}`);
console.log('\nPlans by dojo:');

const groupedByDojo = trainingPlans.reduce((acc, plan) => {
  if (!acc[plan.trainingId]) {
    acc[plan.trainingId] = [];
  }
  acc[plan.trainingId].push(plan);
  return acc;
}, {} as Record<string, typeof trainingPlans>);

Object.entries(groupedByDojo).forEach(([dojoId, plans]) => {
  console.log(`\n${dojoId}:`);
  plans.forEach((plan, idx) => {
    console.log(`  ${idx + 1}. [${plan.difficulty}] ${plan.title} (${plan.estimatedTimeMinutes}min, ${plan.xpReward}XP)`);
  });
});

console.log('\n✅ Data structure validated!');
console.log('\n💡 Next steps:');
console.log('  1. Create an API endpoint to seed these plans');
console.log('  2. Or manually insert via Supabase dashboard');
console.log('  3. Or use Drizzle Studio for visual insertion\n');

export { trainingPlans };
