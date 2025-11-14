/**
 * 专项训练计划种子数据
 * 为 8 个专项训练类别创建详细的训练计划
 */

import "dotenv/config";
import { db } from "../server/db.js";
import { specializedTrainingPlansV3 } from "../shared/schema.js";

console.log("🎯 开始导入专项训练计划数据...\n");

const trainingPlans = [
  // ============================================================================
  // 1. 基本功道场 (st_basic) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_basic_1',
    trainingId: 'st_basic',
    title: '站位与重心控制基础',
    description: '掌握正确的站位姿势，建立稳定的重心控制能力',
    difficulty: 'easy',
    estimatedTimeMinutes: 15,
    xpReward: 15,
    content: {
      objectives: ['建立正确的站位姿势', '理解重心分配原理', '培养身体稳定性'],
      steps: [
        '双脚分开与肩同宽，左脚前右脚后（右手握杆）',
        '重心分配：前脚60%，后脚40%',
        '膝盖微曲，保持身体平衡',
        '上身前倾约45度角',
        '练习保持姿势30秒不晃动'
      ],
      successCriteria: [
        '能稳定保持站位30秒以上',
        '重心不前倾或后仰',
        '膝盖保持自然弯曲'
      ],
      commonMistakes: [
        '站位过宽或过窄，影响稳定性',
        '重心过于前倾，导致失衡',
        '膝盖僵直，缺乏缓冲'
      ],
      tips: '可以在镜子前练习，观察自己的姿势是否标准'
    },
    isActive: true
  },
  {
    id: 'plan_basic_2',
    trainingId: 'st_basic',
    title: '手架稳定性训练',
    description: '建立稳固的手架基础，提升击球稳定性',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['掌握标准开放式手架', '提升手架稳定性', '适应不同距离的手架'],
      steps: [
        '手掌平铺台面，五指分开',
        '拇指与食指形成V型凹槽',
        '其余三指支撑手掌，保持稳定',
        '练习不同距离的手架（10-30cm）',
        '在手架上放置球杆，保持30秒不晃动'
      ],
      successCriteria: [
        '手架能稳定支撑球杆',
        'V型凹槽大小适中，不夹杆',
        '能快速调整不同距离的手架'
      ],
      commonMistakes: [
        '手指过于僵硬，缺乏柔韧性',
        'V型凹槽过紧或过松',
        '手腕抬起，导致手架不稳'
      ],
      tips: '每天练习100次手架搭建，培养肌肉记忆'
    },
    isActive: true
  },
  {
    id: 'plan_basic_3',
    trainingId: 'st_basic',
    title: '出杆直线性训练',
    description: '提升出杆的直线性，确保击球准确',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['建立笔直的出杆轨迹', '消除横向摆动', '提升击球精度'],
      steps: [
        '在球杆下方放置一根直尺或瞄准线',
        '进行空杆练习，观察球杆轨迹',
        '确保球杆始终沿直线运动',
        '逐渐加快出杆速度，保持直线性',
        '用慢动作录像检查出杆动作'
      ],
      successCriteria: [
        '出杆轨迹与瞄准线重合',
        '运杆过程中无横向摆动',
        '能在不同速度下保持直线'
      ],
      commonMistakes: [
        '肘部外展，导致球杆偏离',
        '手腕发力不当，产生弧线',
        '握杆过紧，限制流畅性'
      ],
      tips: '使用瞄准训练器辅助练习，及时纠正偏差'
    },
    isActive: true
  },
  {
    id: 'plan_basic_4',
    trainingId: 'st_basic',
    title: '节奏与呼吸协调',
    description: '建立稳定的击球节奏，结合呼吸控制提升稳定性',
    difficulty: 'medium',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['建立个人击球节奏', '掌握呼吸与出杆配合', '提升心理稳定性'],
      steps: [
        '运杆3-4次找准瞄准点',
        '最后一次运杆时深吸气',
        '呼气的同时完成出杆',
        '击球后保持follow through姿势',
        '观察母球走位，总结经验'
      ],
      successCriteria: [
        '每次击球节奏一致',
        '呼吸与出杆自然配合',
        '击球后姿势稳定'
      ],
      commonMistakes: [
        '运杆次数不固定，节奏紊乱',
        '憋气击球，导致紧张',
        '击球后立即抬头，破坏稳定性'
      ],
      tips: '建立固定的击球仪式感，培养稳定心态'
    },
    isActive: true
  },

  // ============================================================================
  // 2. 发力训练营 (st_power) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_power_1',
    trainingId: 'st_power',
    title: '小力推球控制',
    description: '掌握小力推球技巧，建立精准的力度控制感',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['掌握最小力度击球', '控制母球走位距离', '培养力度感觉'],
      steps: [
        '将目标球与母球相距10cm',
        '用最小力度将目标球推入袋口',
        '观察母球停留位置',
        '逐渐增加距离至30cm、50cm',
        '练习不同角度的小力推球'
      ],
      successCriteria: [
        '目标球稳定入袋',
        '母球停留在预期位置±5cm',
        '击球动作流畅自然'
      ],
      commonMistakes: [
        '过度用力，母球跟进过多',
        '出杆不流畅，产生戳球',
        '握杆过紧，影响力度传递'
      ],
      tips: '想象手中握着生鸡蛋，避免过度用力'
    },
    isActive: true
  },
  {
    id: 'plan_power_2',
    trainingId: 'st_power',
    title: '中力击球稳定性',
    description: '建立稳定的中力击球能力，适应80%的实战场景',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['掌握中等力度发力', '保持击球稳定性', '适应不同距离'],
      steps: [
        '设置不同距离的目标球（30cm-100cm）',
        '用中等力度击球入袋',
        '控制母球走位在一个球位内',
        '练习30次，记录成功率',
        '分析失误原因，针对性改进'
      ],
      successCriteria: [
        '入袋成功率达到80%以上',
        '母球走位控制精准',
        '击球动作稳定一致'
      ],
      commonMistakes: [
        '力度忽大忽小，不稳定',
        '出杆加速不均匀',
        '击球点偏离，影响效果'
      ],
      tips: '保持放松，让球杆自然摆动产生力量'
    },
    isActive: true
  },
  {
    id: 'plan_power_3',
    trainingId: 'st_power',
    title: '大力冲球技巧',
    description: '掌握大力击球的控制技巧，应对远距离进攻',
    difficulty: 'hard',
    estimatedTimeMinutes: 30,
    xpReward: 30,
    content: {
      objectives: ['掌握大力发力技巧', '保持准度和稳定性', '控制母球旋转'],
      steps: [
        '选择远距离目标球（1米以上）',
        '站位更稳，后手拉长运杆幅度',
        '加速过程平滑，避免突然发力',
        '击打母球中心偏下，增加前冲力',
        '观察母球轨迹，调整击球参数'
      ],
      successCriteria: [
        '远距离入袋成功率60%以上',
        '母球轨迹可控',
        '击球后身体保持稳定'
      ],
      commonMistakes: [
        '过度发力，失去控制',
        '起身过早，破坏准度',
        '握杆死紧，限制力量传递'
      ],
      tips: '大力击球更需要放松，让身体自然发力'
    },
    isActive: true
  },
  {
    id: 'plan_power_4',
    trainingId: 'st_power',
    title: '力度梯度训练',
    description: '建立精细的力度分级系统，提升力度控制能力',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['建立力度分级体系', '提升力度控制精度', '适应不同场景需求'],
      steps: [
        '将力度分为5个等级：1-5级',
        '每个等级练习10次击球',
        '记录每次母球停留位置',
        '建立个人力度参照表',
        '在实战中应用力度分级'
      ],
      successCriteria: [
        '能准确使用5个力度等级',
        '同等级力度误差小于一个球位',
        '快速判断所需力度等级'
      ],
      commonMistakes: [
        '力度等级划分不清晰',
        '缺乏系统性训练',
        '实战中判断失误'
      ],
      tips: '建立个人力度记录本，不断完善参照系统'
    },
    isActive: true
  },

  // ============================================================================
  // 3. 准度射击场 (st_accuracy) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_accuracy_1',
    trainingId: 'st_accuracy',
    title: '直线球瞄准基础',
    description: '掌握直线球的瞄准方法，建立准度基础',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['掌握重叠法瞄准', '建立瞄准点感觉', '提升直线球准度'],
      steps: [
        '将目标球与袋口成一条直线',
        '找到目标球的瞄准点（背向袋口）',
        '母球对准目标球瞄准点',
        '运杆3次确认瞄准线',
        '果断出杆，观察结果'
      ],
      successCriteria: [
        '直线球入袋成功率90%以上',
        '能快速找到瞄准点',
        '瞄准与击球动作协调'
      ],
      commonMistakes: [
        '瞄准点偏移，导致方向错误',
        '运杆过多，产生怀疑',
        '出杆时改变瞄准'
      ],
      tips: '相信第一感觉，瞄准后果断击球'
    },
    isActive: true
  },
  {
    id: 'plan_accuracy_2',
    trainingId: 'st_accuracy',
    title: '角度球薄厚控制',
    description: '掌握不同角度球的薄厚控制，提升进攻成功率',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['理解球的薄厚概念', '掌握角度球瞄准', '提升角度球准度'],
      steps: [
        '设置15度、30度、45度角度球',
        '观察不同厚度的击球效果',
        '从厚球练起（1/2球以上）',
        '逐步过渡到薄球（1/4球）',
        '记录不同角度的成功率'
      ],
      successCriteria: [
        '30度角度球成功率70%以上',
        '能准确判断球的厚薄',
        '薄球成功率达到50%'
      ],
      commonMistakes: [
        '薄球看厚，厚球看薄',
        '击球点偏移，方向错误',
        '心理紧张，影响准度'
      ],
      tips: '多观察职业选手的角度球处理，建立视觉参照'
    },
    isActive: true
  },
  {
    id: 'plan_accuracy_3',
    trainingId: 'st_accuracy',
    title: '中远台精准打击',
    description: '提升中远距离的击球精度，扩大进攻范围',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['提升远台准度', '保持出杆稳定性', '克服心理压力'],
      steps: [
        '设置1米以上的目标球',
        '加强站位和手架稳定性',
        '延长运杆距离，保持直线',
        '用中力击球，避免过度发力',
        '分析每次失误原因'
      ],
      successCriteria: [
        '1.5米距离成功率60%以上',
        '出杆轨迹稳定',
        '能够连续成功2次以上'
      ],
      commonMistakes: [
        '远台过度紧张，动作变形',
        '发力过猛，失去控制',
        '瞄准时间过长，产生怀疑'
      ],
      tips: '远台击球要更加放松，相信自己的技术'
    },
    isActive: true
  },
  {
    id: 'plan_accuracy_4',
    trainingId: 'st_accuracy',
    title: '压力下的准度保持',
    description: '建立压力下的准度保持能力，提升比赛表现',
    difficulty: 'hard',
    estimatedTimeMinutes: 30,
    xpReward: 30,
    content: {
      objectives: ['提升抗压能力', '保持稳定发挥', '建立自信心'],
      steps: [
        '设定目标：连续进10个球',
        '每失误一次重新开始',
        '记录达到目标的次数',
        '模拟比赛关键球场景',
        '分析压力下的表现'
      ],
      successCriteria: [
        '能完成连续进10球挑战',
        '失误率随训练降低',
        '心态逐渐平稳'
      ],
      commonMistakes: [
        '越接近目标越紧张',
        '改变击球习惯',
        '过度思考，影响执行'
      ],
      tips: '专注当下这一杆，不要想结果'
    },
    isActive: true
  },

  // ============================================================================
  // 4. 杆法实验室 (st_spin) - 5个训练计划
  // ============================================================================
  {
    id: 'plan_spin_1',
    trainingId: 'st_spin',
    title: '高杆基础训练',
    description: '掌握高杆的击球技巧，控制母球前冲效果',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['掌握高杆击球点', '理解前冲原理', '控制跟进距离'],
      steps: [
        '击打母球中心上方1-2个点位',
        '用中等力度击球',
        '观察母球碰撞后前冲效果',
        '调整击球高度，控制跟进距离',
        '练习不同距离的高杆控制'
      ],
      successCriteria: [
        '母球能稳定前冲',
        '跟进距离可控',
        '不出现滑杆现象'
      ],
      commonMistakes: [
        '击球点过高，产生跳球',
        '握杆过紧，影响效果',
        '出杆不流畅，力量不集中'
      ],
      tips: '高杆需要流畅的出杆，避免戳球'
    },
    isActive: true
  },
  {
    id: 'plan_spin_2',
    trainingId: 'st_spin',
    title: '低杆回拉技术',
    description: '掌握低杆的回拉技巧，实现母球后退控制',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['掌握低杆击球技术', '控制回拉距离', '理解旋转原理'],
      steps: [
        '击打母球中心下方1-2个点位',
        '保持水平出杆，避免下砸',
        '加大出杆力度，增强旋转',
        '观察母球回拉轨迹',
        '练习精准的回拉距离控制'
      ],
      successCriteria: [
        '母球能稳定回拉',
        '回拉距离误差小于10cm',
        '轨迹笔直，无偏移'
      ],
      commonMistakes: [
        '下杆角度过大，砸球',
        '力度不足，回拉无力',
        '击球点过低，产生跳球'
      ],
      tips: '低杆关键在于下旋力，不是下砸力'
    },
    isActive: true
  },
  {
    id: 'plan_spin_3',
    trainingId: 'st_spin',
    title: '左右偏杆应用',
    description: '掌握偏杆技巧，实现母球弧线走位',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['掌握左右偏杆技术', '理解弧线效应', '应用于走位控制'],
      steps: [
        '击打母球左侧或右侧点位',
        '观察母球碰撞前的弧线轨迹',
        '理解碰撞后的分离角变化',
        '练习不同偏杆量的效果',
        '结合高低杆使用偏杆'
      ],
      successCriteria: [
        '能打出明显的弧线效果',
        '理解偏杆对分离角的影响',
        '能应用于实际走位'
      ],
      commonMistakes: [
        '偏杆过多，产生滑杆',
        '未考虑弧线对瞄准的影响',
        '偏杆与力度配合不当'
      ],
      tips: '初学偏杆时，先用中力练习，找到感觉后再调整力度'
    },
    isActive: true
  },
  {
    id: 'plan_spin_4',
    trainingId: 'st_spin',
    title: '复合杆法组合',
    description: '掌握高低杆与偏杆的组合使用，实现复杂走位',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['掌握杆法组合技术', '实现复杂走位', '提升控球能力'],
      steps: [
        '练习左高杆：左偏+高杆',
        '练习右高杆：右偏+高杆',
        '练习左低杆：左偏+低杆',
        '练习右低杆：右偏+低杆',
        '分析不同组合的走位效果'
      ],
      successCriteria: [
        '能熟练使用4种复合杆法',
        '理解杆法组合的效果',
        '能根据走位需求选择杆法'
      ],
      commonMistakes: [
        '杆法组合过于复杂，失去控制',
        '击球点偏离过多',
        '力度与杆法不匹配'
      ],
      tips: '复合杆法要循序渐进，先掌握基础再组合'
    },
    isActive: true
  },
  {
    id: 'plan_spin_5',
    trainingId: 'st_spin',
    title: '杆法与力度的配合',
    description: '理解杆法与力度的关系，优化击球效果',
    difficulty: 'hard',
    estimatedTimeMinutes: 30,
    xpReward: 30,
    content: {
      objectives: ['理解杆法力度关系', '优化击球参数', '提升控制精度'],
      steps: [
        '固定杆法，改变力度，观察效果',
        '固定力度，改变杆法，观察效果',
        '总结杆法与力度的配合规律',
        '建立个人杆法参数表',
        '在实战中应用优化参数'
      ],
      successCriteria: [
        '理解杆法与力度的相互作用',
        '能根据需求优化击球参数',
        '控球精度显著提升'
      ],
      commonMistakes: [
        '只注重杆法，忽视力度',
        '参数组合缺乏系统性',
        '实战应用不足'
      ],
      tips: '建立个人训练日志，记录不同参数组合的效果'
    },
    isActive: true
  },

  // ============================================================================
  // 5. 分离角计算器 (st_angle) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_angle_1',
    trainingId: 'st_angle',
    title: '90度分离角基础',
    description: '理解90度分离角原理，掌握中杆击球效果',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['理解90度分离角原理', '掌握中杆击球', '预判母球走位'],
      steps: [
        '用中杆击打目标球（无旋转）',
        '观察母球与目标球的分离角度',
        '理解90度分离规律',
        '练习不同厚度的90度分离',
        '应用于简单的走位控制'
      ],
      successCriteria: [
        '理解90度分离角原理',
        '能预判中杆击球后母球方向',
        '走位误差在一个球位内'
      ],
      commonMistakes: [
        '击球点偏离中心，产生旋转',
        '未理解分离角与厚度的关系',
        '力度控制不当，影响走位'
      ],
      tips: '90度法则是台球走位的基础，务必扎实掌握'
    },
    isActive: true
  },
  {
    id: 'plan_angle_2',
    trainingId: 'st_angle',
    title: '杆法对分离角的影响',
    description: '理解不同杆法如何改变分离角，实现精准走位',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['理解杆法对分离角的影响', '掌握角度调整技巧', '提升走位精度'],
      steps: [
        '用高杆击球，观察分离角变小',
        '用低杆击球，观察分离角变大',
        '用偏杆击球，观察走位弧线',
        '总结不同杆法的分离角规律',
        '练习精准的角度控制'
      ],
      successCriteria: [
        '理解杆法对分离角的影响规律',
        '能通过杆法调整走位角度',
        '走位精度显著提升'
      ],
      commonMistakes: [
        '杆法使用过度，失去控制',
        '未考虑力度对分离角的影响',
        '理论与实践脱节'
      ],
      tips: '多实践，建立对分离角的直观感觉'
    },
    isActive: true
  },
  {
    id: 'plan_angle_3',
    trainingId: 'st_angle',
    title: '厚度与分离角的关系',
    description: '掌握不同厚度击球的分离角计算，提升走位规划能力',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['理解厚度对分离角的影响', '掌握分离角估算方法', '提升走位规划能力'],
      steps: [
        '练习正面击球（厚度100%）',
        '练习半球击球（厚度50%）',
        '练习薄球击球（厚度25%）',
        '观察不同厚度的分离角',
        '总结厚度与分离角的关系'
      ],
      successCriteria: [
        '能快速估算不同厚度的分离角',
        '走位规划更加准确',
        '能根据走位需求选择击球厚度'
      ],
      commonMistakes: [
        '厚度判断不准确',
        '忽视台呢摩擦力的影响',
        '缺乏系统性训练'
      ],
      tips: '建立厚度与分离角的视觉参照系统'
    },
    isActive: true
  },
  {
    id: 'plan_angle_4',
    trainingId: 'st_angle',
    title: '复杂走位的角度规划',
    description: '综合运用分离角知识，实现复杂的多库走位',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['掌握复杂走位规划', '应用分离角计算', '提升实战能力'],
      steps: [
        '设计母球需要走多库的场景',
        '规划母球的行进路线',
        '计算每次碰撞的分离角',
        '选择合适的杆法和力度',
        '执行并分析走位效果'
      ],
      successCriteria: [
        '能规划2库以上的走位路线',
        '走位成功率达到60%',
        '理解库边反弹对走位的影响'
      ],
      commonMistakes: [
        '规划过于复杂，难以执行',
        '未考虑台呢和库边的影响',
        '缺乏实战演练'
      ],
      tips: '从简单走位开始，逐步增加复杂度'
    },
    isActive: true
  },

  // ============================================================================
  // 6. 走位规划室 (st_positioning) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_positioning_1',
    trainingId: 'st_positioning',
    title: '基础走位思路',
    description: '建立走位规划的基本思路，提升局面控制能力',
    difficulty: 'easy',
    estimatedTimeMinutes: 25,
    xpReward: 20,
    content: {
      objectives: ['建立走位意识', '掌握基础走位原则', '提升局面控制'],
      steps: [
        '观察台面，识别下一个目标球',
        '规划母球的理想停留位置',
        '选择合适的击球点和杆法',
        '执行走位并观察结果',
        '分析走位成功或失败的原因'
      ],
      successCriteria: [
        '每次击球前都有走位规划',
        '走位成功率达到70%',
        '能提前规划2步走位'
      ],
      commonMistakes: [
        '只关注进球，忽视走位',
        '走位规划过于复杂',
        '缺乏弹性应对'
      ],
      tips: '先想走位，再想进球，这是高手的思维模式'
    },
    isActive: true
  },
  {
    id: 'plan_positioning_2',
    trainingId: 'st_positioning',
    title: '连续走位训练',
    description: '掌握连续进攻的走位技巧，提升连续得分能力',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['掌握连续走位技巧', '提升连续进球能力', '建立全局观'],
      steps: [
        '摆放3-5个目标球',
        '规划完整的进球路线',
        '确定每球的走位目标',
        '执行连续进球',
        '分析走位链条的合理性'
      ],
      successCriteria: [
        '能连续进3球以上',
        '每球走位符合预期',
        '具备调整能力应对偏差'
      ],
      commonMistakes: [
        '走位过于理想化，缺乏容错',
        '未考虑走位失败的补救',
        '路线规划不合理'
      ],
      tips: '预留走位余地，不要把自己逼入死角'
    },
    isActive: true
  },
  {
    id: 'plan_positioning_3',
    trainingId: 'st_positioning',
    title: '防守型走位',
    description: '掌握防守型走位技巧，提升局面控制能力',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['掌握防守走位策略', '控制母球安全位置', '提升防守能力'],
      steps: [
        '识别对手的进球机会',
        '规划母球的安全停留区域',
        '选择合适的击球方式',
        '执行防守走位',
        '评估防守效果'
      ],
      successCriteria: [
        '母球停留在安全区域',
        '不给对手留下简单机会',
        '具备攻守转换意识'
      ],
      commonMistakes: [
        '走位过于保守，失去进攻机会',
        '未充分考虑对手水平',
        '防守位置选择不当'
      ],
      tips: '防守不仅是躲避，更是为下一次进攻创造机会'
    },
    isActive: true
  },
  {
    id: 'plan_positioning_4',
    trainingId: 'st_positioning',
    title: '全局走位规划',
    description: '建立全局走位视野，提升清台能力',
    difficulty: 'hard',
    estimatedTimeMinutes: 40,
    xpReward: 30,
    content: {
      objectives: ['建立全局走位观', '掌握清台思路', '提升整体水平'],
      steps: [
        '观察台面，识别所有目标球',
        '规划完整的清台路线',
        '识别关键球和难球',
        '确定每球的走位策略',
        '执行并调整规划'
      ],
      successCriteria: [
        '能规划5球以上的走位链',
        '清台成功率显著提升',
        '具备临场调整能力'
      ],
      commonMistakes: [
        '规划过于死板，缺乏灵活性',
        '未充分考虑台面变化',
        '忽视关键球的处理'
      ],
      tips: '清台规划要有主线，也要有备选方案'
    },
    isActive: true
  },

  // ============================================================================
  // 7. 清台挑战赛 (st_clearance) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_clearance_1',
    trainingId: 'st_clearance',
    title: '开球后清台基础',
    description: '掌握开球后的局面评估和清台思路',
    difficulty: 'medium',
    estimatedTimeMinutes: 30,
    xpReward: 25,
    content: {
      objectives: ['掌握开球后评估', '建立清台思路', '提升清台能力'],
      steps: [
        '开球后观察台面布局',
        '识别简单球和难球',
        '规划进球顺序',
        '确定关键球处理方案',
        '执行清台计划'
      ],
      successCriteria: [
        '能快速评估台面局势',
        '清台成功率达到40%',
        '具备应对复杂局面能力'
      ],
      commonMistakes: [
        '急于求成，忽视规划',
        '进球顺序不合理',
        '关键球处理不当'
      ],
      tips: '慢即是快，充分规划才能高效清台'
    },
    isActive: true
  },
  {
    id: 'plan_clearance_2',
    trainingId: 'st_clearance',
    title: '障碍球处理技巧',
    description: '掌握障碍球的处理方法，提升解球能力',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['掌握障碍球处理', '提升解球技巧', '扩展进攻手段'],
      steps: [
        '识别台面障碍球',
        '评估直接进攻可能性',
        '考虑借球、翻袋等技巧',
        '选择最佳处理方案',
        '执行并评估效果'
      ],
      successCriteria: [
        '障碍球处理成功率60%',
        '掌握多种解球技巧',
        '能灵活应对复杂局面'
      ],
      commonMistakes: [
        '过度追求难度，忽视成功率',
        '解球方案选择不当',
        '缺乏系统训练'
      ],
      tips: '解球要量力而行，保证成功率优先'
    },
    isActive: true
  },
  {
    id: 'plan_clearance_3',
    trainingId: 'st_clearance',
    title: '压力下的清台',
    description: '建立压力下的清台能力，提升比赛表现',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['提升抗压能力', '保持清台稳定性', '建立比赛心态'],
      steps: [
        '设定清台目标（如清4球以上）',
        '模拟比赛压力场景',
        '执行清台计划',
        '记录成功率和失误点',
        '分析心理因素影响'
      ],
      successCriteria: [
        '压力下清台成功率不低于平时70%',
        '失误率随训练降低',
        '心态逐渐稳定'
      ],
      commonMistakes: [
        '压力下动作变形',
        '过度思考，影响执行',
        '缺乏心理训练'
      ],
      tips: '建立固定的击球流程，减少压力影响'
    },
    isActive: true
  },
  {
    id: 'plan_clearance_4',
    trainingId: 'st_clearance',
    title: '完整局清台挑战',
    description: '挑战完整局的清台，提升综合实战能力',
    difficulty: 'hard',
    estimatedTimeMinutes: 45,
    xpReward: 40,
    content: {
      objectives: ['挑战完整局清台', '提升综合能力', '建立实战经验'],
      steps: [
        '标准开球，评估局面',
        '规划完整清台路线',
        '执行进球计划',
        '应对突发情况',
        '完成清台或分析失误'
      ],
      successCriteria: [
        '完整局清台成功率达到30%',
        '清台球数逐步增加',
        '综合能力显著提升'
      ],
      commonMistakes: [
        '缺乏耐心，急于求成',
        '战术规划不合理',
        '心理素质不够稳定'
      ],
      tips: '清台是技术、战术、心理的综合较量，需要全面提升'
    },
    isActive: true
  },

  // ============================================================================
  // 8. 五分点速成班 (st_five_points) - 4个训练计划
  // ============================================================================
  {
    id: 'plan_fivepoints_1',
    trainingId: 'st_five_points',
    title: '五分点理论基础',
    description: '理解五分点理论原理，掌握基础应用',
    difficulty: 'easy',
    estimatedTimeMinutes: 20,
    xpReward: 20,
    content: {
      objectives: ['理解五分点理论', '掌握基础应用', '建立视觉参照'],
      steps: [
        '学习五分点在台面上的位置',
        '理解五分点与反弹角度的关系',
        '练习识别五分点位置',
        '进行简单的一库走位',
        '验证理论与实践的一致性'
      ],
      successCriteria: [
        '能快速识别五分点位置',
        '理解五分点理论原理',
        '一库走位成功率70%'
      ],
      commonMistakes: [
        '五分点位置记忆不准确',
        '未考虑力度对反弹的影响',
        '理论与实践脱节'
      ],
      tips: '在台边贴标记，帮助建立视觉参照'
    },
    isActive: true
  },
  {
    id: 'plan_fivepoints_2',
    trainingId: 'st_five_points',
    title: '一库走位精准控制',
    description: '掌握一库走位的精准控制，提升走位能力',
    difficulty: 'medium',
    estimatedTimeMinutes: 25,
    xpReward: 25,
    content: {
      objectives: ['掌握一库走位技巧', '提升走位精度', '应用五分点理论'],
      steps: [
        '设定母球和目标位置',
        '应用五分点确定击球方向',
        '选择合适的力度和杆法',
        '执行走位并观察结果',
        '调整参数，提升精度'
      ],
      successCriteria: [
        '一库走位误差小于10cm',
        '能应用于实战走位',
        '走位成功率达到80%'
      ],
      commonMistakes: [
        '力度控制不当，影响反弹',
        '未考虑台呢摩擦力',
        '杆法使用不当'
      ],
      tips: '一库走位要多练习，建立肌肉记忆'
    },
    isActive: true
  },
  {
    id: 'plan_fivepoints_3',
    trainingId: 'st_five_points',
    title: '两库走位应用',
    description: '掌握两库走位技巧，扩展走位手段',
    difficulty: 'hard',
    estimatedTimeMinutes: 30,
    xpReward: 30,
    content: {
      objectives: ['掌握两库走位', '应用五分点理论', '提升复杂走位能力'],
      steps: [
        '规划两库走位路线',
        '应用五分点确定第一库击点',
        '计算第二库反弹角度',
        '执行走位并验证效果',
        '总结两库走位规律'
      ],
      successCriteria: [
        '两库走位成功率达到60%',
        '能应用于实战场景',
        '理解多库反弹规律'
      ],
      commonMistakes: [
        '路线规划过于复杂',
        '未考虑能量损失',
        '缺乏系统训练'
      ],
      tips: '两库走位难度较大，需要耐心练习'
    },
    isActive: true
  },
  {
    id: 'plan_fivepoints_4',
    trainingId: 'st_five_points',
    title: '五分点实战应用',
    description: '在实战中灵活应用五分点理论，提升走位水平',
    difficulty: 'hard',
    estimatedTimeMinutes: 35,
    xpReward: 30,
    content: {
      objectives: ['实战应用五分点', '提升走位灵活性', '建立实战经验'],
      steps: [
        '在实战局面中识别五分点应用场景',
        '快速计算走位路线',
        '选择合适的执行方案',
        '执行并评估效果',
        '总结实战经验'
      ],
      successCriteria: [
        '能在实战中应用五分点',
        '走位成功率提升20%',
        '综合能力显著提高'
      ],
      commonMistakes: [
        '理论应用僵化',
        '缺乏实战经验',
        '应对能力不足'
      ],
      tips: '五分点是工具，不是万能的，要结合实际灵活应用'
    },
    isActive: true
  },
];

