import { db } from "./db.js";
import { users, tasks, trainingPrograms, trainingDays, achievements } from "../shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Create default user
  const [defaultUser] = await db
    .insert(users)
    .values({
      id: "seed-user",
      username: "liangqi",
      level: 1,
      exp: 0,
      streak: 0,
      totalDays: 0,
      completedTasks: 0,
      totalTime: 0,
      achievements: []
    })
    .returning()
    .catch(() => {
      console.log("User already exists, skipping...");
      return [null];
    });

  if (defaultUser) {
    console.log("Created default user:", defaultUser.username);
  }

  // Create training tasks
  const defaultTasks = [
    {
      title: "出杆节奏训练",
      description: "专注练习稳定的出杆节奏，提高击球的一致性和准确度。重点掌握出杆前的停顿和发力时机。",
      level: 2,
      difficulty: "中级",
      category: "基本功训练"
    },
    {
      title: "瞄准线练习", 
      description: "通过反复练习来强化瞄准线的判断能力，提升击球精度。练习不同角度和距离的瞄准。",
      level: 3,
      difficulty: "中级",
      category: "瞄准技巧"
    },
    {
      title: "白球控制专项",
      description: "专门训练白球的走位控制，包括停球、跟进和拉杆等技术的综合应用。",
      level: 4,
      difficulty: "高级",
      category: "走位控制"
    },
    {
      title: "杆法综合训练",
      description: "综合练习高杆、低杆、侧旋等各种杆法，提升技术的全面性和实战应用能力。",
      level: 5,
      difficulty: "高级", 
      category: "杆法技巧"
    },
    {
      title: "球感培养专项",
      description: "通过专门的练习来培养和提升球感，增强对球的感知和控制能力。",
      level: 3,
      difficulty: "中级",
      category: "球感训练"
    },
    {
      title: "心理素质训练",
      description: "在练习中注重心理素质的培养，提高比赛中的心理稳定性和抗压能力。",
      level: 4,
      difficulty: "高级",
      category: "心理训练"
    }
  ];

  await db.insert(tasks).values(defaultTasks).onConflictDoNothing();
  console.log("Created training tasks");

  // Create training program
  const [beginnerProgram] = await db
    .insert(trainingPrograms)
    .values({
      name: "耶氏台球学院系统教学",
      description: "为期30集的系统化台球基础训练计划，从握杆、站位到实战清台的全面指导",
      totalDays: 30,
      currentDay: 1,
      difficulty: "新手"
    })
    .returning()
    .onConflictDoNothing();

  if (beginnerProgram) {
    console.log("Created training program:", beginnerProgram.name);

    // Create training days
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
      { day: 20, title: "中级瞄准 锁定进球点与发力", description: "锁定注意力、动作方向、动作力量训练进球点优化", objectives: ["看着目标球进球线路，感知母球位置缺不看母球", "锁定后击球训练练习50颗", "在建立了前面两种锁定后，再练习打穿'透明'目标球练习"], keyPoints: ["注意力的锁定-进球线路", "动作的锁定-试击", "锁定注意力：看着进球线路，站在进球线的正后方趴下"], estimatedDuration: 45 },
      { day: 21, title: "分离角1(90度分离角训练)", description: "低杆小力走位实例", objectives: ["练习不同力量的定杆练习50颗", "练习中杆中力、中低杆中小力、低杆小力各50颗直球定杆"], keyPoints: ["定杆点位(中心偏下一点，克服台尼摩擦力)90°方向分离", "库边特性：入射角=反射角", "定杆：中线点偏下中力"], estimatedDuration: 40 },
      { day: 22, title: "分离角2(三种力量配合不同击球点位训练)", description: "定杆点位90°K球前移2-3颗球位K球后移2-3颗球位", objectives: ["中杆中力，沿切线90°K球50颗", "将K球向前拿2-3颗球位置，击打母球中心点向上半颗皮头", "将K球向后拿2-3颗球位置，击打母球中心点偏下半颗皮头"], keyPoints: ["中力击打母球中心点偏下一点点，母球会沿着目标球切线的90°方向走", "中力击打母球上半部分，母球会沿着目标球切线的前方走", "中力击打母球下半部分，母球会沿着目标球切线的后方走"], estimatedDuration: 45 },
      { day: 23, title: "分离角3 登杆", description: "直线高登杆(低登杆)练习，母球中心偏上(偏下)一点点位置大力打进目标球后", objectives: ["直线高登杆练习50颗", "直线低登杆练习50颗", "左移半颗球位置K球高登杆练习50颗"], keyPoints: ["登杆：击打母球中心偏上或者偏下一点点的位置", "使用中力击打，可以向前或者向后移动2-3个球的位置", "避免力量过小目标球跑偏"], estimatedDuration: 45 },
      { day: 24, title: "走位训练1不吃库走位", description: "低杆(高杆)不吃库走位训练", objectives: ["中袋3颗低杆不吃库走位练习，连续成功10次", "中袋3颗推杆不吃库走位练习，连续成功10次"], keyPoints: ["走位的目的：就是要打完第一颗球后，将母球走向更方便击打第二颗球的位置", "分力越大，高低杆法效果越差，不便于走位", "最便于走位的角度是母球与目标球15°"], estimatedDuration: 45 },
      { day: 25, title: "走位训练2一库走位及拓展", description: "底库附近3颗吃一库走位练习", objectives: ["底库附近3颗吃一库走位练习，连续成功10组", "拓展训练，置球点循环叫位，利用低杆、高杆、定杆循环练习"], keyPoints: ["母球下一颗球要停在哪里", "进球后90°切线线路在哪里，弹库后线路是否是需要的线路", "考虑击打母球使用多少力量，可以完成吃一库后到该停的位置停下"], estimatedDuration: 50 },
      { day: 26, title: "加塞瞄准1(身体与球杆夹角)", description: "加塞瞄准需要调整的2个因素：身体与球杆夹角、目标球角度", objectives: ["掌握加塞技术基础", "理解身体与球杆夹角调整", "练习基础加塞瞄准"], keyPoints: ["加塞瞄准原理：击打母球偏左或偏右位置", "身体角度调整：加塞时需要调整身体与球杆的角度", "瞄准补偿：加塞会改变进球角度，需要进行瞄准补偿"], estimatedDuration: 50 },
      { day: 27, title: "加塞瞄准2(目标球角度调整)", description: "5分点目标球角度调整训练", objectives: ["掌握加塞目标球角度调整", "练习5分点加塞瞄准", "熟练加塞进球技术"], keyPoints: ["5分点理论：将目标球分为5个瞄准点", "加塞角度补偿：左加塞瞄准偏右，右加塞瞄准偏左", "目标球厚薄调整：根据加塞方向调整击球厚薄"], estimatedDuration: 45 },
      { day: 28, title: "角度球加塞瞄准", description: "不同角度下的加塞命中训练", objectives: ["角度球加塞技术", "复杂角度瞄准", "加塞命中率提升"], keyPoints: ["角度球加塞原理", "复杂角度瞄准技巧", "加塞与角度的配合"], estimatedDuration: 50 },
      { day: 29, title: "加塞走位(顺塞)", description: "顺旋转方向下的母球控制", objectives: ["顺塞走位技术", "母球旋转控制", "走位路线规划"], keyPoints: ["顺塞原理：与母球旋转方向一致", "顺塞走位效果", "旋转与走位的配合"], estimatedDuration: 45 },
      { day: 30, title: "加塞走位(反塞)", description: "反旋转方向下的母球控制", objectives: ["反塞走位技术", "反向旋转控制", "高级走位技巧"], keyPoints: ["反塞原理：与母球旋转方向相反", "反塞走位难度", "高级旋转控制技术"], estimatedDuration: 50 }
    ];

    const trainingDaysToInsert = trainingDaysData.map(dayData => ({
      programId: beginnerProgram.id,
      day: dayData.day,
      title: dayData.title,
      description: dayData.description,
      objectives: dayData.objectives,
      keyPoints: dayData.keyPoints,
      estimatedDuration: dayData.estimatedDuration
    }));

    await db.insert(trainingDays).values(trainingDaysToInsert).onConflictDoNothing();
    console.log("Created training days for program");
  }

  // Create achievements
  const defaultAchievements = [
    {
      name: "新手上路",
      description: "完成第一次训练",
      icon: "🎱",
      type: "training",
      condition: { type: "complete_sessions", target: 1 },
      expReward: 100,
      category: "beginner",
      unlocked: true
    },
    {
      name: "坚持不懈",
      description: "连续训练3天",
      icon: "🔥",
      type: "streak",
      condition: { type: "daily_streak", target: 3 },
      expReward: 200,
      category: "beginner",
      unlocked: true
    },
    {
      name: "进步神速",
      description: "完成10次训练",
      icon: "⚡",
      type: "training",
      condition: { type: "complete_sessions", target: 10 },
      expReward: 300,
      category: "intermediate",
      unlocked: false
    },
    {
      name: "专注训练",
      description: "单次训练时长超过60分钟",
      icon: "⏰",
      type: "time",
      condition: { type: "session_duration", target: 60 },
      expReward: 250,
      category: "intermediate",
      unlocked: true
    },
    {
      name: "品质追求",
      description: "获得5次5星评价",
      icon: "⭐",
      type: "rating",
      condition: { type: "high_rating", target: 5, count: 5 },
      expReward: 400,
      category: "intermediate",
      unlocked: true
    },
    {
      name: "台球达人",
      description: "累计训练时间超过30小时",
      icon: "🎯",
      type: "time",
      condition: { type: "total_time", target: 1800 },
      expReward: 500,
      category: "advanced",
      unlocked: true
    },
    {
      name: "持之以恒",
      description: "连续训练14天",
      icon: "📅",
      type: "streak",
      condition: { type: "daily_streak", target: 14 },
      expReward: 600,
      category: "advanced",
      unlocked: true
    },
    {
      name: "技艺精湛",
      description: "完成30次训练",
      icon: "🏆",
      type: "training",
      condition: { type: "complete_sessions", target: 30 },
      expReward: 800,
      category: "master",
      unlocked: false
    }
  ];

  await db.insert(achievements).values(defaultAchievements).onConflictDoNothing();
  console.log("Created achievements");

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(console.error);
