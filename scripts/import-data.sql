-- Import existing data

-- Users
INSERT INTO users (id, email, first_name, last_name, profile_image_url, username, level, exp, streak, total_days, completed_tasks, total_time, achievements, current_level, current_exercise, completed_exercises, created_at, last_active_at) VALUES (
    '1',
    NULL,
    NULL,
    NULL,
    NULL,
    'demo_user',
    1,
    264,
    0,
    0,
    8,
    0,
    '[]'::jsonb,
    1,
    2,
    '{"1":1}'::jsonb,
    '2025-06-14T08:35:22.521Z',
    '2025-06-18T06:06:23.994Z'
  ) ON CONFLICT (id) DO UPDATE SET
    level = EXCLUDED.level,
    exp = EXCLUDED.exp,
    streak = EXCLUDED.streak,
    total_days = EXCLUDED.total_days,
    completed_tasks = EXCLUDED.completed_tasks,
    total_time = EXCLUDED.total_time,
    achievements = EXCLUDED.achievements,
    current_level = EXCLUDED.current_level,
    current_exercise = EXCLUDED.current_exercise,
    completed_exercises = EXCLUDED.completed_exercises,
    last_active_at = EXCLUDED.last_active_at;
INSERT INTO users (id, email, first_name, last_name, profile_image_url, username, level, exp, streak, total_days, completed_tasks, total_time, achievements, current_level, current_exercise, completed_exercises, created_at, last_active_at) VALUES (
    '31581595',
    'muzhihao1@gmail.com',
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    3171,
    0,
    0,
    59,
    102,
    '[]'::jsonb,
    1,
    25,
    '{"1":35,"2":40,"3":21,"4":24}'::jsonb,
    '2025-06-14T08:42:15.143Z',
    '2025-09-30T12:04:07.397Z'
  ) ON CONFLICT (id) DO UPDATE SET
    level = EXCLUDED.level,
    exp = EXCLUDED.exp,
    streak = EXCLUDED.streak,
    total_days = EXCLUDED.total_days,
    completed_tasks = EXCLUDED.completed_tasks,
    total_time = EXCLUDED.total_time,
    achievements = EXCLUDED.achievements,
    current_level = EXCLUDED.current_level,
    current_exercise = EXCLUDED.current_exercise,
    completed_exercises = EXCLUDED.completed_exercises,
    last_active_at = EXCLUDED.last_active_at;

-- Training Programs
INSERT INTO training_programs (id, name, description, total_days, current_day, difficulty, created_at) VALUES (
    1,
    '耶氏台球学院系统教学',
    '为期30集的系统化台球基础训练计划，从握杆、站位到实战清台的全面指导',
    30,
    8,
    '新手',
    '2025-06-05T03:26:28.143Z'
  ) ON CONFLICT (id) DO UPDATE SET
    current_day = EXCLUDED.current_day;

