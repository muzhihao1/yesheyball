-- ============================================================================
-- 90天训练系统：课程数据导入（第1-45天）
-- ============================================================================
-- 导入前45天的训练课程数据
-- 包括：第1招基本功、第2招发力、第3招五分点、部分第4招准度
-- 作者: 耶氏台球学院
-- 日期: 2025-01-11
-- ============================================================================

BEGIN;

-- ============================================================================
-- 第1招：基本功（第1-15天）
-- ============================================================================

-- 第1-2天：握杆基础训练（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  1,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '握杆基础训练（第1天）',
  '学习正确的握杆姿势，建立良好的击球基础。重点掌握握杆的力度和位置。今天重点练习握杆的基本姿势和手感。',
  '第1集',
  '["掌握正确的握杆姿势", "理解握杆的松紧度", "建立基础手感"]',
  '["握杆位置：后手握杆点距离杆尾30cm左右", "握杆力度：三个手指轻握，不要用力", "手腕保持放松自然"]',
  '初级',
  1
), (
  2,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '握杆基础训练（第2天）',
  '继续巩固握杆技术，重点练习握杆的一致性和稳定性。通过反复练习建立肌肉记忆。',
  '第1集',
  '["巩固握杆姿势", "提高握杆一致性", "建立肌肉记忆"]',
  '["握杆稳定性训练", "握杆松紧度控制", "击球时握杆不变形"]',
  '初级',
  2
);

-- 第3-4天：手架技术练习（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  3,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '手架技术练习（第1天）',
  '掌握稳定的手架技术，为精准击球做准备。学习基础手架的摆放方法和稳定性要求。',
  '第2集',
  '["掌握基础手架姿势", "理解手架的稳定性", "练习不同距离的手架"]',
  '["手架高度要稳定", "手指撑开成三角形", "手架与母球距离15-20cm"]',
  '初级',
  3
), (
  4,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '手架技术练习（第2天）',
  '继续练习手架技术，重点提高手架的稳定性和适应性。练习不同距离和角度的手架摆放。',
  '第2集',
  '["提高手架稳定性", "适应不同距离", "掌握手架变化"]',
  '["近距离手架", "远距离手架", "不同角度的手架调整"]',
  '初级',
  4
);

-- 第5-6天：站位与姿势调整（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  5,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '站位与姿势调整（第1天）',
  '学习正确的站位和身体姿势，建立稳定的击球平台。重点练习站位的基本要领。',
  '第3集',
  '["掌握正确站位", "建立稳定平台", "理解身体平衡"]',
  '["双脚与肩同宽", "前脚与击球线成45度", "身体重心平衡"]',
  '初级',
  5
), (
  6,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '站位与姿势调整（第2天）',
  '继续练习站位和姿势，重点提高站位的一致性和舒适度。通过大量练习建立标准动作。',
  '第3集',
  '["巩固站位姿势", "提高一致性", "找到舒适感"]',
  '["站位快速定位", "姿势调整技巧", "保持身体平衡"]',
  '初级',
  6
);

-- 第7-8天：入位与击球节奏（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  7,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '入位与击球节奏（第1天）',
  '培养良好的入位习惯和击球节奏，提高击球的一致性。学习标准的入位流程。',
  '第4集',
  '["建立入位流程", "培养击球节奏", "提高一致性"]',
  '["入位三步骤：观察-站位-调整", "节奏要稳定", "每次入位保持一致"]',
  '初级',
  7
), (
  8,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '入位与击球节奏（第2天）',
  '继续练习入位和节奏，重点提高入位的速度和准确性。通过计时练习建立稳定节奏。',
  '第4集',
  '["加快入位速度", "保持节奏稳定", "建立肌肉记忆"]',
  '["入位流程标准化", "节奏计时训练", "入位习惯养成"]',
  '初级',
  8
);

-- 第9-10天：空杆与节奏训练（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  9,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '空杆与节奏训练（第1天）',
  '通过空杆练习建立稳定的击球节奏，培养肌肉记忆。学习空杆的正确方法和要领。',
  '第5集',
  '["掌握空杆技术", "建立击球节奏", "培养肌肉记忆"]',
  '["空杆3-5次", "节奏要一致", "运杆要流畅"]',
  '初级',
  9
), (
  10,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '系统',
  '空杆与节奏训练（第2天）',
  '继续空杆练习，重点提高空杆的质量和节奏的稳定性。通过大量重复建立自然反应。',
  '第5集',
  '["提高空杆质量", "稳定击球节奏", "形成自然反应"]',
  '["空杆路径稳定", "节奏保持一致", "肌肉记忆建立"]',
  '初级',
  10
);

