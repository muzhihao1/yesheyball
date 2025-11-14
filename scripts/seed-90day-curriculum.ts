/**
 * Seed script for 90-day curriculum data
 * Populates the ninety_day_curriculum table with complete 90-day training course
 *
 * Data sources:
 * - Days 1-30: trainingDaysData from server/seed.ts
 * - Days 31-52: dailyCourses mapping with Ten Core Skills
 * - Days 53-90: Advanced training content (clearance, skills, strategy, comprehensive)
 */

import { db } from "../server/db.js";
import { ninetyDayCurriculum } from "../shared/schema.js";
import { sql as rawSql } from "drizzle-orm";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get tencore skill ID by skill order number (from skills table)
 * Uses raw SQL to avoid schema mismatch issues
 */
async function getTencoreSkillId(skillOrder: number): Promise<string> {
  const result = await db.execute(
    rawSql`SELECT id FROM skills WHERE skill_order = ${skillOrder} LIMIT 1`
  );

  if (!result || result.length === 0) {
    throw new Error(`Skill with order ${skillOrder} not found in skills table. Please ensure skills table has data.`);
  }

  return result[0].id as string;
}

/**
 * Determine primary skill based on content and tencore skill number
 */
function determinePrimarySkill(tencoreSkillNumber: number, title: string): string {
  // Skill-based mapping
  const skillMapping: Record<number, string> = {
    1: 'accuracy',    // 基本功 → 准度
    2: 'power',       // 发力 → 发力
    3: 'accuracy',    // 五分点 → 准度
    4: 'accuracy',    // 准度 → 准度
    5: 'spin',        // 杆法 → 杆法
    6: 'spin',        // 分离角 → 杆法
    7: 'positioning', // 走位 → 走位
    8: 'positioning', // 清蛇彩 → 走位
    9: 'strategy',    // 技能 → 策略
    10: 'strategy'    // 思路 → 策略
  };

  // Special overrides based on title content
  if (title.includes('开球') || title.includes('跳球') || title.includes('发力')) {
    return 'power';
  }
  if (title.includes('翻袋') || title.includes('贴球') || title.includes('瞄准') || title.includes('准度')) {
    return 'accuracy';
  }
  if (title.includes('传球') || title.includes('克拉克') || title.includes('杆法') || title.includes('加塞')) {
    return 'spin';
  }
  if (title.includes('走位') || title.includes('位置')) {
    return 'positioning';
  }

  return skillMapping[tencoreSkillNumber] || 'accuracy';
}

/**
 * Determine scoring method based on primary skill and training type
 */
function determineScoringMethod(primarySkill: string, trainingType: string): {
  scoringMethod: string;
  maxAttempts?: number;
} {
  // Accuracy-related training uses success_rate
  if (primarySkill === 'accuracy') {
    return {
      scoringMethod: 'success_rate',
      maxAttempts: trainingType === '测试' ? 50 : (trainingType === '考核' ? 100 : 30)
    };
  }

  // Test and assessment use success_rate
  if (trainingType === '测试' || trainingType === '考核') {
    return {
      scoringMethod: 'success_rate',
      maxAttempts: trainingType === '考核' ? 100 : 50
    };
  }

  // Others use completion
  return { scoringMethod: 'completion' };
}

// ============================================================================
// Days 1-30: Training Days Data (Basic to Intermediate)
// ============================================================================