-- Training Days (30 records)
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    1,
    1,
    1,
    '握杆',
    '参照教学内容，左手扶杆，右手做钟摆状运动，直到握力掌握',
    ARRAY['熟练掌握握力为止'],
    ARRAY['手握空拳，掌心贴合球杆', '不要刻意松指或握紧'],
    30
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    2,
    1,
    2,
    '手架',
    '让每种手架稳定支撑为止',
    ARRAY['掌握稳定手架技巧'],
    ARRAY['大拇指与食指关节紧紧相贴', '手架''浮''于台面，要便于移动', '身体不能有重量压在手架上'],
    30
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    3,
    1,
    3,
    '站位与姿势',
    '配合球杆去站位，''以人就杆''熟练分配重心比例为止',
    ARRAY['掌握正确站位与姿势'],
    ARRAY['重心在右脚占80%，左脚占15%，手架占5%', '移动手架时必须身体重心调整'],
    35
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    4,
    1,
    4,
    '入位与节奏',
    '确定进球线路，一步入位',
    ARRAY['空杆与击球交替训练'],
    ARRAY['一步入位', '运杆平顺度'],
    35
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    5,
    1,
    5,
    '空杆与击球',
    '感受''提水桶''时大臂的发力感觉，空杆训练20组',
    ARRAY['掌握正确发力方式'],
    ARRAY['平顺度', '注意大臂和手肘的配合练习', '站着时候就瞄准'],
    30
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    6,
    1,
    6,
    '初级瞄准',
    '空杆练习20次，击球练习20组',
    ARRAY['掌握瞄准基础技术'],
    ARRAY['中心点：看母球最上方与最下方的连线', '击球时力量无需很大', '出杆要逐渐加速，在击打母球后要送出去', '力量要穿过母球直达目标球上'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    7,
    1,
    7,
    '初级发力平顺度 低杆',
    '低杆练习，稍有角度',
    ARRAY['空杆训练20次', '击球训练，球摆出一点角度，20次'],
    ARRAY['每杆均匀抹巧粉', '低杆击打位置：母球最底下高约半颗皮头的位置', '回杆慢慢回，逐渐加速推出球杆'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    8,
    1,
    8,
    '利用手肘增加穿透力',
    '低杆练习小臂加手肘低杆应至少拉回一台',
    ARRAY['空杆慢速训练20次', '熟练后稍稍加快出杆末端的速度训练20次', '小力量击球训练20组，每组10颗'],
    ARRAY['手肘用于衔接小臂摆动力量', '当小臂逐渐快用完力时，小臂继续摆动的同时手肘向前推', '握杆手避免碰胸'],
    35
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    9,
    1,
    9,
    '初级准备力量',
    '三段力量训练',
    ARRAY['小臂力量用完(中力)，连续5杆到中袋附近合格', '小臂加手腕连续5杆到中袋和底库中间合格', '小臂加手腕加手肘'],
    ARRAY['三段力量：小臂占总力量60%，手腕(翻腕)占20%，手肘占20%', '小臂中力可以回到中袋附近', '小臂中力加手腕翻动可以回到中袋靠后'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    10,
    1,
    10,
    '中级预力 通过试击锁定力量',
    '中级预力练习：母球停在洞口前方',
    ARRAY['球杆拉回最后方再完全推出来，母球停在洞口前方，却不能进袋，越近越好', '任意位置将母球推至洞口'],
    ARRAY['试击：更加精确的预力', '趴下后来回运杆进行尝试击打', '眼睛要始终盯着母球要停到的位置'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    11,
    1,
    11,
    '中级预力 低杆力量控制',
    '量值：0的力量中级预力练习：低杆力量控制',
    ARRAY['将小臂练出3个稳定的力量，5、10、15力量', '然后在小臂各力量等级下，一点点增加手腕的力量'],
    ARRAY['通过试击来控制母球低杆的距离', '试击时，先进行小臂的长试击，再进行手腕力量与方向的短试击', '低杆回中袋：小臂5力量＋手腕0力量'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    12,
    1,
    12,
    '翻腕训练',
    '翻腕训练：高杆吸库(小角度！)',
    ARRAY['空杆加速训练，感觉小臂拖出来手腕很重，然后加速翻动手腕', '高杆吸库，每组10颗球，练习10组'],
    ARRAY['要感受小臂拖出来时手腕很重的感觉', '由后面三指接触球杆到前面后掌心接触球杆', '要训练手腕翻动的平顺度', '高杆吸库：比中杆高出半颗皮头位置'],
    35
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    13,
    1,
    13,
    '分段发力1',
    '大臂-小臂-手腕-手肘分段发力训练',
    ARRAY['掌握分段发力技术', '提升动作协调性'],
    ARRAY['分段发力顺序', '动作连贯', '力量传递'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    14,
    1,
    14,
    '分段发力2',
    '动作平顺度最重要的练习，1-2个月。根据掌握情况定',
    ARRAY['长台低杆加速训练'],
    ARRAY['进行动作的加速训练', '大臂先缓慢把小臂拖出来，然后小臂加速，手腕加速，由手肘向前推', '动作不需太大也可以低杆一库', '重点在力量衔接平顺度感觉'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    15,
    1,
    15,
    '分段发力 极限低杆',
    '极限低杆点位',
    ARRAY['小力极限低杆训练10组以上'],
    ARRAY['皮头唤醒器使用方法', '小力极限低杆点位，可以回1台', '拓展课没有其他要求，自行练习'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    16,
    1,
    16,
    '初级瞄准2 直球',
    '5分点直球瞄准训练',
    ARRAY['掌握5分点瞄准', '直球技术精进'],
    ARRAY['5分点精度', '直球稳定性', '瞄准准确性'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    17,
    1,
    17,
    '初级瞄准3 离边球',
    '离边球训练(直线球偏一颗半球)',
    ARRAY['左边(右边)偏1.5颗球各练习5组，每组10颗', '偏2颗到3颗球各练50颗', '再到底库练习两侧离边球各50颗'],
    ARRAY['离边球：击打目标球后，母球会向远离库边方向跑', '注意也要考虑''耦合效应''', '假想球瞄准时，要瞄准厚一些'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    18,
    1,
    18,
    '初级瞄准4 角度球',
    '不同角度下的瞄准练习',
    ARRAY['角度球瞄准技术', '适应不同角度'],
    ARRAY['角度判断', '瞄准调整', '进球路线'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    19,
    1,
    19,
    '初级瞄准 极限薄球',
    '极限薄球-估算假想球体积训练',
    ARRAY['训练母球中等距离极限薄球', '将母球拿远继续训练', '长台极限薄球训练'],
    ARRAY['只能用假想球瞄准的方式瞄准', '复制出来一个目标球并假象其在目标球后面', '根据母球远近体积的变化，找准复制出假想球的球心'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    20,
    1,
    20,
    '中级瞄准 锁定进球点与发力',
    '锁定注意力、动作方向、动作力量训练进球点优化',
    ARRAY['看着目标球进球线路，感知母球位置缺不看母球', '锁定后击球训练练习50颗', '在建立了前面两种锁定后，再练习打穿''透明''目标球练习'],
    ARRAY['注意力的锁定-进球线路', '动作的锁定-试击', '锁定注意力：看着进球线路，站在进球线的正后方趴下'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    21,
    1,
    21,
    '分离角1(90度分离角训练)',
    '低杆小力走位实例',
    ARRAY['练习不同力量的定杆练习50颗', '练习中杆中力、中低杆中小力、低杆小力各50颗直球定杆'],
    ARRAY['定杆点位(中心偏下一点，克服台尼摩擦力)90°方向分离', '库边特性：入射角=反射角', '定杆：中线点偏下中力'],
    40
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    22,
    1,
    22,
    '分离角2(三种力量配合不同击球点位训练)',
    '定杆点位90°K球前移2-3颗球位K球后移2-3颗球位',
    ARRAY['中杆中力，沿切线90°K球50颗', '将K球向前拿2-3颗球位置，击打母球中心点向上半颗皮头', '将K球向后拿2-3颗球位置，击打母球中心点偏下半颗皮头'],
    ARRAY['中力击打母球中心点偏下一点点，母球会沿着目标球切线的90°方向走', '中力击打母球上半部分，母球会沿着目标球切线的前方走', '中力击打母球下半部分，母球会沿着目标球切线的后方走'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    23,
    1,
    23,
    '分离角3 登杆',
    '直线高登杆(低登杆)练习，母球中心偏上(偏下)一点点位置大力打进目标球后',
    ARRAY['直线高登杆练习50颗', '直线低登杆练习50颗', '左移半颗球位置K球高登杆练习50颗'],
    ARRAY['登杆：击打母球中心偏上或者偏下一点点的位置', '使用中力击打，可以向前或者向后移动2-3个球的位置', '避免力量过小目标球跑偏'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    24,
    1,
    24,
    '走位训练1不吃库走位',
    '低杆(高杆)不吃库走位训练',
    ARRAY['中袋3颗低杆不吃库走位练习，连续成功10次', '中袋3颗推杆不吃库走位练习，连续成功10次'],
    ARRAY['走位的目的：就是要打完第一颗球后，将母球走向更方便击打第二颗球的位置', '分力越大，高低杆法效果越差，不便于走位', '最便于走位的角度是母球与目标球15°'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    25,
    1,
    25,
    '走位训练2一库走位及拓展',
    '底库附近3颗吃一库走位练习',
    ARRAY['底库附近3颗吃一库走位练习，连续成功10组', '拓展训练，置球点循环叫位，利用低杆、高杆、定杆循环练习'],
    ARRAY['母球下一颗球要停在哪里', '进球后90°切线线路在哪里，弹库后线路是否是需要的线路', '考虑击打母球使用多少力量，可以完成吃一库后到该停的位置停下'],
    50
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    26,
    1,
    26,
    '加塞瞄准1(身体与球杆夹角)',
    '加塞瞄准需要调整的2个因素：身体与球杆夹角、目标球角度',
    ARRAY['掌握加塞技术基础', '理解身体与球杆夹角调整', '练习基础加塞瞄准'],
    ARRAY['加塞瞄准原理：击打母球偏左或偏右位置', '身体角度调整：加塞时需要调整身体与球杆的角度', '瞄准补偿：加塞会改变进球角度，需要进行瞄准补偿'],
    50
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    27,
    1,
    27,
    '加塞瞄准2(目标球角度调整)',
    '5分点目标球角度调整训练',
    ARRAY['掌握加塞目标球角度调整', '练习5分点加塞瞄准', '熟练加塞进球技术'],
    ARRAY['5分点理论：将目标球分为5个瞄准点', '加塞角度补偿：左加塞瞄准偏右，右加塞瞄准偏左', '目标球厚薄调整：根据加塞方向调整击球厚薄'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    28,
    1,
    28,
    '角度球加塞瞄准',
    '不同角度下的加塞命中训练',
    ARRAY['角度球加塞技术', '复杂角度瞄准', '加塞命中率提升'],
    ARRAY['角度球加塞原理', '复杂角度瞄准技巧', '加塞与角度的配合'],
    50
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    29,
    1,
    29,
    '加塞走位(顺塞)',
    '顺旋转方向下的母球控制',
    ARRAY['顺塞走位技术', '母球旋转控制', '走位路线规划'],
    ARRAY['顺塞原理：与母球旋转方向一致', '顺塞走位效果', '旋转与走位的配合'],
    45
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_days (id, program_id, day, title, description, objectives, key_points, estimated_duration) VALUES (
    30,
    1,
    30,
    '加塞走位(反塞)',
    '反旋转方向下的母球控制',
    ARRAY['反塞走位技术', '反向旋转控制', '高级走位技巧'],
    ARRAY['反塞原理：与母球旋转方向相反', '反塞走位难度', '高级旋转控制技术'],
    50
  ) ON CONFLICT (id) DO NOTHING;

-- Training Sessions (13 records)
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    14,
    '1',
    1,
    1,
    '第1集：握杆',
    NULL,
    '要解决入位的问题，身体重心不稳',
    1940,
    4,
    true,
    'guided',
    '1. 技术建议：调整握杆力度，确保手腕放松，以增强杆头控制；练习站姿，让双脚平行且稳定，以提升身体重心的稳定性。
2. 下次训练重点：专注于站姿和步伐，练习保持身体中心稳定，结合不同击球力度进行训练。
3. 鼓励总结：继续保持良好的训练习惯，你已经在正确的轨道上，加油，离完美的击球更进一步！',
    '2025-06-06T06:57:22.721Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    15,
    '1',
    1,
    2,
    '第2集：手架',
    NULL,
    '后手好多了',
    1371,
    4,
    true,
    'guided',
    '1. 技术建议：继续加强手架稳定性，特别是手指的控制力度和角度，以确保出杆的精准性。
2. 下次训练重点：专注于复杂球局中的手架运用，提高在不同情况下的适应能力。
3. 鼓励总结：后手进步显著，继续保持专注，精益求精，你会越来越接近完美的手感。加油！',
    '2025-06-07T03:40:24.535Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    16,
    '1',
    1,
    3,
    '第3集：站位与姿势',
    NULL,
    '还在调整站姿，重心放右脚还是有问题，右脚膝盖不舒服',
    39,
    4,
    true,
    'guided',
    '1. 技术建议：确保站姿时两脚平行，重心均匀分布。尝试微调右脚位置以减少膝盖压力，保持身体放松。
2. 下次重点：专注于重心调整和膝盖舒适度，逐渐增加站姿稳定性练习。
3. 鼓励总结：调整姿势需要时间，坚持下去，你会看到明显进步。继续保持积极态度，加油！',
    '2025-06-08T04:38:01.350Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    17,
    '1',
    NULL,
    NULL,
    '准度特训',
    NULL,
    '越练习发力会越好',
    967,
    5,
    true,
    'special',
    '1. 技术建议：专注于击球时的稳定性，确保每次出杆的一致性，从而提高准度。
2. 下次训练重点：尝试在不同角度和力度下进行击球，增强多样化的控球能力。
3. 鼓励性总结：你的努力显著提升了技术水平，继续保持这种专注度，未来一定会更进一步！',
    '2025-06-09T07:25:30.267Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    18,
    '1',
    1,
    4,
    '第4集：入位与节奏',
    NULL,
    '后手不稳',
    10,
    5,
    true,
    'guided',
    '1. 技术建议：加强后手控制，练习通过放松肩膀和手腕来提高击球稳定性。
2. 下次训练重点：专注于后手稳定性练习，逐步增加击球力量和节奏的变化。
3. 鼓励总结：你的节奏掌握已经很出色，坚持下去，优化后手技术将使表现更上一层楼！',
    '2025-06-16T11:15:55.266Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    19,
    '1',
    1,
    5,
    '第5集：空杆与击球',
    NULL,
    '出杆不直',
    12,
    5,
    true,
    'guided',
    '技术建议：出杆不直可能是握杆不稳或站姿不对。确保握杆放松，站姿稳定，保持身体平衡。

下次训练重点：专注于加强出杆的稳定性，练习时可借助镜子观察体态，确保出杆路径正确。

鼓励性总结：保持自信，你在出杆方面已经有了很好的基础，继续努力，你会看到更大的进步。',
    '2025-06-18T06:06:23.860Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    20,
    '31581595',
    NULL,
    NULL,
    '自主训练',
    '根据个人需要进行针对性练习',
    NULL,
    NULL,
    1,
    true,
    'custom',
    NULL,
    '2025-06-18T11:37:40.867Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    21,
    '31581595',
    1,
    6,
    '第6集：初级瞄准',
    '空杆练习20次，击球练习20组',
    '后手',
    18,
    3,
    true,
    'guided',
    '技术建议：专注于瞄准时的站姿和出杆稳定性，确保后手动作流畅，避免用力过猛影响准度。

下次训练重点：重点练习瞄准线的准确性和后手控球力，增加不同角度的击球练习。

鼓励性总结：保持耐心，瞄准是提高击球精准度的关键，相信通过持续练习，你会看到显著进步！',
    '2025-06-18T15:21:21.073Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    22,
    '31581595',
    NULL,
    NULL,
    '自主训练',
    '根据个人需要进行针对性练习',
    '后手不稳',
    7,
    5,
    true,
    'custom',
    '1. 技术建议：练习稳定的后手姿势，专注于握杆的力度和手腕的稳定性，使用缓慢击球来提升控制。
2. 下次训练重点：加强后手稳定性练习，增加推杆练习时间，确保动作流畅。
3. 鼓励总结：保持自信，你的自我评分显示出对自己表现的认可。继续专注练习，稳定性会逐步提升。',
    '2025-06-19T00:47:41.027Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    23,
    '31581595',
    NULL,
    NULL,
    '自主训练',
    '根据个人需要进行针对性练习',
    'test',
    7,
    4,
    true,
    'custom',
    '1. 技术建议：在短时间内专注于提高击球的准确性和稳定性，可以通过练习单一球路来强化基本功。
2. 下次训练重点：增加训练时长至15分钟，以便更深入地练习不同的击球技巧和战术思考。
3. 鼓励性总结：保持良好的自我评价意识，继续努力，你的专注和坚持将带来更大的进步。',
    '2025-06-19T00:53:23.541Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    24,
    '31581595',
    1,
    7,
    '第7集：初级发力平顺度 低杆',
    '低杆练习，稍有角度',
    '后手不稳',
    5,
    4,
    true,
    'guided',
    '1. 技术建议：练习时专注于握杆的稳定性，尤其是在击球过程中保持手腕放松，注意击球时的手臂平滑运动，以增强低杆控制。

2. 下次训练重点：专注于击球时的手腕和后臂的协调性练习，尝试在不影响精准度的情况下逐步增加击球力度。

3. 鼓励总结：你的自我评分反映出进步空间，保持积极心态，持续练习稳定性，你将看到显著提升！',
    '2025-06-19T00:56:23.803Z',
    NULL
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    25,
    '31581595',
    NULL,
    NULL,
    '特训',
    '专注于力度和准度的针对性训练',
    '打球慢下来，去体会球杆的速度，体会关节的活动，不要想着发力',
    2245,
    5,
    true,
    'custom',
    '1. 技术建议：注意击球时的稳定性，尤其是出杆的直线度，保持身体重心不变。
2. 下次训练重点：专注于不同力度的控制，尝试在不同距离下精确击球。
3. 鼓励总结：保持专注与耐心，你的用心体会将逐渐转化为精准的技术，加油！',
    '2025-06-19T04:42:01.294Z',
    '2025-06-19T04:42:01.135Z'
  ) ON CONFLICT (id) DO NOTHING;
INSERT INTO training_sessions (id, user_id, program_id, day_id, title, description, notes, duration, rating, completed, session_type, ai_feedback, created_at, completed_at) VALUES (
    26,
    '31581595',
    NULL,
    NULL,
    '自主训练',
    '根据个人需要进行针对性练习',
    '后手',
    7,
    4,
    true,
    'custom',
    '1. 技术建议：专注于后手击球的稳定性，确保手腕放松，击球时保持平稳的节奏和力度。

2. 下次训练重点：增加后手击球的精准度练习，尝试不同力度和角度的变化。

3. 鼓励总结：保持良好表现，持续努力，你在后手技术上的进步会让整体水平更上一层楼！',
    '2025-06-29T14:06:53.779Z',
    '2025-06-29T14:06:53.614Z'
  ) ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('training_sessions_id_seq', (SELECT MAX(id) FROM training_sessions));
SELECT setval('training_programs_id_seq', (SELECT MAX(id) FROM training_programs));