-- 第11天：专项 - 握杆稳定性测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  11,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '专项',
  '专项训练：握杆稳定性测试',
  '通过连续击球测试握杆的稳定性和一致性。目标：连续击球30次，检查握杆松紧度是否保持一致。',
  NULL,
  '["测试握杆稳定性", "检查握杆一致性", "发现问题并改进"]',
  '["连续击球30次", "每次检查握杆", "记录握杆感觉", "误差控制±5%"]',
  '初级',
  11
);

-- 第12天：专项 - 手架高度适配训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  12,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '专项',
  '专项训练：手架高度适配训练',
  '练习不同距离球的手架高度调整，提高手架的适应性。目标：准确适配5种不同距离的手架高度。',
  NULL,
  '["掌握手架高度调整", "适应不同距离", "提高适应性"]',
  '["近距离（0-50cm）手架", "中距离（50-100cm）手架", "远距离（>100cm）手架", "记录每种感觉"]',
  '初级',
  12
);

-- 第13天：专项 - 站位快速定位训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  13,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '专项',
  '专项训练：站位快速定位训练',
  '通过计时训练提高站位的速度和准确性。目标：限时3秒内完成标准站位。',
  NULL,
  '["提高站位速度", "保持站位准确", "建立快速反应"]',
  '["计时3秒站位", "检查姿势标准", "重复30次", "准确率>90%"]',
  '初级',
  13
);

-- 第14天：专项 - 节奏一致性训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  14,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '专项',
  '专项训练：节奏一致性训练',
  '通过计时训练建立稳定的击球节奏。目标：空杆10次计时，误差控制在0.5秒内。',
  NULL,
  '["建立稳定节奏", "提高一致性", "形成自然反应"]',
  '["空杆10次计时", "记录每次时间", "计算平均值和误差", "误差≤0.5秒"]',
  '初级',
  14
);

-- 第15天：第1招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  15,
  (SELECT id FROM tencore_skills WHERE skill_number = 1),
  '测试',
  '第1招：基本功综合测试',
  '对前14天的基本功训练进行综合测试和评估。测试内容包括握杆、手架、站位、入位、节奏等所有基本功要素。',
  NULL,
  '["测试基本功掌握度", "发现薄弱环节", "制定改进计划"]',
  '["握杆稳定性测试", "手架适应性测试", "站位准确性测试", "节奏一致性测试", "综合评分"]',
  '初级',
  15
);

-- ============================================================================
-- 第2招：发力（第16-30天）
-- ============================================================================

-- 第16天：低杆发力平稳度
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  16,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '低杆发力平稳度',
  '练习低杆技术，重点掌握发力的平稳度和控制。学习低杆击球的基本原理和技巧。',
  '第7集',
  '["掌握低杆技术", "理解后旋原理", "控制发力平稳度"]',
  '["击球点在母球下半部", "发力要平稳", "保持运杆水平", "母球产生后旋"]',
  '初级',
  16
);

-- 第17-18天：穿透力训练（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  17,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '穿透力训练（第1天）',
  '学习通过手肘动作增加穿透力，提高击球效果。理解穿透力的概念和重要性。',
  '第8集',
  '["理解穿透力概念", "学习手肘动作", "提高击球效果"]',
  '["手肘向前送", "保持运杆延伸", "击球要有穿透感"]',
  '中级',
  17
), (
  18,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '穿透力训练（第2天）',
  '继续练习穿透力，重点提高穿透力的稳定性和控制力。通过大量练习建立手感。',
  '第8集',
  '["巩固穿透力技术", "提高稳定性", "建立击球手感"]',
  '["穿透力控制", "保持动作一致", "击球有力且稳定"]',
  '中级',
  18
);

-- 第19天：初级预力控制
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  19,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '初级预力控制',
  '掌握基础的力量控制技术，学会判断和调节击球力度。理解预力的概念。',
  '第9集',
  '["理解预力概念", "学习力量判断", "掌握力度调节"]',
  '["预力通过试杆确定", "力度分大中小三档", "根据距离选择力度"]',
  '初级',
  19
);