const trainingDaysData = [
  { day: 1, title: "握杆", description: "参照教学内容，左手扶杆，右手做钟摆状运动，直到握力掌握", objectives: ["熟练掌握握力为止"], keyPoints: ["手握空拳，掌心贴合球杆", "不要刻意松指或握紧"], estimatedDuration: 30 },
  { day: 2, title: "手架", description: "让每种手架稳定支撑为止", objectives: ["掌握稳定手架技巧"], keyPoints: ["大拇指与食指关节紧紧相贴", "手架'浮'于台面，要便于移动", "身体不能有重量压在手架上"], estimatedDuration: 30 },
  { day: 3, title: "站位与姿势", description: "配合球杆去站位，'以人就杆'熟练分配重心比例为止", objectives: ["掌握正确站位与姿势"], keyPoints: ["重心在右脚占80%，左脚占15%，手架占5%", "移动手架时必须身体重心调整"], estimatedDuration: 35 },
  { day: 4, title: "入位与节奏", description: "确定进球线路，一步入位", objectives: ["空杆与击球交替训练"], keyPoints: ["一步入位", "运杆平顺度"], estimatedDuration: 35 },
  { day: 5, title: "空杆与击球", description: "感受'提水桶'时大臂的发力感觉，空杆训练20组", objectives: ["掌握正确发力方式"], keyPoints: ["平顺度", "注意大臂和手肘的配合练习", "站着时候就瞄准"], estimatedDuration: 30 },
  { day: 6, title: "初级瞄准", description: "空杆练习20次，击球练习20组", objectives: ["掌握瞄准基础技术"], keyPoints: ["中心点：看母球最上方与最下方的连线", "击球时力量无需很大", "出杆要逐渐加速，在击打母球后要送出去", "力量要穿过母球直达目标球上"], estimatedDuration: 40 },
  { day: 7, title: "初级发力平顺度 低杆", description: "低杆练习，稍有角度", objectives: ["空杆训练20次", "击球训练，球摆出一点角度，20次"], keyPoints: ["每杆均匀抹巧粉", "低杆击打位置：母球最底下高约半颗皮头的位置", "回杆慢慢回，逐渐加速推出球杆"], estimatedDuration: 40 },
  { day: 8, title: "利用手肘增加穿透力", description: "低杆练习小臂加手肘低杆应至少拉回一台", objectives: ["空杆慢速训练20次", "熟练后稍稍加快出杆末端的速度训练20次", "小力量击球训练20组，每组10颗"], keyPoints: ["手肘用于衔接小臂摆动力量", "当小臂逐渐快用完力时，小臂继续摆动的同时手肘向前推", "握杆手避免碰胸"], estimatedDuration: 35 },
  { day: 9, title: "初级准备力量", description: "三段力量训练", objectives: ["小臂力量用完(中力)，连续5杆到中袋附近合格", "小臂加手腕连续5杆到中袋和底库中间合格", "小臂加手腕加手肘"], keyPoints: ["三段力量：小臂占总力量60%，手腕(翻腕)占20%，手肘占20%", "小臂中力可以回到中袋附近", "小臂中力加手腕翻动可以回到中袋靠后"], estimatedDuration: 40 },
  { day: 10, title: "中级预力 通过试击锁定力量", description: "中级预力练习：母球停在洞口前方", objectives: ["球杆拉回最后方再完全推出来，母球停在洞口前方，却不能进袋，越近越好", "任意位置将母球推至洞口"], keyPoints: ["试击：更加精确的预力", "趴下后来回运杆进行尝试击打", "眼睛要始终盯着母球要停到的位置"], estimatedDuration: 40 },
  { day: 11, title: "中级预力 低杆力量控制", description: "量值：0的力量中级预力练习：低杆力量控制", objectives: ["将小臂练出3个稳定的力量，5、10、15力量", "然后在小臂各力量等级下，一点点增加手腕的力量"], keyPoints: ["通过试击来控制母球低杆的距离", "试击时，先进行小臂的长试击，再进行手腕力量与方向的短试击", "低杆回中袋：小臂5力量＋手腕0力量"], estimatedDuration: 45 },
  { day: 12, title: "翻腕训练", description: "翻腕训练：高杆吸库(小角度！)", objectives: ["空杆加速训练，感觉小臂拖出来手腕很重，然后加速翻动手腕", "高杆吸库，每组10颗球，练习10组"], keyPoints: ["要感受小臂拖出来时手腕很重的感觉", "由后面三指接触球杆到前面后掌心接触球杆", "要训练手腕翻动的平顺度", "高杆吸库：比中杆高出半颗皮头位置"], estimatedDuration: 35 },
  { day: 13, title: "分段发力1", description: "大臂-小臂-手腕-手肘分段发力训练", objectives: ["掌握分段发力技术", "提升动作协调性"], keyPoints: ["分段发力顺序", "动作连贯", "力量传递"], estimatedDuration: 40 },
  { day: 14, title: "分段发力2", description: "动作平顺度最重要的练习，1-2个月。根据掌握情况定", objectives: ["长台低杆加速训练"], keyPoints: ["进行动作的加速训练", "大臂先缓慢把小臂拖出来，然后小臂加速，手腕加速，由手肘向前推", "动作不需太大也可以低杆一库", "重点在力量衔接平顺度感觉"], estimatedDuration: 45 },
  { day: 15, title: "分段发力 极限低杆", description: "极限低杆点位", objectives: ["小力极限低杆训练10组以上"], keyPoints: ["皮头唤醒器使用方法", "小力极限低杆点位，可以回1台", "拓展课没有其他要求，自行练习"], estimatedDuration: 45 },
  { day: 16, title: "初级瞄准2 直球", description: "5分点直球瞄准训练", objectives: ["掌握5分点瞄准", "直球技术精进"], keyPoints: ["5分点精度", "直球稳定性", "瞄准准确性"], estimatedDuration: 40 },
  { day: 17, title: "初级瞄准3 离边球", description: "离边球训练(直线球偏一颗半球)", objectives: ["左边(右边)偏1.5颗球各练习5组，每组10颗", "偏2颗到3颗球各练50颗", "再到底库练习两侧离边球各50颗"], keyPoints: ["离边球：击打目标球后，母球会向远离库边方向跑", "注意也要考虑'耦合效应'", "假想球瞄准时，要瞄准厚一些"], estimatedDuration: 45 },
  { day: 18, title: "初级瞄准4 角度球", description: "不同角度下的瞄准练习", objectives: ["角度球瞄准技术", "适应不同角度"], keyPoints: ["角度判断", "瞄准调整", "进球路线"], estimatedDuration: 40 },
  { day: 19, title: "初级瞄准 极限薄球", description: "极限薄球-估算假想球体积训练", objectives: ["训练母球中等距离极限薄球", "将母球拿远继续训练", "长台极限薄球训练"], keyPoints: ["只能用假想球瞄准的方式瞄准", "复制出来一个目标球并假象其在目标球后面", "根据母球远近体积的变化，找准复制出假想球的球心"], estimatedDuration: 40 },
  { day: 20, title: "瞄准综合训练", description: "综合运用各种瞄准技巧", objectives: ["综合瞄准技术应用"], keyPoints: ["灵活运用瞄准方法", "适应不同球型"], estimatedDuration: 45 },
  { day: 21, title: "分离角1(90度分离角训练)", description: "低杆小力走位实例", objectives: ["练习不同力量的定杆练习50颗", "练习中杆中力、中低杆中小力、低杆小力各50颗直球定杆"], keyPoints: ["定杆点位(中心偏下一点，克服台尼摩擦力)90°方向分离", "库边特性：入射角=反射角", "定杆：中线点偏下中力"], estimatedDuration: 40 },
  { day: 22, title: "分离角2", description: "分离角与力量配合", objectives: ["分离角控制训练"], keyPoints: ["力量与分离角关系", "杆法影响分离角"], estimatedDuration: 40 },
  { day: 23, title: "分离角3 登杆", description: "直线高登杆(低登杆)练习，母球中心偏上(偏下)一点点位置大力打进目标球后", objectives: ["直线高登杆练习50颗", "直线低登杆练习50颗", "左移半颗球位置K球高登杆练习50颗"], keyPoints: ["登杆：击打母球中心偏上或者偏下一点点的位置", "使用中力击打，可以向前或者向后移动2-3个球的位置", "避免力量过小目标球跑偏"], estimatedDuration: 45 },
  { day: 24, title: "高杆基础", description: "高杆技术系统训练", objectives: ["掌握高杆基础技术"], keyPoints: ["高杆击打位置", "跟随效果", "力量控制"], estimatedDuration: 40 },
  { day: 25, title: "低杆控制", description: "低杆回旋技术训练", objectives: ["掌握低杆控制技术"], keyPoints: ["低杆击打点", "回旋效果", "距离控制"], estimatedDuration: 45 },
  { day: 26, title: "中杆定杆", description: "中杆定杆技术练习", objectives: ["掌握中杆定杆"], keyPoints: ["90度分离", "力量匹配", "稳定性"], estimatedDuration: 40 },
  { day: 27, title: "加塞瞄准2(目标球角度调整)", description: "5分点目标球角度调整训练", objectives: ["掌握加塞目标球角度调整", "练习5分点加塞瞄准", "熟练加塞进球技术"], keyPoints: ["5分点理论：将目标球分为5个瞄准点", "加塞角度补偿：左加塞瞄准偏右，右加塞瞄准偏左", "目标球厚薄调整：根据加塞方向调整击球厚薄"], estimatedDuration: 45 },
  { day: 28, title: "角度球加塞瞄准", description: "不同角度下的加塞命中训练", objectives: ["角度球加塞技术", "复杂角度瞄准", "加塞命中率提升"], keyPoints: ["角度球加塞原理", "复杂角度瞄准技巧", "加塞与角度的配合"], estimatedDuration: 50 },
  { day: 29, title: "加塞走位(顺塞)", description: "顺旋转方向下的母球控制", objectives: ["顺塞走位技术", "母球旋转控制", "走位路线规划"], keyPoints: ["顺塞原理：与母球旋转方向一致", "顺塞走位效果", "旋转与走位的配合"], estimatedDuration: 45 },
  { day: 30, title: "加塞走位(反塞)", description: "反旋转方向下的母球控制", objectives: ["反塞走位技术", "反向旋转控制", "高级走位技巧"], keyPoints: ["反塞原理：与母球旋转方向相反", "反塞走位难度", "高级旋转控制技术"], estimatedDuration: 50 }
];

