-- ============================================================================
-- 90天训练系统：课程数据导入（第46-90天）
-- ============================================================================
-- 导入第4-10招的剩余课程内容
-- 作者: 耶氏台球学院
-- 日期: 2025-01-11
-- ============================================================================

BEGIN;

-- ============================================================================
-- 第4招：准度（第46-48天，完成）
-- ============================================================================

-- 第46天：专项训练 - 平行法瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  46,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '专项',
  '专项训练：平行法瞄准训练',
  '使用平行线辅助，专门练习直球和小角度球的瞄准。重点掌握平行法在不同距离、不同角度下的应用技巧。',
  NULL,
  '["掌握平行法瞄准原理", "提升直球和小角度球准度", "建立平行线思维"]',
  '["使用平行线辅助瞄准", "练习15度以内小角度", "不同距离的直球", "记录成功率"]',
  '中级',
  46
);

-- 第47天：专项训练 - 重合法瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  47,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '专项',
  '专项训练：重合法瞄准训练',
  '使用假想球重合法，练习中大角度球的瞄准。掌握不同角度下假想球位置的判断方法。',
  NULL,
  '["掌握重合法瞄准原理", "提升中大角度球准度", "培养假想球思维"]',
  '["假想球位置判断", "30-60度角度球练习", "重合度估算", "击球点校准"]',
  '中级',
  47
);

-- 第48天：第4招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  48,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '测试',
  '第4招：准度综合测试',
  '对准度系统进行综合测试。测试平行法、重合法、度数法三大瞄准系统的掌握程度。随机20个不同角度和距离的球，综合评估瞄准准确性。',
  NULL,
  '["测试三大瞄准系统", "评估准度掌握程度", "发现薄弱环节"]',
  '["随机20个角度球", "覆盖直球到大角度", "记录进球率", "评估瞄准速度", "综合评分"]',
  '中级',
  48
);

-- ============================================================================
-- 第5招：杆法（第49-60天）
-- ============================================================================

-- 第49天：长台分段发力1（第1天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  49,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '长台分段发力训练1（第1天）',
  '学习长台击球的分段发力技术。今天重点掌握长台发力的节奏和力量传递。',
  '第14集',
  '["理解长台发力原理", "掌握分段发力节奏", "建立长台手感"]',
  '["长台发力姿势", "力量分段传递", "节奏控制", "避免发力过猛"]',
  '中级',
  49
);

-- 第50天：长台分段发力1（第2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  50,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '长台分段发力训练1（第2天）',
  '继续练习长台分段发力，今天重点提升长台击球的稳定性和精准度。',
  '第14集',
  '["提升长台稳定性", "增强发力控制", "提高长台准度"]',
  '["保持发力稳定", "精准击球点控制", "母球走位规划", "连续练习"]',
  '中级',
  50
);

-- 第51天：长台分段发力2（第1天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  51,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '长台分段发力训练2（第1天）',
  '进阶长台分段发力技术，学习在不同力度下的长台控制。今天重点练习中力和大力长台。',
  '第15集',
  '["掌握不同力度长台", "提升长台变化能力", "强化发力技巧"]',
  '["中力长台控制", "大力长台把握", "力度梯度变化", "走位结合"]',
  '中级',
  51
);

-- 第52天：长台分段发力2（第2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  52,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '长台分段发力训练2（第2天）',
  '巩固长台分段发力，今天重点是在实战球型中应用长台技术。',
  '第15集',
  '["实战长台应用", "提升长台自信", "综合发力技巧"]',
  '["实战球型练习", "长台走位组合", "连续长台击球", "心态稳定"]',
  '中级',
  52
);

-- 第53天：极限低杆点位
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  53,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '极限低杆点位训练',
  '学习极限低杆的击球点位和发力技巧。掌握低杆拉回的最大距离控制。',
  '第16集',
  '["掌握极限低杆点位", "提升低杆拉回距离", "控制低杆力度"]',
  '["击球点尽量低", "保持杆的水平", "发力穿透", "避免杆头挑起"]',
  '高级',
  53
);