-- 第20-21天：中级预力锁定（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  20,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '中级预力锁定（第1天）',
  '通过试杆练习锁定合适的击球力量，提高击球精度。学习预力锁定的方法。',
  '第10集',
  '["学习预力锁定", "提高力度精度", "建立力量感觉"]',
  '["试杆2-3次", "感受力度大小", "锁定目标力度", "击球保持力度"]',
  '中级',
  20
), (
  21,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '中级预力锁定（第2天）',
  '继续练习预力锁定，重点提高锁定的准确性和稳定性。通过反复练习形成肌肉记忆。',
  '第10集',
  '["巩固预力锁定", "提高准确性", "形成肌肉记忆"]',
  '["预力锁定准确", "力度误差小", "击球力度一致"]',
  '中级',
  21
);

-- 第22天：低杆力量控制
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  22,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '低杆力量控制',
  '在低杆击球中运用力量控制技术，掌握精确的力度调节。综合运用低杆和力度控制。',
  '第11集',
  '["综合运用低杆和力度", "精确控制力量", "提高走位精度"]',
  '["低杆+小力=短距拉杆", "低杆+中力=中距拉杆", "低杆+大力=长距拉杆"]',
  '中级',
  22
);

-- 第23天：翻腕技术训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  23,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '翻腕技术训练',
  '练习手腕翻转技术，提高击球的稳定性和精确性。掌握翻腕的时机和力度。',
  '第12集',
  '["掌握翻腕技术", "提高击球稳定性", "增加击球精度"]',
  '["击球瞬间手腕翻转", "翻腕幅度要小", "保持手腕放松"]',
  '中级',
  23
);

-- 第24-25天：满弓发力训练（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  24,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '满弓发力训练（第1天）',
  '学习满弓发力技术，掌握大力击球的要领。理解满弓发力的原理和应用场景。',
  '第13集',
  '["学习满弓发力", "掌握大力击球", "理解应用场景"]',
  '["运杆幅度最大", "手肘充分后拉", "发力完整释放", "适用于长台球"]',
  '中级',
  24
), (
  25,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '系统',
  '满弓发力训练（第2天）',
  '继续练习满弓发力，重点提高发力的稳定性和控制力。通过大量练习掌握发力节奏。',
  '第13集',
  '["巩固满弓发力", "提高稳定性", "掌握发力节奏"]',
  '["发力要稳定", "保持击球准确", "控制母球走位"]',
  '中级',
  25
);

-- 第26天：专项 - 小力训练（0.5-2米）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  26,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '专项',
  '专项训练：小力训练（0.5-2米）',
  '专门训练小力度击球，母球精准走位到0.5-2米范围内目标点。目标：误差±10cm。',
  NULL,
  '["掌握小力击球", "精准控制距离", "提高走位精度"]',
  '["标记目标点", "母球走位0.5-2米", "误差初级±30cm", "中级±20cm", "高级±10cm"]',
  '初级',
  26
);

-- 第27天：专项 - 中力训练（2-4米）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  27,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '专项',
  '专项训练：中力训练（2-4米）',
  '专门训练中力度击球，母球精准走位到2-4米范围内目标点。目标：误差±15cm。',
  NULL,
  '["掌握中力击球", "精准控制距离", "提高走位精度"]',
  '["标记目标点", "母球走位2-4米", "误差初级±30cm", "中级±20cm", "高级±15cm"]',
  '中级',
  27
);

-- 第28天：专项 - 大力训练（>4米）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  28,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '专项',
  '专项训练：大力训练（>4米）',
  '专门训练大力度击球，母球精准走位到全台远距离目标。目标：误差±20cm。',
  NULL,
  '["掌握大力击球", "精准控制距离", "提高走位精度"]',
  '["标记远距目标", "母球走位>4米", "误差初级±40cm", "中级±30cm", "高级±20cm"]',
  '中级',
  28
);

-- 第29天：专项 - 力度梯度训练（5档）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  29,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '专项',
  '专项训练：力度梯度训练（5档）',
  '训练5个不同力度等级的精准控制。使用同一击球点，连续击出5个不同力度。目标：准确区分并控制5档力度。',
  NULL,
  '["掌握5档力度", "精准控制梯度", "建立力度感觉"]',
  '["1档：0.5米", "2档：1-2米", "3档：2-3米", "4档：3-4米", "5档：>4米", "每档重复10次"]',
  '中级',
  29
);