async function seedDays1to30() {
  console.log("\n📘 Seeding Days 1-30 (Training Days Data)...");

  // Get skill IDs for days 1-30
  const skill1Id = await getTencoreSkillId(1); // 基本功 (Days 1-10)
  const skill2Id = await getTencoreSkillId(2); // 发力 (Days 11-15)
  const skill4Id = await getTencoreSkillId(4); // 准度 (Days 16-22)
  const skill5Id = await getTencoreSkillId(5); // 杆法 (Days 23-30)

  const curriculumData = trainingDaysData.map((dayData) => {
    let tencoreSkillId: string;
    let trainingType: string;
    let difficulty: string;

    // Determine skill and difficulty based on day number
    if (dayData.day <= 10) {
      tencoreSkillId = skill1Id;
      trainingType = '系统';
      difficulty = '初级';
    } else if (dayData.day <= 15) {
      tencoreSkillId = skill2Id;
      trainingType = '系统';
      difficulty = '初级';
    } else if (dayData.day <= 22) {
      tencoreSkillId = skill4Id;
      trainingType = '系统';
      difficulty = '中级';
    } else {
      tencoreSkillId = skill5Id;
      trainingType = '专项';
      difficulty = '中级';
    }

    const primarySkill = determinePrimarySkill(
      dayData.day <= 10 ? 1 : (dayData.day <= 15 ? 2 : (dayData.day <= 22 ? 4 : 5)),
      dayData.title
    );

    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    return {
      dayNumber: dayData.day,
      tencoreSkillId,
      trainingType,
      title: `第${dayData.day}天：${dayData.title}`,
      description: dayData.description,
      originalCourseRef: `耶氏台球学院第${dayData.day}天`,
      objectives: dayData.objectives,
      keyPoints: dayData.keyPoints,
      practiceRequirements: JSON.stringify({
        duration: dayData.estimatedDuration,
        repetitions: 20
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration: dayData.estimatedDuration,
      difficulty,
      orderIndex: dayData.day,
      isActive: true
    };
  });

  await db.insert(ninetyDayCurriculum).values(curriculumData);
  console.log(`✅ Inserted ${curriculumData.length} days (1-30)`);
}

// ============================================================================
// Days 31-52: Daily Courses Mapping (Intermediate to Advanced)
// ============================================================================

/**
 * Import daily courses data
 * Note: We'll selectively use and adapt content from dailyCourses
 */
import { DAILY_COURSES } from "../server/dailyCourses.js";

async function seedDays31to52() {
  console.log("\n📗 Seeding Days 31-52 (Daily Courses Mapping)...");

  // Get skill IDs for days 31-52
  const skill3Id = await getTencoreSkillId(3); // 高效五分点 (Days 31-37)
  const skill6Id = await getTencoreSkillId(6); // 分离角 (Days 38-44)
  const skill7Id = await getTencoreSkillId(7); // 走位 (Days 45-52)

  const curriculumData = [];

  // Days 31-37: Skill 3 - 高效五分点 (Efficient Five-Point Training)
  // Focus: Precision aiming and scoring in key positions
  for (let day = 31; day <= 37; day++) {
    const courseData = DAILY_COURSES.find(c => c.day === day);
    const tencoreSkillId = skill3Id;
    const trainingType = '专项';
    const difficulty = day <= 33 ? '中级' : '高级';

    // Adapt course content to focus on five-point training
    let title = courseData?.title || `第${day}天：五分点训练${day - 30}`;
    let description = courseData?.description || "高效五分点精准训练";
    let objectives = ["掌握五分点瞄准技术", "提高进球精准度", "完善位置控制"];
    let keyPoints = ["五分点位置识别", "瞄准线调整", "进球稳定性"];
    let estimatedDuration = 45;

    // Special adaptations based on original course content
    if (day === 31 && courseData?.title.includes('加塞')) {
      title = `第${day}天：五分点加塞瞄准`;
      description = "结合加塞技术进行五分点瞄准训练，提高复杂球型的进球率";
      objectives = ["掌握五分点加塞瞄准", "理解加塞对瞄准的影响", "提高加塞进球精度"];
      keyPoints = ["五分点理论应用", "加塞角度补偿", "瞄准线修正"];
    } else if (day >= 34 && day <= 37 && courseData?.category === '实战训练') {
      title = `第${day}天：五分点实战应用${day - 33}`;
      description = "在实战清台中运用五分点技术，提高实战能力";
      objectives = ["五分点实战运用", "清台思路优化", "进球成功率提升"];
      keyPoints = ["实战中的五分点判断", "球型分析", "线路规划"];
      estimatedDuration = 50;
    }

    const primarySkill = 'accuracy';
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title,
      description,
      originalCourseRef: courseData ? `王孟52集第${day}集` : '五分点专项训练',
      objectives,
      keyPoints,
      practiceRequirements: JSON.stringify({
        duration: estimatedDuration,
        repetitions: 30
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  // Days 38-44: Skill 6 - 分离角 (Separation Angle)
  // Focus: Understanding and controlling ball separation angles
  for (let day = 38; day <= 44; day++) {
    const courseData = DAILY_COURSES.find(c => c.day === day);
    const tencoreSkillId = skill6Id;
    let trainingType = day >= 42 ? '理论' : '专项';
    const difficulty = day <= 40 ? '中级' : '高级';

    let title = courseData?.title || `第${day}天：分离角训练${day - 37}`;
    let description = courseData?.description || "分离角控制与应用训练";
    let objectives = ["掌握分离角原理", "控制母球走位", "优化击球效果"];
    let keyPoints = ["分离角计算", "力量与角度配合", "走位精度"];
    let estimatedDuration = 45;

    // Adapt based on original course content
    if (day >= 38 && day <= 40 && courseData?.category === '实战训练') {
      title = `第${day}天：分离角实战训练${day - 37}`;
      description = "在实战中应用分离角技术，提高走位准确性";
      objectives = ["分离角实战应用", "走位路线优化", "击球精度提升"];
      keyPoints = ["实战分离角判断", "力量控制", "旋转影响分析"];
      estimatedDuration = 50;
    } else if (day === 41 && courseData?.title.includes('弧线')) {
      title = `第${day}天：弧线球与分离角`;
      description = "学习弧线球技术，理解特殊分离角控制";
      objectives = ["掌握弧线球技术", "理解特殊分离角", "提高球路控制"];
      keyPoints = ["弧线球原理", "加塞与分离角", "特殊球型处理"];
    } else if (day === 42 && courseData?.title.includes('分离角原理')) {
      title = `第${day}天：分离角物理原理`;
      description = "深入理解分离角的物理原理和影响因素";
      objectives = ["掌握分离角理论", "理解影响因素", "提升技术认知"];
      keyPoints = ["物理原理", "四大影响因素", "理论应用"];
      trainingType = '理论';
    } else if (day === 43 && courseData?.title.includes('清台思路')) {
      title = `第${day}天：分离角与清台思路`;
      description = "结合分离角理论，优化清台思路和策略";
      objectives = ["清台思路优化", "分离角应用", "策略规划"];
      keyPoints = ["分离角与走位", "清台路线", "策略思维"];
    } else if (day === 44 && courseData?.category === '日常训练') {
      title = `第${day}天：分离角日常训练`;
      description = "通过日常训练强化分离角控制能力";
      objectives = ["强化分离角控制", "肌肉记忆建立", "技术巩固"];
      keyPoints = ["日常训练方法", "分离角练习", "技术稳定性"];
    }

    const primarySkill = determinePrimarySkill(6, title);
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title,
      description,
      originalCourseRef: courseData ? `王孟52集第${day}集` : '分离角专项训练',
      objectives,
      keyPoints,
      practiceRequirements: JSON.stringify({
        duration: estimatedDuration,
        repetitions: trainingType === '理论' ? 10 : 25
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  // Days 45-52: Skill 7 - 走位 (Positioning)
  // Focus: Mastering cue ball positioning and control
  for (let day = 45; day <= 52; day++) {
    const courseData = DAILY_COURSES.find(c => c.day === day);
    const tencoreSkillId = skill7Id;
    const trainingType = day >= 50 ? '系统' : '专项';
    let difficulty = day <= 47 ? '中级' : '高级';

    let title = courseData?.title || `第${day}天：走位训练${day - 44}`;
    let description = courseData?.description || "母球走位控制与优化训练";
    let objectives = ["掌握走位技术", "提高位置精度", "优化球路控制"];
    let keyPoints = ["走位路线规划", "力量与旋转配合", "位置精准度"];
    let estimatedDuration = 45;

    // Adapt based on original course content
    if (day >= 45 && day <= 49 && courseData?.category === '日常训练') {
      title = `第${day}天：走位基础训练${day - 44}`;
      description = "通过系统训练建立稳定的走位能力和肌肉记忆";
      objectives = ["建立走位基础", "肌肉记忆训练", "技术稳定性"];
      keyPoints = ["基础走位模式", "重复训练", "动作规范性"];
      estimatedDuration = 40;
    } else if (day >= 50 && day <= 51 && courseData?.category === '节奏训练') {
      title = `第${day}天：走位节奏控制${day - 49}`;
      description = "掌握走位击球的节奏，提高整体击球质量";
      objectives = ["掌握走位节奏", "提高击球流畅度", "节奏与走位结合"];
      keyPoints = ["节奏控制", "流畅性训练", "整体协调"];
    } else if (day === 52 && courseData?.category === '综合运用') {
      title = `第${day}天：走位综合运用`;
      description = "综合运用所学走位技术，达到技术整合和提升";
      objectives = ["走位技术整合", "综合能力提升", "实战应用"];
      keyPoints = ["技术综合运用", "实战能力", "整体水平提升"];
      estimatedDuration = 60;
      difficulty = '高级';
    }

    const primarySkill = 'positioning';
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title,
      description,
      originalCourseRef: courseData ? `王孟52集第${day}集` : '走位专项训练',
      objectives,
      keyPoints,
      practiceRequirements: JSON.stringify({
        duration: estimatedDuration,
        repetitions: day === 52 ? 10 : 20
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  await db.insert(ninetyDayCurriculum).values(curriculumData);
  console.log(`✅ Inserted ${curriculumData.length} days (31-52)`);
}

// ============================================================================
// CLI Parameter Parsing
// ============================================================================

interface SeedOptions {
  part?: number;  // 1 (Days 1-30), 2 (Days 31-52), 3 (Days 53-90)
  clean?: boolean; // Clean before seeding (default: true)
  help?: boolean;
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    clean: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--part' && i + 1 < args.length) {
      const part = parseInt(args[i + 1]);
      if (part >= 1 && part <= 3) {
        options.part = part;
      } else {
        console.error('❌ Invalid --part value. Must be 1, 2, or 3');
        process.exit(1);
      }
      i++;
    } else if (arg === '--no-clean') {
      options.clean = false;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎱 90-Day Curriculum Seed Script

Usage: node --env-file=.env --import tsx scripts/seed-90day-curriculum.ts [options]

Options:
  --part <1|2|3>    Run specific part only:
                    1 = Days 1-30 (Basic Training)
                    2 = Days 31-52 (Intermediate Training)
                    3 = Days 53-90 (Advanced Training)
  --no-clean        Don't clean existing data before seeding
  --help, -h        Show this help message

Examples:
  # Seed all 90 days (default)
  node --env-file=.env --import tsx scripts/seed-90day-curriculum.ts

  # Seed only Days 1-30
  node --env-file=.env --import tsx scripts/seed-90day-curriculum.ts --part 1

  # Seed Days 31-52 without cleaning
  node --env-file=.env --import tsx scripts/seed-90day-curriculum.ts --part 2 --no-clean
`);
}

/**
 * Clean specific day range from curriculum
 */
async function cleanDaysRange(startDay: number, endDay: number) {
  const { and, gte, lte } = await import('drizzle-orm');
  await db.delete(ninetyDayCurriculum).where(
    and(
      gte(ninetyDayCurriculum.dayNumber, startDay),
      lte(ninetyDayCurriculum.dayNumber, endDay)
    )
  );
  console.log(`🗑️  Cleaned Days ${startDay}-${endDay}`);
}

// ============================================================================
// Main Seed Function
// ============================================================================

// ============================================================================
// Days 53-90: Advanced Training (Clearance, Skills, Strategy, Assessment)
// ============================================================================

async function seedDays53to90() {
  console.log("\n📙 Seeding Days 53-90 (Advanced Training & Assessment)...");

  // Get skill IDs for days 53-90
  const skill8Id = await getTencoreSkillId(8); // 轻松清蛇彩 (Days 53-62)
  const skill9Id = await getTencoreSkillId(9); // 技能 (Days 63-72)
  const skill10Id = await getTencoreSkillId(10); // 思路 (Days 73-82)

  const curriculumData = [];

  // Days 53-62: Skill 8 - 轻松清蛇彩 (Clearance & Snooker)
  // Focus: Clearance strategies and color ball control
  const clearanceTopics = [
    { title: "基础蛇彩规则与练习", desc: "学习斯诺克彩球规则，掌握基本清台流程", objectives: ["理解蛇彩规则", "掌握基础清台", "建立清台思路"], keyPoints: ["彩球顺序", "走位规划", "得分策略"] },
    { title: "红球清理技巧", desc: "掌握红球阶段的清理技巧和走位策略", objectives: ["红球清理效率", "走位优化", "得分最大化"], keyPoints: ["红球选择", "走位路线", "防守意识"] },
    { title: "彩球阶段走位", desc: "练习彩球阶段的精确走位和控制", objectives: ["彩球走位精度", "位置控制", "连续得分"], keyPoints: ["彩球走位", "力量控制", "角度把握"] },
    { title: "清台连续性训练", desc: "培养连续清台能力，提高一杆制胜率", objectives: ["连续清台能力", "节奏把握", "稳定性提升"], keyPoints: ["连续性", "节奏控制", "心理素质"] },
    { title: "复杂球型清台", desc: "处理复杂球型的清台策略", objectives: ["复杂球型分析", "策略制定", "执行能力"], keyPoints: ["球型判断", "线路规划", "风险评估"] },
    { title: "清台实战演练1", desc: "实战清台综合演练，提高实战能力", objectives: ["实战清台", "应变能力", "稳定发挥"], keyPoints: ["实战经验", "应变处理", "心态调整"] },
    { title: "清台实战演练2", desc: "进阶清台实战，挑战高难度球局", objectives: ["高难度清台", "技术应用", "能力提升"], keyPoints: ["难度挑战", "技术整合", "突破瓶颈"] },
    { title: "清台速度训练", desc: "提高清台速度，优化击球效率", objectives: ["清台速度", "效率提升", "流畅性"], keyPoints: ["速度控制", "效率优化", "流畅击球"] },
    { title: "清台稳定性强化", desc: "强化清台稳定性，减少失误", objectives: ["稳定性提升", "失误减少", "成功率提高"], keyPoints: ["稳定发挥", "失误控制", "成功率"] },
    { title: "清台综合考核", desc: "清台能力综合考核与评估", objectives: ["能力评估", "水平检验", "进步确认"], keyPoints: ["综合考核", "能力测试", "水平评定"] }
  ];

  for (let i = 0; i < clearanceTopics.length; i++) {
    const day = 53 + i;
    const topic = clearanceTopics[i];
    const tencoreSkillId = skill8Id;
    const trainingType = day >= 61 ? '测试' : '实战';
    const difficulty = day <= 56 ? '中级' : '高级';

    const primarySkill = 'positioning';
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title: `第${day}天：${topic.title}`,
      description: topic.desc,
      originalCourseRef: '十大招-轻松清蛇彩',
      objectives: topic.objectives,
      keyPoints: topic.keyPoints,
      practiceRequirements: JSON.stringify({
        duration: day >= 61 ? 60 : 50,
        repetitions: trainingType === '测试' ? 5 : 15
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration: day >= 61 ? 60 : 50,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  // Days 63-72: Skill 9 - 技能 (Advanced Skills)
  // Focus: Special techniques and advanced skills
  const skillTopics = [
    { title: "开球技术训练", desc: "掌握开球技术，提高开局优势", objectives: ["开球技术", "母球控制", "开局优势"], keyPoints: ["开球力量", "母球走位", "球堆分散"], primarySkill: 'power' },
    { title: "跳球技术基础", desc: "学习跳球技术，应对障碍球", objectives: ["跳球技术", "角度控制", "力量掌握"], keyPoints: ["跳球原理", "杆角控制", "力量调节"], primarySkill: 'power' },
    { title: "翻袋技术训练", desc: "掌握翻袋技术，提高进球率", objectives: ["翻袋技术", "角度判断", "精准控制"], keyPoints: ["翻袋原理", "角度计算", "力量配合"], primarySkill: 'accuracy' },
    { title: "架杆技术练习", desc: "多种架杆方式的灵活运用", objectives: ["架杆技巧", "稳定支撑", "灵活应用"], keyPoints: ["多种架杆", "稳定性", "实战应用"], primarySkill: 'accuracy' },
    { title: "解球技术训练", desc: "学习解球技术，处理斯诺克局面", objectives: ["解球技巧", "安全解球", "反击机会"], keyPoints: ["解球思路", "技术选择", "风险控制"], primarySkill: 'spin' },
    { title: "传球技术练习", desc: "掌握传球技术，创造进攻机会", objectives: ["传球技术", "力量控制", "精准传递"], keyPoints: ["传球原理", "力量调节", "角度把握"], primarySkill: 'spin' },
    { title: "借下技术训练", desc: "学习借下技术，提高走位灵活性", objectives: ["借下技术", "反弹控制", "走位优化"], keyPoints: ["借下原理", "反弹角度", "力量配合"], primarySkill: 'positioning' },
    { title: "克拉克技术", desc: "掌握克拉克击球技术", objectives: ["克拉克技术", "特殊击球", "技术应用"], keyPoints: ["克拉克原理", "技术要领", "实战运用"], primarySkill: 'spin' },
    { title: "贴球处理训练", desc: "学习贴球处理技巧", objectives: ["贴球技巧", "击球方式", "球路控制"], keyPoints: ["贴球处理", "击球角度", "力量运用"], primarySkill: 'accuracy' },
    { title: "技能综合测试", desc: "综合技能测试与评估", objectives: ["技能测试", "能力评估", "水平检验"], keyPoints: ["综合技能", "测试评估", "能力确认"], primarySkill: 'strategy' }
  ];

  for (let i = 0; i < skillTopics.length; i++) {
    const day = 63 + i;
    const topic = skillTopics[i];
    const tencoreSkillId = skill9Id;
    const trainingType = day === 72 ? '测试' : '专项';
    const difficulty = day <= 66 ? '中级' : '高级';

    const primarySkill = topic.primarySkill;
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title: `第${day}天：${topic.title}`,
      description: topic.desc,
      originalCourseRef: '十大招-技能',
      objectives: topic.objectives,
      keyPoints: topic.keyPoints,
      practiceRequirements: JSON.stringify({
        duration: day === 72 ? 60 : 45,
        repetitions: trainingType === '测试' ? 5 : 20
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration: day === 72 ? 60 : 45,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  // Days 73-82: Skill 10 - 思路 (Strategy & Tactics)
  // Focus: Strategic thinking and tactical planning
  const strategyTopics = [
    { title: "进攻思路基础", desc: "建立系统的进攻思路和策略", objectives: ["进攻思路", "策略制定", "机会把握"], keyPoints: ["进攻时机", "球型判断", "策略选择"] },
    { title: "防守思路训练", desc: "掌握防守策略和安全球技巧", objectives: ["防守思路", "安全球", "局面控制"], keyPoints: ["防守时机", "安全球选择", "局面控制"] },
    { title: "球局分析能力", desc: "培养球局分析和判断能力", objectives: ["球局分析", "形势判断", "决策能力"], keyPoints: ["局面分析", "形势判断", "决策制定"] },
    { title: "清台路线规划", desc: "学习清台路线的规划和优化", objectives: ["路线规划", "顺序优化", "效率提升"], keyPoints: ["路线设计", "顺序安排", "效率最优"] },
    { title: "战术运用训练", desc: "实战中的战术运用和调整", objectives: ["战术运用", "灵活应变", "策略调整"], keyPoints: ["战术选择", "应变能力", "策略调整"] },
    { title: "心态调整技巧", desc: "培养良好的比赛心态和抗压能力", objectives: ["心态管理", "抗压能力", "稳定发挥"], keyPoints: ["心态调节", "压力应对", "情绪控制"] },
    { title: "实战策略应用1", desc: "实战中综合运用各种策略", objectives: ["策略应用", "实战经验", "综合能力"], keyPoints: ["策略运用", "实战演练", "能力整合"] },
    { title: "实战策略应用2", desc: "高级实战策略和技巧", objectives: ["高级策略", "技巧运用", "水平提升"], keyPoints: ["高级技巧", "策略精进", "能力突破"] },
    { title: "比赛思维培养", desc: "培养正确的比赛思维和竞技意识", objectives: ["比赛思维", "竞技意识", "心理素质"], keyPoints: ["思维方式", "竞技心态", "心理准备"] },
    { title: "策略综合测试", desc: "策略思路综合测试与评估", objectives: ["策略测试", "思路评估", "能力验证"], keyPoints: ["综合测试", "能力评估", "水平认证"] }
  ];

  for (let i = 0; i < strategyTopics.length; i++) {
    const day = 73 + i;
    const topic = strategyTopics[i];
    const tencoreSkillId = skill10Id;
    const trainingType = day === 82 ? '测试' : (day >= 79 ? '实战' : '系统');
    const difficulty = day <= 76 ? '中级' : '高级';

    const primarySkill = 'strategy';
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title: `第${day}天：${topic.title}`,
      description: topic.desc,
      originalCourseRef: '十大招-思路',
      objectives: topic.objectives,
      keyPoints: topic.keyPoints,
      practiceRequirements: JSON.stringify({
        duration: day === 82 ? 60 : 45,
        repetitions: trainingType === '测试' ? 5 : (trainingType === '实战' ? 10 : 15)
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration: day === 82 ? 60 : 45,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  // Days 83-90: Comprehensive Training & Final Assessment
  // Focus: Integration and comprehensive evaluation
  const comprehensiveTopics = [
    { title: "十大招综合复习1", desc: "系统复习十大招核心技术", objectives: ["技术复习", "知识巩固", "体系完善"], skill: 1 },
    { title: "十大招综合复习2", desc: "深化理解十大招技术要领", objectives: ["深化理解", "技术精进", "能力提升"], skill: 2 },
    { title: "五维能力综合训练1", desc: "全面训练准度、杆法、走位、发力、策略", objectives: ["五维训练", "全面提升", "能力平衡"], skill: 3 },
    { title: "五维能力综合训练2", desc: "强化五维能力，追求均衡发展", objectives: ["能力强化", "均衡发展", "综合提升"], skill: 4 },
    { title: "实战模拟训练1", desc: "模拟实战对抗，检验训练成果", objectives: ["实战模拟", "能力检验", "经验积累"], skill: 5 },
    { title: "实战模拟训练2", desc: "高强度实战模拟，提升竞技水平", objectives: ["高强度训练", "竞技提升", "水平突破"], skill: 6 },
    { title: "90天挑战总结", desc: "回顾90天训练历程，总结经验教训", objectives: ["训练总结", "经验梳理", "进步确认"], skill: 10 },
    { title: "90天终极考核", desc: "全面考核90天训练成果和能力水平", objectives: ["全面考核", "能力评估", "水平认证"], skill: 10 }
  ];

  for (let i = 0; i < comprehensiveTopics.length; i++) {
    const day = 83 + i;
    const topic = comprehensiveTopics[i];
    const tencoreSkillId = await getTencoreSkillId(topic.skill);
    const trainingType = day >= 89 ? '考核' : (day >= 85 ? '实战' : '系统');
    const difficulty = '高级';

    const primarySkill = day >= 89 ? 'strategy' : (day >= 85 ? 'positioning' : 'accuracy');
    const { scoringMethod, maxAttempts } = determineScoringMethod(primarySkill, trainingType);

    curriculumData.push({
      dayNumber: day,
      tencoreSkillId,
      trainingType,
      title: `第${day}天：${topic.title}`,
      description: topic.desc,
      originalCourseRef: '90天挑战-综合训练',
      objectives: topic.objectives,
      keyPoints: ['技术综合', '能力整合', '水平提升'],
      practiceRequirements: JSON.stringify({
        duration: day >= 89 ? 90 : 60,
        repetitions: trainingType === '考核' ? 3 : (trainingType === '实战' ? 5 : 10)
      }),
      primarySkill,
      scoringMethod,
      maxAttempts,
      estimatedDuration: day >= 89 ? 90 : 60,
      difficulty,
      orderIndex: day,
      isActive: true
    });
  }

  await db.insert(ninetyDayCurriculum).values(curriculumData);
  console.log(`✅ Inserted ${curriculumData.length} days (53-90)`);
}

async function seed90DayCurriculum() {
  const options = parseArgs();

  // Show help if requested
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log("🎱 Starting to seed 90-day curriculum data...\n");

  try {
    // Determine which parts to run
    const partsToRun = options.part ? [options.part] : [1, 2, 3];

    console.log(`📋 Configuration:`);
    console.log(`   Parts to run: ${partsToRun.join(', ')}`);
    console.log(`   Clean before seed: ${options.clean ? 'Yes' : 'No'}\n`);

    // Clean data based on options
    if (options.clean) {
      if (partsToRun.length === 3) {
        console.log("🗑️  Cleaning all existing curriculum data...");
        await db.delete(ninetyDayCurriculum);
      } else {
        for (const part of partsToRun) {
          if (part === 1) await cleanDaysRange(1, 30);
          if (part === 2) await cleanDaysRange(31, 52);
          if (part === 3) await cleanDaysRange(53, 90);
        }
      }
    }

    // Seed specified parts
    let totalDaysSeeded = 0;

    for (const part of partsToRun) {
      if (part === 1) {
        await seedDays1to30();
        totalDaysSeeded += 30;
      }
      if (part === 2) {
        await seedDays31to52();
        totalDaysSeeded += 22;
      }
      if (part === 3) {
        await seedDays53to90();
        totalDaysSeeded += 38;
      }
    }

    console.log("\n🎉 90-day curriculum seeding completed!");
    console.log(`📊 Total days seeded: ${totalDaysSeeded} / 90`);
    console.log("\n✨ Training days have been successfully populated!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding 90-day curriculum:", error);
    process.exit(1);
  }
}

// Run the seed function
seed90DayCurriculum();