async function seedTrainingPlans() {
  try {
    console.log(`📝 准备导入 ${trainingPlans.length} 个训练计划...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const plan of trainingPlans) {
      try {
        await db
          .insert(specializedTrainingPlansV3)
          .values(plan)
          .onConflictDoNothing();

        successCount++;
        console.log(`   ✅ ${plan.id}: ${plan.title} (${plan.difficulty})`);
      } catch (error) {
        skipCount++;
        console.log(`   ⚠️  ${plan.id}: 已存在或跳过`);
      }
    }

    console.log("\n✨ 训练计划数据导入完成！\n");
    console.log("📊 数据统计:");
    console.log(`   - 总计划数: ${trainingPlans.length}`);
    console.log(`   - 成功导入: ${successCount}`);
    console.log(`   - 跳过数量: ${skipCount}`);
    console.log("\n📋 按类别统计:");
    console.log(`   - 基本功道场: 4个计划`);
    console.log(`   - 发力训练营: 4个计划`);
    console.log(`   - 准度射击场: 4个计划`);
    console.log(`   - 杆法实验室: 5个计划`);
    console.log(`   - 分离角计算器: 4个计划`);
    console.log(`   - 走位规划室: 4个计划`);
    console.log(`   - 清台挑战赛: 4个计划`);
    console.log(`   - 五分点速成班: 4个计划`);
    console.log("\n🎉 可以开始训练了！");

  } catch (error) {
    console.error("❌ 导入失败:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedTrainingPlans();