-- 第30天：第2招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  30,
  (SELECT id FROM tencore_skills WHERE skill_number = 2),
  '测试',
  '第2招：发力综合测试',
  '对前15天的发力训练进行综合测试和评估。测试内容包括低杆、穿透力、预力控制、力度分级等所有发力要素。',
  NULL,
  '["测试发力掌握度", "评估力度控制能力", "发现薄弱环节"]',
  '["低杆稳定性测试", "穿透力测试", "预力锁定测试", "5档力度测试", "综合评分"]',
  '中级',
  30
);

-- ============================================================================
-- 第3招：高效五分点（第31-37天）
-- ============================================================================

-- 第31天：5分点加塞训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  31,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '系统',
  '5分点加塞训练',
  '通过5分点训练掌握加塞瞄准技术。学习傅家俊五分点瞄准法的基本原理。',
  '第30集',
  '["学习五分点理论", "掌握加塞瞄准", "理解分点概念"]',
  '["母球分5个点", "不同分点对应不同角度", "加塞改变进球角度", "配合身位调整"]',
  '高级',
  31
);

-- 第32天：五分点理论讲解
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  32,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '理论',
  '五分点理论详解',
  '深入理解傅家俊五分点瞄准法的理论基础，学习不同分点的应用场景和瞄准方法。',
  NULL,
  '["深入理解五分点", "掌握应用场景", "学习瞄准方法"]',
  '["1分点：直球和小角度", "2分点：30度角度球", "3分点：45度角度球", "4分点：60度角度球", "5分点：75度大角度球"]',
  '中级',
  32
);

-- 第33天：专项 - 1分点瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  33,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '专项',
  '专项训练：1分点瞄准训练',
  '专门训练1分点瞄准法，练习直球和15度小角度球。目标：进球率>90%。',
  NULL,
  '["掌握1分点瞄准", "练习小角度球", "提高进球率"]',
  '["摆放15个不同位置球", "使用1分点瞄准", "记录进球率", "初级>70%", "中级>80%", "高级>90%"]',
  '初级',
  33
);

-- 第34天：专项 - 2分点瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  34,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '专项',
  '专项训练：2分点瞄准训练',
  '专门训练2分点瞄准法，练习30度角度球。目标：进球率>85%。',
  NULL,
  '["掌握2分点瞄准", "练习30度角度", "提高进球率"]',
  '["摆放15个30度角度球", "使用2分点瞄准", "记录进球率", "初级>70%", "中级>80%", "高级>85%"]',
  '中级',
  34
);

-- 第35天：专项 - 3分点瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  35,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '专项',
  '专项训练：3分点瞄准训练',
  '专门训练3分点瞄准法，练习45度角度球。目标：进球率>80%。',
  NULL,
  '["掌握3分点瞄准", "练习45度角度", "提高进球率"]',
  '["摆放15个45度角度球", "使用3分点瞄准", "记录进球率", "初级>65%", "中级>75%", "高级>80%"]',
  '中级',
  35
);

-- 第36天：专项 - 4分点瞄准训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  36,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '专项',
  '专项训练：4分点瞄准训练',
  '专门训练4分点瞄准法，练习60度大角度球。目标：进球率>75%。',
  NULL,
  '["掌握4分点瞄准", "练习60度角度", "提高进球率"]',
  '["摆放15个60度角度球", "使用4分点瞄准", "记录进球率", "初级>60%", "中级>70%", "高级>75%"]',
  '高级',
  36
);

-- 第37天：第3招综合测试
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  37,
  (SELECT id FROM tencore_skills WHERE skill_number = 3),
  '测试',
  '第3招：五分点综合测试',
  '对五分点瞄准法进行综合测试。随机15个不同角度球，使用五分点法瞄准，综合评估掌握程度。',
  NULL,
  '["测试五分点掌握度", "评估瞄准准确性", "综合运用能力"]',
  '["随机15个角度球", "涵盖1-4分点", "记录进球率", "评估瞄准速度", "综合评分"]',
  '中级',
  37
);

-- ============================================================================
-- 第4招：准度（第38-45天，部分）
-- ============================================================================

-- 第38天：初级瞄准技术
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  38,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '初级瞄准技术',
  '学习基础瞄准技术，掌握瞄准线的概念和应用。建立瞄准的基本认知。',
  '第6集',
  '["理解瞄准线概念", "掌握基础瞄准", "建立瞄准认知"]',
  '["瞄准线：球杆-母球-目标球-袋口", "眼睛看目标球", "杆头对准瞄准点"]',
  '初级',
  38
);