-- 第54天：登杆分离角
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  54,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '登杆分离角技术训练',
  '学习登杆技术及其对分离角的影响。理解高杆、中杆、低杆的分离角差异。',
  '第26集',
  '["理解登杆分离角原理", "掌握不同杆法分离角", "应用杆法控制走位"]',
  '["高杆缩小分离角", "中杆标准90度", "低杆增大分离角", "力度配合"]',
  '中级',
  54
);

-- 第55天：加塞身位夹角
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  55,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '加塞身位夹角训练',
  '学习加塞时身位和击球夹角的关系。掌握顺塞和反塞的身位调整技巧。',
  '第29集',
  '["理解加塞身位原理", "掌握身位调整方法", "提升加塞准度"]',
  '["顺塞身位向外", "反塞身位向内", "夹角补偿", "瞄准线调整"]',
  '高级',
  55
);

-- 第56天：角度球加塞
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  56,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '系统',
  '角度球加塞技术训练',
  '学习在不同角度球上应用加塞技术。掌握加塞对走位的影响规律。',
  '第31集',
  '["掌握角度球加塞", "理解加塞走位变化", "提升塞控能力"]',
  '["小角度加塞", "大角度加塞", "塞量控制", "走位预判"]',
  '高级',
  56
);

-- 第57天：专项训练 - 高杆走位训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  57,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '专项',
  '专项训练：高杆走位训练',
  '专门练习高杆走位技术。10个不同距离的高杆，母球精准走位到目标区域。',
  NULL,
  '["掌握高杆走位控制", "提升高杆精准度", "强化高杆手感"]',
  '["高杆击球点准确", "力度精准控制", "走位距离预判", "目标误差±10cm"]',
  '中级',
  57
);

-- 第58天：专项训练 - 中杆定位训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  58,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '专项',
  '专项训练：中杆定位训练',
  '专门练习中杆定位技术。10个不同角度的中杆，母球停在进球点附近。',
  NULL,
  '["掌握中杆定位技术", "提升中杆精准度", "强化定位手感"]',
  '["中杆击球点准确", "力度适中控制", "母球停位预判", "停位误差±5cm"]',
  '中级',
  58
);

-- 第59天：专项训练 - 低杆拉回训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  59,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '专项',
  '专项训练：低杆拉回训练',
  '专门练习低杆拉回技术。5级低杆力度，从轻到重逐级练习，掌握低杆拉回距离控制。',
  NULL,
  '["掌握低杆拉回技术", "理解力度与距离关系", "提升低杆控制"]',
  '["极限低杆点位", "发力穿透", "5级力度梯度", "拉回距离控制"]',
  '高级',
  59
);

-- 第60天：第5招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  60,
  (SELECT id FROM tencore_skills WHERE skill_number = 5),
  '测试',
  '第5招：杆法综合测试',
  '对杆法系统进行综合测试。测试高中低杆和加塞技术的掌握程度。包括长台发力、极限低杆、加塞控制等内容。',
  NULL,
  '["测试杆法掌握度", "评估走位控制能力", "发现薄弱环节"]',
  '["高中低杆测试", "加塞控制测试", "长台发力测试", "走位精准度", "综合评分"]',
  '高级',
  60
);

-- ============================================================================
-- 第6招：分离角（第61-67天）
-- ============================================================================

-- 第61天：90度分离角（第1天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  61,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '系统',
  '90度分离角原理训练（第1天）',
  '学习90度分离角的基础原理。今天重点理解中杆击球的标准90度分离角规律。',
  '第24集',
  '["理解90度分离角原理", "掌握标准分离角", "建立分离角思维"]',
  '["中杆击球", "90度分离角规律", "力量中等", "观察母球路径"]',
  '中级',
  61
);

