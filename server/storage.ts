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

    // Training days data for the 51-day program
    const trainingDaysData = [
      { day: 1, title: "握杆", description: "握杆姿势稳定、力度适中、手掌与手指配合", objectives: ["掌握正确握杆姿势", "培养稳定握杆力度", "协调手掌与手指配合"], keyPoints: ["握杆不宜过紧", "手腕保持灵活", "握杆位置标准"], estimatedDuration: 30 },
      { day: 2, title: "手架", description: "学习开放式与封闭式手架", objectives: ["掌握开放式手架", "学会封闭式手架", "选择合适手架类型"], keyPoints: ["手架稳定性", "高度适中", "支撑平衡"], estimatedDuration: 30 },
      { day: 3, title: "站位与姿势", description: "强调身体重心、双脚角度与球杆角度协调", objectives: ["建立正确站位", "掌握身体重心", "协调整体姿势"], keyPoints: ["双脚间距", "身体平衡", "视线对准"], estimatedDuration: 35 },
      { day: 4, title: "入位与击球节奏", description: "建立连续击球节奏与出杆一致性", objectives: ["培养击球节奏", "提升出杆一致性", "建立肌肉记忆"], keyPoints: ["节奏控制", "动作连贯", "力度统一"], estimatedDuration: 35 },
      { day: 5, title: "空杆与节奏巩固", description: "运杆的连贯性与节奏感训练", objectives: ["强化运杆技术", "巩固击球节奏", "提升动作流畅性"], keyPoints: ["空杆练习", "节奏感培养", "动作标准化"], estimatedDuration: 30 },
      
      { day: 6, title: "初级瞄准", description: "用球杆与目标球连线进行准心校正", objectives: ["掌握瞄准基础", "学会准心校正", "提升击球精度"], keyPoints: ["视线对准", "瞄准线判断", "目标球选择"], estimatedDuration: 40 },
      { day: 7, title: "低杆训练", description: "掌握低杆出杆方式，控制母球停顿", objectives: ["学会低杆技术", "控制母球回拉", "掌握力度分配"], keyPoints: ["击球点位", "出杆角度", "力度控制"], estimatedDuration: 40 },
      { day: 8, title: "穿透力训练", description: "通过增加手肘力量提升出杆穿透力", objectives: ["增强出杆力量", "提升穿透效果", "稳定发力方式"], keyPoints: ["手肘发力", "穿透性", "力量传递"], estimatedDuration: 35 },
      { day: 9, title: "初级预力控制", description: "控制母球的停球距离与力度", objectives: ["掌握力度控制", "预判停球位置", "提升控球精度"], keyPoints: ["力度分级", "距离预判", "控制精度"], estimatedDuration: 40 },
      { day: 10, title: "中级预力1", description: "试击法判断击球力量", objectives: ["学会试击法", "提升力量判断", "增强球感"], keyPoints: ["试击技巧", "力量评估", "球感培养"], estimatedDuration: 40 },
      
      { day: 11, title: "中级预力2", description: "低杆结合中力控制", objectives: ["低杆力度配合", "中等力度掌握", "综合技术运用"], keyPoints: ["杆法结合", "力度层次", "技术融合"], estimatedDuration: 45 },
      { day: 12, title: "翻腕训练", description: "增强出杆时手腕的稳定性", objectives: ["强化手腕控制", "提升出杆稳定性", "减少手腕晃动"], keyPoints: ["手腕固定", "出杆直线", "稳定性"], estimatedDuration: 35 },
      { day: 13, title: "满弓训练", description: "提升出杆完整性与发力一致性", objectives: ["完整出杆动作", "发力一致性", "动作连贯性"], keyPoints: ["满弓动作", "发力完整", "动作流畅"], estimatedDuration: 40 },
      { day: 14, title: "分段发力1（中低杆）", description: "在长台中低杆下做分段出杆", objectives: ["学会分段发力", "掌握中低杆", "适应长台距离"], keyPoints: ["分段技巧", "中低杆位", "长台控制"], estimatedDuration: 45 },
      { day: 15, title: "分段发力2（低杆）", description: "学习长距离低杆下的力量控制", objectives: ["长距离低杆", "力量精确控制", "回拉效果"], keyPoints: ["长台低杆", "力量分配", "回拉距离"], estimatedDuration: 45 },
      
      { day: 16, title: "分段发力3（极限低杆点位）", description: "提升控制极限点的能力", objectives: ["极限低杆掌握", "精确点位控制", "技术极限突破"], keyPoints: ["极限点位", "精确控制", "技术难度"], estimatedDuration: 50 },
      { day: 17, title: "直球5分点训练", description: "对目标球进行5个点位练习", objectives: ["5分点精度", "直球准确性", "稳定性提升"], keyPoints: ["5分点位", "直球技术", "准确度"], estimatedDuration: 45 },
      { day: 18, title: "初级瞄准1（假想球）", description: "使用假想球辅助进球判断", objectives: ["假想球概念", "进球路线判断", "瞄准辅助技巧"], keyPoints: ["假想球法", "路线判断", "瞄准辅助"], estimatedDuration: 40 },
      { day: 19, title: "初级瞄准2（向边球）", description: "击打靠近边库的目标球训练", objectives: ["边库球处理", "角度调整", "特殊位置瞄准"], keyPoints: ["边库技巧", "角度把握", "位置适应"], estimatedDuration: 40 },
      { day: 20, title: "初级瞄准3（离边球）", description: "控制母球在靠近边库环境下进攻", objectives: ["边库环境适应", "母球控制", "进攻策略"], keyPoints: ["环境适应", "母球走位", "进攻技巧"], estimatedDuration: 45 },
      
      { day: 21, title: "中袋球训练", description: "提高中袋进球成功率", objectives: ["中袋技术掌握", "成功率提升", "角度计算"], keyPoints: ["中袋角度", "进球技巧", "成功率"], estimatedDuration: 40 },
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
