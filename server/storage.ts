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
    // Create default user with consistent experience system
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "liangqi",
      level: 10, // Corrected: 9000 XP = level 10 (9000/1000 + 1)
      exp: 9000,
      streak: 100,
      totalDays: 365,
      completedTasks: 411,
      totalTime: 15000, // 250 hours in minutes
      achievements: ["新手上路", "坚持不懈", "进步神速", "专注训练", "完美主义者", "台球大师", "铁杆粉丝", "时间管理大师", "传奇选手"],
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
        id: this.currentAchievementId++,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        condition: achievement.condition,
        expReward: achievement.expReward || 0,
        category: achievement.category,
        unlocked: achievement.unlocked || false,
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
      id: this.currentUserId++,
      username: insertUser.username,
      level: insertUser.level || 1,
      exp: insertUser.exp || 0,
      streak: insertUser.streak || 0,
      totalDays: insertUser.totalDays || 0,
      completedTasks: insertUser.completedTasks || 0,
      totalTime: insertUser.totalTime || 0,
      achievements: insertUser.achievements || [],
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
    const task: Task = { 
      id: this.currentTaskId++,
      level: insertTask.level || 1,
      title: insertTask.title,
      description: insertTask.description,
      difficulty: insertTask.difficulty,
      imageUrl: insertTask.imageUrl || null,
      category: insertTask.category
    };
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
      id: this.currentUserTaskId++,
      userId: insertUserTask.userId,
      taskId: insertUserTask.taskId,
      rating: insertUserTask.rating || null,
      completed: insertUserTask.completed || false,
      completedAt: insertUserTask.completedAt || null,
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
      id: this.currentDiaryId++,
      userId: insertEntry.userId,
      content: insertEntry.content,
      date: insertEntry.date || new Date(),
      imageUrl: insertEntry.imageUrl || null,
      rating: insertEntry.rating || null,
      duration: insertEntry.duration || null,
      createdAt: new Date(),
    };
    this.diaryEntries.set(entry.id, entry);
    return entry;
  }

  // Feedback operations
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.currentFeedbackId++,
      userId: insertFeedback.userId,
      content: insertFeedback.content,
      date: insertFeedback.date || new Date(),
      taskId: insertFeedback.taskId || null,
      rating: insertFeedback.rating || null,
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
      id: this.currentTrainingSessionId++,
      userId: insertSession.userId,
      programId: insertSession.programId || null,
      dayId: insertSession.dayId || null,
      title: insertSession.title,
      description: insertSession.description || null,
      notes: insertSession.notes || null,
      duration: insertSession.duration || null,
      rating: insertSession.rating || null,
      completed: insertSession.completed || false,
      sessionType: insertSession.sessionType || "custom",
      createdAt: new Date(),
      completedAt: insertSession.completedAt || null
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
    return Array.from(this.trainingNotes.values()).filter(note => note.sessionId !== undefined);
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

    for (const achievement of Array.from(this.achievements.values())) {
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