-- 第62天：90度分离角（第2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  62,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '系统',
  '90度分离角应用训练（第2天）',
  '巩固90度分离角原理，今天重点练习在实战球型中应用分离角规律进行走位。',
  '第24集',
  '["应用90度分离角", "提升走位规划", "强化分离角手感"]',
  '["实战球型练习", "分离角走位规划", "母球落点预判", "连续练习"]',
  '中级',
  62
);

-- 第63天：力量配合击球点
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  63,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '系统',
  '力量配合击球点训练',
  '学习力量大小和击球点位对分离角的影响。理解力量、杆法、分离角的综合关系。',
  '第25集',
  '["理解力量与分离角关系", "掌握击球点影响", "综合控制能力"]',
  '["小力缩小分离角", "大力增大分离角", "高杆缩小、低杆增大", "综合运用"]',
  '中级',
  63
);

-- 第64天：分离角原理理论
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  64,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '理论',
  '分离角原理深度讲解',
  '深入学习分离角的物理原理和数学规律。理解不同条件下分离角的变化规律。',
  '第42集',
  '["深度理解分离角原理", "掌握分离角计算", "预判分离角变化"]',
  '["物理碰撞原理", "动量守恒", "旋转影响", "力量影响", "实战预判"]',
  '中级',
  64
);

-- 第65天：专项训练 - 小力分离角
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  65,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '专项',
  '专项训练：小力分离角（<90度）',
  '专门练习小力击球的分离角控制。使用小力击球，观察70-85度分离角变化规律。',
  NULL,
  '["掌握小力分离角规律", "提升小力控制", "精准走位到近点"]',
  '["小力击球", "观察70-85度分离角", "记录分离角度", "走位近点控制"]',
  '中级',
  65
);

-- 第66天：专项训练 - 大力分离角
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  66,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '专项',
  '专项训练：大力分离角（>90度）',
  '专门练习大力击球的分离角控制。使用大力击球，观察95-110度分离角变化规律。',
  NULL,
  '["掌握大力分离角规律", "提升大力控制", "精准走位到远点"]',
  '["大力击球", "观察95-110度分离角", "记录分离角度", "走位远点控制"]',
  '中级',
  66
);

-- 第67天：第6招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  67,
  (SELECT id FROM tencore_skills WHERE skill_number = 6),
  '测试',
  '第6招：分离角综合测试',
  '对分离角系统进行综合测试。10个指定分离角度，测试误差控制能力。包括小力、中力、大力分离角测试。',
  NULL,
  '["测试分离角掌握度", "评估分离角精准度", "验证实战应用能力"]',
  '["指定10个分离角度", "误差控制±5度", "不同力度测试", "实战球型应用", "综合评分"]',
  '中级',
  67
);

-- ============================================================================
-- 第7招：走位（第68-76天）
-- ============================================================================

-- 第68天：不吃库走位
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  68,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '系统',
  '不吃库走位技术训练',
  '学习不吃库直接走位的技术。掌握通过力度和杆法控制母球直接走位到目标位置。',
  '第27集',
  '["掌握不吃库走位", "提升直接走位能力", "强化力度控制"]',
  '["力度精准控制", "杆法灵活运用", "走位路径规划", "避免不必要吃库"]',
  '中级',
  68
);

-- 第69天：一库走位技术（第1天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  69,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '系统',
  '一库走位技术训练（第1天）',
  '学习一库走位的基础技术。今天重点掌握一库走位的角度和力度控制。',
  '第28集',
  '["理解一库走位原理", "掌握入射角等于反射角", "提升一库走位能力"]',
  '["库边反弹角度", "力度配合", "塞的影响", "走位轨迹预判"]',
  '中级',
  69
);

-- 第70天：一库走位技术（第2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  70,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '系统',
  '一库走位技术训练（第2天）',
  '巩固一库走位技术，今天重点练习在实战球型中应用一库走位。',
  '第28集',
  '["提升一库走位精准度", "实战应用能力", "强化一库手感"]',
  '["实战球型练习", "复杂角度一库", "力度塞综合运用", "连续练习"]',
  '中级',
  70
);

