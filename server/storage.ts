import { users, tasks, userTasks, diaryEntries, feedbacks, trainingPrograms, trainingDays, trainingSessions, trainingNotes, achievements, userAchievements, type User, type InsertUser, type Task, type InsertTask, type UserTask, type InsertUserTask, type DiaryEntry, type InsertDiaryEntry, type Feedback, type InsertFeedback, type TrainingProgram, type InsertTrainingProgram, type TrainingDay, type InsertTrainingDay, type TrainingSession, type InsertTrainingSession, type TrainingNote, type InsertTrainingNote, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserStreak(userId: number): Promise<User>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTasksByLevel(level: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  
  // User task operations
  getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]>;
  getTodayUserTasks(userId: number): Promise<(UserTask & { task: Task })[]>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  completeUserTask(id: number, rating: number): Promise<UserTask>;
  
  // Diary operations
  getDiaryEntries(userId: number): Promise<DiaryEntry[]>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedbacks(userId: number): Promise<Feedback[]>;
  
  // Training program operations
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgram(id: number): Promise<TrainingProgram | undefined>;
  updateTrainingProgram(id: number, updates: Partial<TrainingProgram>): Promise<TrainingProgram>;
  getTrainingDays(programId: number): Promise<TrainingDay[]>;
  getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined>;
  
  // Training session operations
  getUserTrainingSessions(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay })[]>;
  getCurrentTrainingSession(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined>;
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<TrainingSession>;
  completeTrainingSession(id: number, duration: number, rating: number, notes?: string): Promise<TrainingSession>;
  
  // Training note operations
  getTrainingNotes(sessionId: number): Promise<TrainingNote[]>;
  getAllTrainingNotes(userId: number): Promise<TrainingNote[]>;
  createTrainingNote(note: InsertTrainingNote): Promise<TrainingNote>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  updateAchievementProgress(userId: number, achievementId: number, progress: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userTasks: Map<number, UserTask>;
  private diaryEntries: Map<number, DiaryEntry>;
  private feedbacks: Map<number, Feedback>;
  private trainingPrograms: Map<number, TrainingProgram>;
  private trainingDays: Map<number, TrainingDay>;
  private trainingSessions: Map<number, TrainingSession>;
  private trainingNotes: Map<number, TrainingNote>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  
  private currentUserId: number;
  private currentTaskId: number;
  private currentUserTaskId: number;
  private currentDiaryId: number;
  private currentFeedbackId: number;
  private currentTrainingProgramId: number;
  private currentTrainingDayId: number;
  private currentTrainingSessionId: number;
  private currentTrainingNoteId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userTasks = new Map();
    this.diaryEntries = new Map();
    this.feedbacks = new Map();
    this.trainingPrograms = new Map();
    this.trainingDays = new Map();
    this.trainingSessions = new Map();
    this.trainingNotes = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentUserTaskId = 1;
    this.currentDiaryId = 1;
    this.currentFeedbackId = 1;
    this.currentTrainingProgramId = 1;
    this.currentTrainingDayId = 1;
    this.currentTrainingSessionId = 1;
    this.currentTrainingNoteId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "liangqi",
      level: 9,
      exp: 9000,
      streak: 100,
      totalDays: 365,
      completedTasks: 411,
      totalTime: 15000, // 250 hours in minutes
      achievements: ["新手上路", "连续打卡", "精准射手", "大师级", "完美主义者", "专业选手"],
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create daily training tasks - completely independent from level assessment exercises
    const defaultTasks: Omit<Task, 'id'>[] = [
      {
        title: "出杆节奏训练",
        description: "专注练习稳定的出杆节奏，提高击球的一致性和准确度。重点掌握出杆前的停顿和发力时机。",
        level: 2,
        difficulty: "中级",
        category: "基本功训练",
        imageUrl: null
      },
      {
        title: "瞄准线练习",
        description: "通过反复练习来强化瞄准线的判断能力，提升击球精度。练习不同角度和距离的瞄准。",
        level: 3,
        difficulty: "中级",
        category: "瞄准技巧",
        imageUrl: null
      },
      {
        title: "白球控制专项",
        description: "专门训练白球的走位控制，包括停球、跟进和拉杆等技术的综合应用。",
        level: 4,
        difficulty: "高级",
        category: "走位控制",
        imageUrl: null
      },
      {
        title: "杆法综合训练",
        description: "综合练习高杆、低杆、侧旋等各种杆法，提升技术的全面性和实战应用能力。",
        level: 5,
        difficulty: "高级",
        category: "杆法技巧",
        imageUrl: null
      },
      {
        title: "球感培养专项",
        description: "通过专门的练习来培养和提升球感，增强对球的感知和控制能力。",
        level: 3,
        difficulty: "中级",
        category: "球感训练",
        imageUrl: null
      },
      {
        title: "心理素质训练",
        description: "在练习中注重心理素质的培养，提高比赛中的心理稳定性和抗压能力。",
        level: 4,
        difficulty: "高级",
        category: "心理训练",
        imageUrl: null
      }
    ];

    defaultTasks.forEach(task => {
      const newTask: Task = { ...task, id: this.currentTaskId++ };
      this.tasks.set(newTask.id, newTask);
    });

    // Create sample diary entry
    const sampleDiary: DiaryEntry = {
      id: this.currentDiaryId++,
      userId: 1,
      content: "今天主要练习了直线击球，感觉握杆的稳定性有了明显提升。瞄准时需要更加专注，不能急于出杆。",
      duration: 60,
      rating: 4,
      imageUrl: null,
      date: new Date(),
      createdAt: new Date(),
    };
    this.diaryEntries.set(sampleDiary.id, sampleDiary);

    // Initialize training programs and achievements
    this.initializeTrainingPrograms();
    this.initializeAchievements();
  }

  private initializeTrainingPrograms() {
    // Create the 30-day beginner program
    const beginnerProgram: TrainingProgram = {
      id: this.currentTrainingProgramId++,
      name: "耶氏台球学院系统教学",
      description: "为期30集的系统化台球基础训练计划，从握杆、站位到实战清台的全面指导",
      totalDays: 30,
      currentDay: 1,
      difficulty: "新手",
      createdAt: new Date()
    };
    this.trainingPrograms.set(beginnerProgram.id, beginnerProgram);

    // Training days data for the 30-episode program based on authentic content
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
      { day: 22, title: "极限薄球训练", description: "训练极限角度进球准确性", objectives: ["薄球技术", "极限角度", "精确控制"], keyPoints: ["薄球处理", "极限技巧", "精度要求"], estimatedDuration: 45 },
      { day: 23, title: "中级瞄准（锁定进球点）", description: "学习如何精准选点", objectives: ["精准选点", "进球点锁定", "瞄准升级"], keyPoints: ["选点技巧", "进球点", "瞄准精度"], estimatedDuration: 45 },
      { day: 24, title: "分离角1（90度）", description: "90度母球目标球分离角训练", objectives: ["90度分离角", "角度控制", "分离技术"], keyPoints: ["分离角度", "90度控制", "技术要点"], estimatedDuration: 45 },
      { day: 25, title: "分离角2（三力组合）", description: "分离角+停球+旋转协调训练", objectives: ["三力组合", "技术协调", "综合运用"], keyPoints: ["力量组合", "技术协调", "综合控制"], estimatedDuration: 50 },
      
      { day: 26, title: "分离角3 登杆", description: "学习击打登杆球的母球路线控制", objectives: ["登杆技术", "路线控制", "高级技巧"], keyPoints: ["登杆要领", "路线规划", "控制技术"], estimatedDuration: 50 },
      { day: 27, title: "走位训练1 不吃库", description: "母球不靠库完成走位任务", objectives: ["基础走位", "不吃库技术", "位置控制"], keyPoints: ["走位基础", "库边避免", "位置精确"], estimatedDuration: 45 },
      { day: 28, title: "走位训练2 一库拓展", description: "使用一库进行母球走位延伸", objectives: ["一库走位", "技术拓展", "路线延伸"], keyPoints: ["一库技巧", "走位拓展", "路线规划"], estimatedDuration: 50 },
      { day: 29, title: "加塞瞄准1（身体与球杆夹角）", description: "建立出杆角度感知", objectives: ["加塞基础", "角度感知", "身体协调"], keyPoints: ["加塞要领", "角度感知", "身体配合"], estimatedDuration: 45 },
      { day: 30, title: "加塞瞄准2（5分点训练）", description: "加塞下的目标球角度调整", objectives: ["加塞瞄准", "角度调整", "5分点应用"], keyPoints: ["加塞瞄准", "角度补偿", "点位应用"], estimatedDuration: 50 },
      
      { day: 31, title: "角度球加塞瞄准", description: "不同角度下的加塞命中训练", objectives: ["角度球加塞", "命中率提升", "综合应用"], keyPoints: ["角度配合", "加塞应用", "命中技巧"], estimatedDuration: 50 },
      { day: 32, title: "加塞走位（顺塞）", description: "顺旋转方向下的母球控制", objectives: ["顺塞技术", "母球控制", "旋转应用"], keyPoints: ["顺塞要领", "旋转控制", "走位效果"], estimatedDuration: 50 },
      { day: 33, title: "加塞走位（反塞）", description: "反旋转方向下的母球控制", objectives: ["反塞技术", "反向控制", "高级走位"], keyPoints: ["反塞技巧", "反向旋转", "控制难度"], estimatedDuration: 55 },
      { day: 34, title: "清台思路", description: "如何规划整局球的击打顺序", objectives: ["清台规划", "顺序安排", "战术思维"], keyPoints: ["整体规划", "顺序选择", "战术布局"], estimatedDuration: 45 },
      { day: 35, title: "实战清台1", description: "模拟实战完成一局", objectives: ["实战演练", "完整一局", "技术综合"], keyPoints: ["实战应用", "完整流程", "技术整合"], estimatedDuration: 60 },
      
      { day: 36, title: "实战清台2", description: "模拟实战完成第二局", objectives: ["实战强化", "技术巩固", "经验积累"], keyPoints: ["技术巩固", "实战经验", "水平提升"], estimatedDuration: 60 },
      { day: 37, title: "实战清台3", description: "实战复盘分析错误点", objectives: ["复盘分析", "错误总结", "改进方向"], keyPoints: ["错误分析", "技术改进", "水平诊断"], estimatedDuration: 55 },
      { day: 38, title: "实战清台4", description: "多球走位配合练习", objectives: ["多球配合", "走位连贯", "整体协调"], keyPoints: ["连续走位", "配合技巧", "整体控制"], estimatedDuration: 60 },
      { day: 39, title: "实战清台5", description: "限时完成清台任务", objectives: ["时间压力", "效率提升", "心理素质"], keyPoints: ["时间控制", "效率优化", "压力适应"], estimatedDuration: 55 },
      { day: 40, title: "实战清台6", description: "加塞结合实战清台", objectives: ["高级技术", "实战结合", "技术升级"], keyPoints: ["加塞实战", "技术结合", "水平突破"], estimatedDuration: 65 },
      
      { day: 41, title: "课外训练（弧线球）", description: "学习弧线球的原理与练习", objectives: ["弧线球理论", "实际练习", "特殊技巧"], keyPoints: ["弧线原理", "实践操作", "技巧掌握"], estimatedDuration: 50 },
      { day: 42, title: "白球分离角原理解读", description: "理论分析母球运行角度", objectives: ["理论学习", "角度分析", "科学理解"], keyPoints: ["理论基础", "角度原理", "科学分析"], estimatedDuration: 45 },
      { day: 43, title: "清台思路讲解", description: "多路径思路拆解与选择练习", objectives: ["思路拆解", "路径选择", "决策能力"], keyPoints: ["思路分析", "路径规划", "决策训练"], estimatedDuration: 50 },
      { day: 44, title: "激活肌肉状态1", description: "击球前肩膀、手肘激活", objectives: ["肌肉激活", "身体准备", "状态调整"], keyPoints: ["肩膀激活", "手肘准备", "肌肉状态"], estimatedDuration: 30 },
      { day: 45, title: "激活肌肉状态2", description: "下肢、腰部协调热身", objectives: ["下肢激活", "腰部协调", "整体热身"], keyPoints: ["下肢准备", "腰部协调", "身体热身"], estimatedDuration: 30 },
      
      { day: 46, title: "激活肌肉状态3", description: "握杆相关肌肉动态激活", objectives: ["握杆肌肉", "动态激活", "精细控制"], keyPoints: ["握杆准备", "肌肉激活", "精细动作"], estimatedDuration: 30 },
      { day: 47, title: "激活肌肉状态4", description: "肩部灵活度训练", objectives: ["肩部灵活", "活动范围", "柔韧提升"], keyPoints: ["肩部训练", "灵活度", "活动能力"], estimatedDuration: 35 },
      { day: 48, title: "激活肌肉状态5", description: "腕力增强训练", objectives: ["腕力强化", "稳定性提升", "控制能力"], keyPoints: ["腕力训练", "稳定控制", "力量增强"], estimatedDuration: 35 },
      { day: 49, title: "激活肌肉状态6", description: "全身协调感应练习", objectives: ["全身协调", "感应训练", "整体配合"], keyPoints: ["整体协调", "感应能力", "配合训练"], estimatedDuration: 40 },
      { day: 50, title: "掌握出杆节奏1", description: "借助节奏提升精准度（慢-快-慢）", objectives: ["节奏掌握", "精准度提升", "节奏控制"], keyPoints: ["节奏变化", "精准提升", "控制技巧"], estimatedDuration: 45 },
      { day: 51, title: "掌握出杆节奏2", description: "强化击球节奏与心理专注度", objectives: ["节奏强化", "心理专注", "综合提升"], keyPoints: ["节奏巩固", "专注训练", "综合素质"], estimatedDuration: 50 }
    ];

    // Create training days
    trainingDaysData.forEach(dayData => {
      const trainingDay: TrainingDay = {
        id: this.currentTrainingDayId++,
        programId: beginnerProgram.id,
        day: dayData.day,
        title: dayData.title,
        description: dayData.description,
        objectives: dayData.objectives,
        keyPoints: dayData.keyPoints || [],
        estimatedDuration: dayData.estimatedDuration
      };
      this.trainingDays.set(trainingDay.id, trainingDay);
    });

    // Create current training session for the user
    const currentSession: TrainingSession = {
      id: this.currentTrainingSessionId++,
      userId: 1,
      programId: beginnerProgram.id,
      dayId: Array.from(this.trainingDays.values()).find(d => d.day === 1)?.id || null,
      title: "第1集：握杆",
      description: "握杆姿势稳定、力度适中、手掌与手指配合",
      notes: null,
      duration: null,
      rating: null,
      completed: false,
      sessionType: "guided",
      createdAt: new Date(),
      completedAt: null
    };
    this.trainingSessions.set(currentSession.id, currentSession);
  }

  private initializeAchievements() {
    // Predefined achievements with unlock conditions
    const defaultAchievements: InsertAchievement[] = [
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
        expReward: 150,
        category: "intermediate",
        unlocked: false
      },
      {
        name: "完美主义者",
        description: "获得5次5星评价",
        icon: "⭐",
        type: "rating",
        condition: { type: "five_star_rating", target: 5 },
        expReward: 250,
        category: "intermediate",
        unlocked: false
      },
      {
        name: "台球大师",
        description: "完成所有30集训练",
        icon: "👑",
        type: "training",
        condition: { type: "complete_program", target: 30 },
        expReward: 500,
        category: "advanced",
        unlocked: false
      },
      {
        name: "铁杆粉丝",
        description: "连续训练30天",
        icon: "🏆",
        type: "streak",
        condition: { type: "daily_streak", target: 30 },
        expReward: 800,
        category: "advanced",
        unlocked: false
      },
      {
        name: "时间管理大师",
        description: "累计训练时长达到100小时",
        icon: "⌚",
        type: "time",
        condition: { type: "total_time", target: 6000 },
        expReward: 600,
        category: "advanced",
        unlocked: false
      },
      {
        name: "传奇选手",
        description: "达到10级",
        icon: "🌟",
        type: "level",
        condition: { type: "reach_level", target: 10 },
        expReward: 1000,
        category: "master",
        unlocked: false
      },
      {
        name: "终极挑战者",
        description: "完成所有等级练习",
        icon: "💎",
        type: "level",
        condition: { type: "complete_all_levels", target: 8 },
        expReward: 1500,
        category: "master",
        unlocked: false
      }
    ];

    defaultAchievements.forEach(achievement => {
      const newAchievement: Achievement = { 
        ...achievement, 
        id: this.currentAchievementId++,
        createdAt: new Date()
      };
      this.achievements.set(newAchievement.id, newAchievement);
    });

    // Initialize some user achievements for the default user
    const userAchievementData = [
      { achievementId: 1, progress: 1, completed: true },  // 新手上路
      { achievementId: 2, progress: 3, completed: true },  // 坚持不懈
      { achievementId: 3, progress: 8, completed: false }, // 进步神速
      { achievementId: 5, progress: 3, completed: false }  // 完美主义者
    ];

    userAchievementData.forEach(data => {
      const userAchievement: UserAchievement = {
        id: this.currentUserAchievementId++,
        userId: 1,
        achievementId: data.achievementId,
        progress: data.progress,
        completed: data.completed,
        unlockedAt: new Date()
      };
      this.userAchievements.set(userAchievement.id, userAchievement);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, lastActiveAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(userId: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const today = new Date();
    const lastActive = new Date(user.lastActiveAt);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = user.streak;
    if (daysDiff === 1) {
      newStreak = user.streak + 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }
    
    return this.updateUser(userId, { 
      streak: newStreak,
      totalDays: daysDiff > 0 ? user.totalDays + 1 : user.totalDays 
    });
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByLevel(level: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.level <= level);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const task: Task = { ...insertTask, id: this.currentTaskId++ };
    this.tasks.set(task.id, task);
    return task;
  }

  // User task operations
  async getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    const userTasksArray = Array.from(this.userTasks.values()).filter(ut => ut.userId === userId);
    return userTasksArray.map(ut => ({
      ...ut,
      task: this.tasks.get(ut.taskId)!
    }));
  }

  async getTodayUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const userTasksArray = Array.from(this.userTasks.values()).filter(ut => 
      ut.userId === userId && 
      new Date(ut.createdAt).getTime() >= today.getTime()
    );
    
    // If no tasks for today, create 3 random tasks
    if (userTasksArray.length === 0) {
      const user = this.users.get(userId);
      if (!user) throw new Error("User not found");
      
      const availableTasks = await this.getTasksByLevel(user.level);
      const shuffled = availableTasks.sort(() => 0.5 - Math.random());
      const selectedTasks = shuffled.slice(0, 3);
      
      for (const task of selectedTasks) {
        const userTask: UserTask = {
          id: this.currentUserTaskId++,
          userId,
          taskId: task.id,
          rating: null,
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        };
        this.userTasks.set(userTask.id, userTask);
        userTasksArray.push(userTask);
      }
    }
    
    return userTasksArray.map(ut => ({
      ...ut,
      task: this.tasks.get(ut.taskId)!
    }));
  }

  async createUserTask(insertUserTask: InsertUserTask): Promise<UserTask> {
    const userTask: UserTask = {
      ...insertUserTask,
      id: this.currentUserTaskId++,
      createdAt: new Date(),
    };
    this.userTasks.set(userTask.id, userTask);
    return userTask;
  }

  async completeUserTask(id: number, rating: number): Promise<UserTask> {
    const userTask = this.userTasks.get(id);
    if (!userTask) throw new Error("User task not found");
    
    const updatedUserTask = {
      ...userTask,
      completed: true,
      rating,
      completedAt: new Date(),
    };
    this.userTasks.set(id, updatedUserTask);
    
    // Update user stats
    const user = this.users.get(userTask.userId);
    if (user) {
      await this.updateUser(user.id, {
        exp: user.exp + (rating * 5), // 5 exp per star
        completedTasks: user.completedTasks + 1,
      });
    }
    
    return updatedUserTask;
  }

  // Diary operations
  async getDiaryEntries(userId: number): Promise<DiaryEntry[]> {
    return Array.from(this.diaryEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createDiaryEntry(insertEntry: InsertDiaryEntry): Promise<DiaryEntry> {
    const entry: DiaryEntry = {
      ...insertEntry,
      id: this.currentDiaryId++,
      createdAt: new Date(),
    };
    this.diaryEntries.set(entry.id, entry);
    return entry;
  }

  // Feedback operations
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      ...insertFeedback,
      id: this.currentFeedbackId++,
    };
    this.feedbacks.set(feedback.id, feedback);
    return feedback;
  }

  async getUserFeedbacks(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Training program operations
  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values());
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    return this.trainingPrograms.get(id);
  }

  async updateTrainingProgram(id: number, updates: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const program = this.trainingPrograms.get(id);
    if (!program) {
      throw new Error("Training program not found");
    }
    
    const updatedProgram = { ...program, ...updates };
    this.trainingPrograms.set(id, updatedProgram);
    return updatedProgram;
  }

  async getTrainingDays(programId: number): Promise<TrainingDay[]> {
    return Array.from(this.trainingDays.values()).filter(day => day.programId === programId).sort((a, b) => a.day - b.day);
  }

  async getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined> {
    return Array.from(this.trainingDays.values()).find(d => d.programId === programId && d.day === day);
  }

  // Training session operations
  async getUserTrainingSessions(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay })[]> {
    const sessions = Array.from(this.trainingSessions.values()).filter(session => session.userId === userId);
    return sessions.map(session => ({
      ...session,
      program: session.programId ? this.trainingPrograms.get(session.programId) : undefined,
      day: session.dayId ? this.trainingDays.get(session.dayId) : undefined
    }));
  }

  async getCurrentTrainingSession(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined> {
    const session = Array.from(this.trainingSessions.values()).find(session => session.userId === userId && !session.completed);
    if (!session) return undefined;
    
    return {
      ...session,
      program: session.programId ? this.trainingPrograms.get(session.programId) : undefined,
      day: session.dayId ? this.trainingDays.get(session.dayId) : undefined
    };
  }

  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    return this.trainingSessions.get(id);
  }

  async createTrainingSession(insertSession: InsertTrainingSession): Promise<TrainingSession> {
    const session: TrainingSession = {
      ...insertSession,
      id: this.currentTrainingSessionId++,
      createdAt: new Date(),
      completedAt: null
    };
    this.trainingSessions.set(session.id, session);
    return session;
  }

  async updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<TrainingSession> {
    const session = this.trainingSessions.get(id);
    if (!session) throw new Error("Training session not found");
    
    const updatedSession = { ...session, ...updates };
    this.trainingSessions.set(id, updatedSession);
    return updatedSession;
  }

  async completeTrainingSession(id: number, duration: number, rating: number, notes?: string): Promise<TrainingSession> {
    const session = this.trainingSessions.get(id);
    if (!session) throw new Error("Training session not found");
    
    const updatedSession = {
      ...session,
      duration,
      rating,
      notes: notes || session.notes,
      completed: true,
      completedAt: new Date()
    };
    this.trainingSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Training note operations
  async getTrainingNotes(sessionId: number): Promise<TrainingNote[]> {
    return Array.from(this.trainingNotes.values()).filter(note => note.sessionId === sessionId);
  }

  async getAllTrainingNotes(userId: number): Promise<TrainingNote[]> {
    return Array.from(this.trainingNotes.values()).filter(note => note.userId === userId);
  }

  async createTrainingNote(insertNote: InsertTrainingNote): Promise<TrainingNote> {
    const note: TrainingNote = {
      ...insertNote,
      id: this.currentTrainingNoteId++,
      timestamp: new Date()
    };
    this.trainingNotes.set(note.id, note);
    return note;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).sort((a, b) => a.id - b.id);
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      return {
        ...ua,
        achievement: achievement!
      };
    });
  }

  async checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const unlockedAchievements: UserAchievement[] = [];
    const userSessions = await this.getUserTrainingSessions(userId);
    const completedSessions = userSessions.filter(s => s.completed);

    for (const achievement of this.achievements.values()) {
      // Skip if already unlocked by user
      const existing = Array.from(this.userAchievements.values())
        .find(ua => ua.userId === userId && ua.achievementId === achievement.id);
      
      if (existing?.completed) continue;

      let shouldUnlock = false;
      let progress = 0;

      const condition = achievement.condition as any;
      
      switch (condition.type) {
        case "complete_sessions":
          progress = completedSessions.length;
          shouldUnlock = progress >= condition.target;
          break;
        case "daily_streak":
          progress = user.streak;
          shouldUnlock = progress >= condition.target;
          break;
        case "session_duration":
          const maxDuration = Math.max(...completedSessions.map(s => s.duration || 0));
          progress = maxDuration;
          shouldUnlock = progress >= condition.target;
          break;
        case "five_star_rating":
          const fiveStarCount = completedSessions.filter(s => s.rating === 5).length;
          progress = fiveStarCount;
          shouldUnlock = progress >= condition.target;
          break;
        case "complete_program":
          progress = completedSessions.filter(s => s.sessionType === "guided").length;
          shouldUnlock = progress >= condition.target;
          break;
        case "total_time":
          progress = user.totalTime;
          shouldUnlock = progress >= condition.target;
          break;
        case "reach_level":
          progress = user.level;
          shouldUnlock = progress >= condition.target;
          break;
        case "complete_all_levels":
          // This would need level completion tracking
          progress = 0;
          shouldUnlock = false;
          break;
      }

      if (existing) {
        // Update progress
        existing.progress = progress;
        if (shouldUnlock && !existing.completed) {
          existing.completed = true;
          existing.unlockedAt = new Date();
          unlockedAchievements.push(existing);
        }
        this.userAchievements.set(existing.id, existing);
      } else if (shouldUnlock) {
        // Create new achievement
        const newUserAchievement = await this.unlockAchievement(userId, achievement.id);
        newUserAchievement.progress = progress;
        unlockedAchievements.push(newUserAchievement);
      }
    }

    return unlockedAchievements;
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const userAchievement: UserAchievement = {
      id: this.currentUserAchievementId++,
      userId,
      achievementId,
      progress: 0,
      completed: true,
      unlockedAt: new Date()
    };
    this.userAchievements.set(userAchievement.id, userAchievement);
    
    // Award experience points
    const achievement = this.achievements.get(achievementId);
    if (achievement) {
      const user = await this.getUser(userId);
      if (user) {
        await this.updateUser(userId, {
          exp: user.exp + achievement.expReward
        });
      }
    }
    
    return userAchievement;
  }

  async updateAchievementProgress(userId: number, achievementId: number, progress: number): Promise<void> {
    const userAchievement = Array.from(this.userAchievements.values())
      .find(ua => ua.userId === userId && ua.achievementId === achievementId);
    
    if (userAchievement) {
      userAchievement.progress = progress;
      this.userAchievements.set(userAchievement.id, userAchievement);
    }
  }
}

export const storage = new MemStorage();