-- 第39天：重心线训练
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  39,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '重心线训练',
  '通过重心线训练提高直球分点能力。学习使用重心线辅助瞄准。',
  '第17集',
  '["学习重心线概念", "提高直球准度", "掌握分点能力"]',
  '["重心线：母球和目标球的连线", "分点：目标球被击打的点", "直球重心线训练"]',
  '中级',
  39
);

-- 第40-41天：假想球瞄准法（拆分2天）
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  40,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '假想球瞄准法（第1天）',
  '学习假想球瞄准方法，提高瞄准精度。理解假想球的概念和应用。',
  '第18集',
  '["理解假想球概念", "学习假想球瞄准", "提高瞄准精度"]',
  '["假想球：一个与目标球重叠的虚拟母球", "母球要打到假想球位置", "假想球中心对准袋口"]',
  '初级',
  40
), (
  41,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '假想球瞄准法（第2天）',
  '继续练习假想球瞄准法，提高瞄准的速度和准确性。通过大量练习建立瞄准直觉。',
  '第18集',
  '["巩固假想球瞄准", "提高瞄准速度", "建立瞄准直觉"]',
  '["快速找到假想球位置", "瞄准点锁定准确", "进球率提升"]',
  '初级',
  41
);

-- 第42天：向边球瞄准
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  42,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '向边球瞄准',
  '练习向边球的瞄准技术，掌握角度球基础。学习向边球的特点和瞄准方法。',
  '第19集',
  '["理解向边球特点", "掌握角度球基础", "学习瞄准方法"]',
  '["向边球：目标球靠近边库", "瞄准点偏向库边", "考虑反弹角度"]',
  '中级',
  42
);

-- 第43天：离边球瞄准
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  43,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '离边球瞄准',
  '掌握离边球的瞄准方法，完善角度球技术。学习离边球的特点和瞄准技巧。',
  '第20集',
  '["理解离边球特点", "完善角度球技术", "掌握瞄准技巧"]',
  '["离边球：目标球远离边库", "瞄准点偏离库边", "角度判断更自由"]',
  '中级',
  43
);

-- 第44天：极限高球瞄准
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  44,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '极限高球瞄准',
  '挑战极限高球的瞄准，突破技术难点。学习极限角度球的瞄准方法和技巧。',
  '第22集',
  '["挑战极限角度", "突破技术难点", "掌握高难度瞄准"]',
  '["极限高球：>75度大角度", "瞄准难度极高", "需要精准判断", "多次试杆确认"]',
  '高级',
  44
);

-- 第45天：中级瞄准锁定
INSERT INTO ninety_day_curriculum (
  day_number, tencore_skill_id, training_type, title, description,
  original_course_ref, objectives, key_points, difficulty, order_index
) VALUES (
  45,
  (SELECT id FROM tencore_skills WHERE skill_number = 4),
  '系统',
  '中级瞄准锁定',
  '学习锁定进球点的中级瞄准技术。提高瞄准的稳定性和准确性。',
  '第23集',
  '["学习瞄准锁定", "提高瞄准稳定性", "增强瞄准准确性"]',
  '["瞄准后锁定目标", "保持注意力集中", "击球前最后确认", "瞄准不漂移"]',
  '中级',
  45
);

COMMIT;

-- ============================================================================
-- 验证数据导入
-- ============================================================================

DO $$
DECLARE
    total_days INTEGER;
    skill1_count INTEGER;
    skill2_count INTEGER;
    skill3_count INTEGER;
    skill4_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_days FROM ninety_day_curriculum WHERE day_number BETWEEN 1 AND 45;
    SELECT COUNT(*) INTO skill1_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 1);
    SELECT COUNT(*) INTO skill2_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 2);
    SELECT COUNT(*) INTO skill3_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 3);
    SELECT COUNT(*) INTO skill4_count FROM ninety_day_curriculum WHERE tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4);

    RAISE NOTICE '===========================================';
    RAISE NOTICE '90天课程数据导入验证（第1-45天）';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '总记录数: % 条', total_days;
    RAISE NOTICE '第1招（基本功）: % 天', skill1_count;
    RAISE NOTICE '第2招（发力）: % 天', skill2_count;
    RAISE NOTICE '第3招（五分点）: % 天', skill3_count;
    RAISE NOTICE '第4招（准度）: % 天（部分）', skill4_count;
    RAISE NOTICE '===========================================';

    IF total_days = 45 THEN
        RAISE NOTICE '✅ 前45天课程数据导入成功！';
    ELSE
        RAISE WARNING '⚠️  数据导入不完整，期望45条，实际%条', total_days;
    END IF;
END $$;