-- 第71天：顺塞走位
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  71,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '系统',
  '顺塞走位技术训练',
  '学习顺塞走位的技术原理和应用。掌握顺塞对母球走位路径的影响。',
  '第32集',
  '["理解顺塞走位原理", "掌握顺塞应用", "提升走位灵活性"]',
  '["顺塞增大反弹角", "走位更开", "力度配合", "实战应用"]',
  '高级',
  71
);

-- 第72天：反塞走位
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  72,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '系统',
  '反塞走位技术训练',
  '学习反塞走位的技术原理和应用。掌握反塞对母球走位路径的影响。',
  '第33集',
  '["理解反塞走位原理", "掌握反塞应用", "提升走位精准性"]',
  '["反塞缩小反弹角", "走位更收", "力度配合", "实战应用"]',
  '高级',
  72
);

-- 第73天：专项训练 - 点走位（精准定点）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  73,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '专项',
  '专项训练：点走位（精准定点）',
  '专门练习点走位技术。母球走位到台面5个指定点，误差±5cm。',
  NULL,
  '["掌握点走位技术", "提升定点精准度", "强化走位控制"]',
  '["5个指定点标记", "力度精准计算", "杆法灵活运用", "误差±5cm"]',
  '高级',
  73
);

-- 第74天：专项训练 - 线走位（走位路径）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  74,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '专项',
  '专项训练：线走位（走位路径）',
  '专门练习线走位技术。母球沿指定路径走位（直线、弧线、之字形）。',
  NULL,
  '["掌握线走位技术", "理解走位路径规划", "提升轨迹控制"]',
  '["直线走位", "弧线走位", "之字形走位", "路径精准控制"]',
  '高级',
  74
);

-- 第75天：专项训练 - 面走位（区域控制）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  75,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '专项',
  '专项训练：面走位（区域控制）',
  '专门练习面走位技术。母球走位到指定区域（如上半台、发球区等）。',
  NULL,
  '["掌握面走位技术", "理解区域控制", "提升走位大局观"]',
  '["上半台区域", "下半台区域", "发球区", "区域精准控制"]',
  '高级',
  75
);

-- 第76天：第7招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  76,
  (SELECT id FROM tencore_skills WHERE skill_number = 7),
  '测试',
  '第7招：走位综合测试',
  '对走位系统进行综合测试。测试点线面三维走位能力。包括不吃库、一库、多库、加塞走位等内容。',
  NULL,
  '["测试走位掌握度", "评估走位精准度", "验证实战应用能力"]',
  '["点走位测试", "线走位测试", "面走位测试", "加塞走位测试", "综合评分"]',
  '高级',
  76
);

-- ============================================================================
-- 第8招：轻松清蛇彩（第77-83天）
-- ============================================================================

-- 第77天：中袋球训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  77,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '中袋球技术训练',
  '学习中袋球的击球技术。掌握不同角度、不同距离中袋球的进球方法。',
  '第21集',
  '["掌握中袋球技术", "提升中袋进球率", "强化中袋信心"]',
  '["中袋瞄准方法", "不同角度中袋", "力度控制", "走位结合"]',
  '中级',
  77
);

-- 第78天：清台思路
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  78,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '清台思路训练',
  '学习清台的基本思路和策略。掌握球序选择、走位规划、风险评估等清台要素。',
  '第34集',
  '["理解清台思路", "掌握球序选择", "提升清台规划能力"]',
  '["简单球优先", "连续进攻", "走位规划", "风险控制"]',
  '中级',
  78
);

-- 第79天：实战清台1
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  79,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '实战清台训练1',
  '开始实战清台练习。今天重点练习简单球型的清台，建立清台信心。',
  '第35集',
  '["建立清台信心", "掌握简单清台", "提升连续进攻能力"]',
  '["简单球型", "清台流程", "走位连贯", "心态稳定"]',
  '中级',
  79
);

-- 第80天：实战清台2
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  80,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '实战清台训练2',
  '继续实战清台练习。今天增加球型复杂度，练习中等难度球型的清台。',
  '第36集',
  '["提升清台能力", "应对复杂球型", "强化清台策略"]',
  '["中等难度球型", "球序优化", "走位灵活", "应变能力"]',
  '中级',
  80
);

-- 第81天：实战清台3
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  81,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '实战清台训练3',
  '继续实战清台练习。今天练习更复杂的球型，提升清台综合能力。',
  '第37集',
  '["提升清台综合能力", "应对复杂局面", "强化清台经验"]',
  '["复杂球型", "多方案比较", "走位精准", "冷静应对"]',
  '高级',
  81
);

-- 第82天：实战清台4
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  82,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '系统',
  '实战清台训练4',
  '继续实战清台练习。今天练习极限球型，挑战清台极限能力。',
  '第38集',
  '["挑战清台极限", "提升清台水平", "培养清台风格"]',
  '["极限球型", "创造性走位", "技术综合运用", "心态磨练"]',
  '高级',
  82
);

-- 第83天：第8招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  83,
  (SELECT id FROM tencore_skills WHERE skill_number = 8),
  '测试',
  '第8招：清台能力综合测试',
  '对清台能力进行综合测试。随机摆放15颗球，按顺序清台，评估清台综合水平。',
  NULL,
  '["测试清台能力", "评估清台成功率", "验证清台思路"]',
  '["15颗球清台", "限时15分钟", "记录成功率", "评估思路清晰度", "综合评分"]',
  '高级',
  83
);

-- ============================================================================
-- 第9招：技能（第84-87天）
-- ============================================================================

-- 第84天：实战清台5
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  84,
  (SELECT id FROM tencore_skills WHERE skill_number = 9),
  '系统',
  '实战清台训练5',
  '继续实战清台，同时学习特殊技术的应用。今天重点是在清台中结合各种特殊技能。',
  '第39集',
  '["综合运用技能", "提升实战水平", "培养比赛感觉"]',
  '["特殊球型处理", "技巧球运用", "清台流畅性", "实战节奏"]',
  '高级',
  84
);

-- 第85天：实战清台6
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  85,
  (SELECT id FROM tencore_skills WHERE skill_number = 9),
  '系统',
  '实战清台训练6',
  '继续实战清台，今天重点练习压力环境下的清台能力。',
  '第40集',
  '["提升抗压能力", "稳定清台发挥", "培养比赛心态"]',
  '["压力环境", "心态调整", "失误处理", "稳定发挥"]',
  '高级',
  85
);

-- 第86天：弧线球技术
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  86,
  (SELECT id FROM tencore_skills WHERE skill_number = 9),
  '系统',
  '弧线球技术训练',
  '学习弧线球的击球技术。掌握通过加塞制造弧线绕球的方法。',
  '第41集',
  '["掌握弧线球技术", "理解塞的弧线效果", "提升技巧球能力"]',
  '["大量加塞", "弧线轨迹", "力度配合", "实战应用"]',
  '高级',
  86
);

-- 第87天：第9招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  87,
  (SELECT id FROM tencore_skills WHERE skill_number = 9),
  '测试',
  '第9招：技能综合测试',
  '对特殊技能进行综合测试。测试开球、翻袋、解球、弧线球等特殊技术的掌握程度。',
  NULL,
  '["测试技能掌握度", "评估技巧球能力", "验证实战应用"]',
  '["开球技术", "翻袋技术", "解球技术", "弧线球技术", "综合评分"]',
  '高级',
  87
);

-- ============================================================================
-- 第10招：思路（第88-90天）
-- ============================================================================

-- 第88天：清台思路讲解
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  88,
  (SELECT id FROM tencore_skills WHERE skill_number = 10),
  '系统',
  '清台思路深度讲解',
  '深度学习清台的战术思维和策略。培养大师级的球局分析能力和清台思路。',
  '第43集',
  '["培养战术思维", "提升球局分析", "形成清台风格"]',
  '["局面全局观", "多方案对比", "风险收益评估", "心态管理"]',
  '高级',
  88
);

-- 第89天：综合技术运用
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  89,
  (SELECT id FROM tencore_skills WHERE skill_number = 10),
  '系统',
  '综合技术运用训练',
  '综合运用90天学习的所有技术。今天是正式考核前的最后练习，全面复习和巩固。',
  '第52集',
  '["综合运用技术", "全面复习巩固", "调整最佳状态"]',
  '["十大招综合", "技术融会贯通", "心态调整", "准备考核"]',
  '高级',
  89
);

-- 第90天：十大招终极考核
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  90,
  (SELECT id FROM tencore_skills WHERE skill_number = 10),
  '考核',
  '十大招终极考核',
  '90天训练的终极考核。综合评估十大招的掌握程度，验证3个月训练成果。',
  NULL,
  '["验证训练成果", "评估技术水平", "规划未来提升"]',
  '["清台考核（30分）", "指定球考核（30分）", "实战对抗（20分）", "理论问答（10分）", "心态评估（10分）"]',
  '高级',
  90
);

-- ============================================================================
-- 验证数据导入
-- ============================================================================

DO $$
DECLARE
    total_days INTEGER;
    skill4_remaining INTEGER;
    skill5_count INTEGER;
    skill6_count INTEGER;
    skill7_count INTEGER;
    skill8_count INTEGER;
    skill9_count INTEGER;
    skill10_count INTEGER;
BEGIN
    -- 统计表记录数量
    SELECT COUNT(*) INTO total_days FROM ninety_day_curriculum WHERE day_number BETWEEN 46 AND 90;
    SELECT COUNT(*) INTO skill4_remaining FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4) AND day_number >= 46;
    SELECT COUNT(*) INTO skill5_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 5);
    SELECT COUNT(*) INTO skill6_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 6);
    SELECT COUNT(*) INTO skill7_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 7);
    SELECT COUNT(*) INTO skill8_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 8);
    SELECT COUNT(*) INTO skill9_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 9);
    SELECT COUNT(*) INTO skill10_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 10);

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE '90天课程数据导入验证（第46-90天）';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '总记录数: % 条', total_days;
    RAISE NOTICE '第4招（准度）剩余: % 天', skill4_remaining;
    RAISE NOTICE '第5招（杆法）: % 天', skill5_count;
    RAISE NOTICE '第6招（分离角）: % 天', skill6_count;
    RAISE NOTICE '第7招（走位）: % 天', skill7_count;
    RAISE NOTICE '第8招（清台）: % 天', skill8_count;
    RAISE NOTICE '第9招（技能）: % 天', skill9_count;
    RAISE NOTICE '第10招（思路）: % 天', skill10_count;
    RAISE NOTICE '===========================================';

    IF total_days = 45 THEN
        RAISE NOTICE '✅ 后45天课程数据导入成功！';
    ELSE
        RAISE WARNING '⚠️  数据导入不完整，期望45条，实际%条', total_days;
    END IF;

    -- 验证总记录数
    SELECT COUNT(*) INTO total_days FROM ninety_day_curriculum;
    IF total_days = 90 THEN
        RAISE NOTICE '✅ 90天完整课程数据导入成功！';
    ELSE
        RAISE WARNING '⚠️  总数据不完整，期望90条，实际%条', total_days;
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 先执行 12_create_90day_system.sql 创建表结构
-- 2. 执行 13_insert_90day_curriculum_part1.sql 导入第1-45天
-- 3. 执行本脚本 13_insert_90day_curriculum_part2.sql 导入第46-90天
-- 4. 执行 14_insert_specialized_training.sql 导入专项训练数据
--
-- 验证数据:
-- SELECT day_number, title, training_type
-- FROM ninety_day_curriculum
-- ORDER BY day_number;
--
-- SELECT ts.skill_name, COUNT(*) as days
-- FROM ninety_day_curriculum ndc
-- JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
-- GROUP BY ts.skill_name, ts.skill_number
-- ORDER BY ts.skill_number;
--
-- ============================================================================
