import { users, tasks, userTasks, diaryEntries, feedbacks, trainingPrograms, trainingDays, trainingSessions, trainingNotes, achievements, userAchievements, type User, type InsertUser, type UpsertUser, type Task, type InsertTask, type UserTask, type InsertUserTask, type DiaryEntry, type InsertDiaryEntry, type Feedback, type InsertFeedback, type TrainingProgram, type InsertTrainingProgram, type TrainingDay, type InsertTrainingDay, type TrainingSession, type InsertTrainingSession, type TrainingNote, type InsertTrainingNote, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement, trainingLevels, trainingSkills, subSkills, trainingUnits, userTrainingProgress, specializedTrainings, specializedTrainingPlans, type TrainingLevel, type TrainingSkill, type SubSkill, type TrainingUnit, type UserTrainingProgress as UserTrainingProgressType, type SpecializedTraining, type SpecializedTrainingPlan } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, gte, and, lte, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  // Legacy user operations
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserStreak(userId: string): Promise<User>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTasksByLevel(level: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  
  // User task operations
  getUserTasks(userId: string): Promise<(UserTask & { task: Task })[]>;
  getTodayUserTasks(userId: string): Promise<(UserTask & { task: Task })[]>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  completeUserTask(id: number, rating: number): Promise<UserTask>;
  
  // Diary operations
  getDiaryEntries(userId: string): Promise<DiaryEntry[]>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedbacks(userId: string): Promise<Feedback[]>;
  
  // Training program operations
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgram(id: number): Promise<TrainingProgram | undefined>;
  updateTrainingProgram(id: number, updates: Partial<TrainingProgram>): Promise<TrainingProgram>;
  getTrainingDays(programId: number): Promise<TrainingDay[]>;
  getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined>;
  
  // Training session operations
  getUserTrainingSessions(userId: string): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay })[]>;
  getCurrentTrainingSession(userId: string): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined>;
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<TrainingSession>;
  completeTrainingSession(id: number, duration: number, rating: number, notes?: string): Promise<TrainingSession>;
  deleteTrainingSession(id: number): Promise<void>;
  
  // Training note operations
  getTrainingNotes(sessionId: number): Promise<TrainingNote[]>;
  getAllTrainingNotes(userId: string): Promise<TrainingNote[]>;
  createTrainingNote(note: InsertTrainingNote): Promise<TrainingNote>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<void>;
  initializeAchievements(): Promise<{ inserted: number; skipped: number; message: string }>;

  // === V2.1 Training System Operations ===

  // Training Levels
  getAllTrainingLevels(userId: string): Promise<TrainingLevelWithProgress[]>;
  getTrainingLevelById(levelId: string, userId: string): Promise<TrainingLevelDetail | undefined>;

  // Training Units
  getTrainingUnitById(unitId: string, userId: string): Promise<TrainingUnitDetail | undefined>;

  // User Training Progress
  getUserTrainingProgressByUnit(userId: string, unitId: string): Promise<UserTrainingProgressType | undefined>;
  startTrainingUnit(userId: string, levelId: string, unitId: string): Promise<UserTrainingProgressType>;
  updateTrainingProgress(userId: string, unitId: string, progressData: any): Promise<UserTrainingProgressType>;
  completeTrainingUnit(userId: string, unitId: string, finalProgressData: any): Promise<{ progress: UserTrainingProgressType; xpAwarded: number }>;

  // Specialized Training
  getAllSpecializedTrainings(): Promise<SpecializedTraining[]>;
  getSpecializedTrainingPlans(trainingId: string): Promise<SpecializedTrainingPlan[]>;
}

// V2.1 Training System Types for Storage Layer
export interface TrainingLevelWithProgress {
  id: string;
  levelNumber: number;
  title: string;
  description: string | null;
  orderIndex: number;
  userProgress: {
    totalUnits: number;
    completedUnits: number;
    inProgressUnits: number;
    progressPercentage: number;
    isLocked: boolean;
  };
}

export interface TrainingLevelDetail {
  id: string;
  levelNumber: number;
  title: string;
  description: string | null;
  skills: TrainingSkillWithContent[];
}

export interface TrainingSkillWithContent {
  id: string;
  skillName: string;
  skillOrder: number;
  description: string | null;
  subSkills: SubSkillWithUnits[];
}

export interface SubSkillWithUnits {
  id: string;
  subSkillName: string;
  subSkillOrder: number;
  description: string | null;
  units: TrainingUnitWithProgress[];
}

export interface TrainingUnitWithProgress {
  id: string;
  unitType: string;
  unitOrder: number;
  title: string;
  xpReward: number | null;
  estimatedMinutes: number | null;
  userProgress?: {
    status: string;
    completedAt: Date | null;
  };
}

export interface TrainingUnitDetail {
  id: string;
  title: string;
  unitType: string;
  content: any; // JSONB content
  xpReward: number | null;
  estimatedMinutes: number | null;
  subSkill: {
    id: string;
    subSkillName: string;
  };
  userProgress?: {
    status: string;
    progressData: any;
  };
}

export class DatabaseStorage implements IStorage {
  private ensureDb(): NonNullable<typeof db> {
    if (!db) {
      throw new Error("Database not initialized. Running in demo mode.");
    }
    return db;
  }

  // Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.ensureDb().select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await this.ensureDb()
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          lastActiveAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.ensureDb().select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await this.ensureDb().select().from(users).orderBy(desc(users.exp));
    return allUsers;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.ensureDb().select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.ensureDb()
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await this.ensureDb()
      .update(users)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStreak(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastActive = new Date(user.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);
    
    let newStreak = user.streak;
    if (lastActive.getTime() === yesterday.getTime()) {
      newStreak += 1;
    } else if (lastActive.getTime() !== today.getTime()) {
      newStreak = 1;
    }
    
    return this.updateUser(userId, { 
      streak: newStreak,
      totalDays: user.totalDays + (lastActive.getTime() !== today.getTime() ? 1 : 0)
    });
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return this.ensureDb().select().from(tasks);
  }

  async getTasksByLevel(level: number): Promise<Task[]> {
    return this.ensureDb().select().from(tasks).where(eq(tasks.level, level));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await this.ensureDb()
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  // User task operations
  async getUserTasks(userId: string): Promise<(UserTask & { task: Task })[]> {
    const result = await this.ensureDb()
      .select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .orderBy(desc(userTasks.createdAt));
      
    return result.map((row: any) => ({
      ...row.user_tasks,
      task: row.tasks!
    }));
  }

  async getTodayUserTasks(userId: string): Promise<(UserTask & { task: Task })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await this.ensureDb()
      .select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(
        and(
          eq(userTasks.userId, userId),
          gte(userTasks.createdAt, today),
          lte(userTasks.createdAt, tomorrow)
        )
      )
      .orderBy(desc(userTasks.createdAt));
      
    return result.map((row: any) => ({
      ...row.user_tasks,
      task: row.tasks!
    }));
  }

  async createUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const [newUserTask] = await this.ensureDb()
      .insert(userTasks)
      .values(userTask)
      .returning();
    return newUserTask;
  }

  async completeUserTask(id: number, rating: number): Promise<UserTask> {
    const [userTask] = await this.ensureDb()
      .update(userTasks)
      .set({ 
        completed: true, 
        rating,
        completedAt: new Date()
      })
      .where(eq(userTasks.id, id))
      .returning();
      
    // Update user stats
    const user = await this.getUser(userTask.userId);
    if (user) {
      await this.updateUser(userTask.userId, {
        completedTasks: user.completedTasks + 1,
        exp: user.exp + (rating * 10)
      });
    }
    
    return userTask;
  }

  // Diary operations
  async getDiaryEntries(userId: string): Promise<DiaryEntry[]> {
    return this.ensureDb()
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [newEntry] = await this.ensureDb()
      .insert(diaryEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  // Feedback operations
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await this.ensureDb()
      .insert(feedbacks)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getUserFeedbacks(userId: string): Promise<Feedback[]> {
    return this.ensureDb()
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.date));
  }

  // Training program operations
  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.ensureDb().select().from(trainingPrograms);
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    const [program] = await this.ensureDb().select().from(trainingPrograms).where(eq(trainingPrograms.id, id));
    return program || undefined;
  }

  async updateTrainingProgram(id: number, updates: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const [program] = await this.ensureDb()
      .update(trainingPrograms)
      .set(updates)
      .where(eq(trainingPrograms.id, id))
      .returning();
    return program;
  }

  async getTrainingDays(programId: number): Promise<TrainingDay[]> {
    return this.ensureDb()
      .select()
      .from(trainingDays)
      .where(eq(trainingDays.programId, programId))
      .orderBy(trainingDays.day);
  }

  async getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined> {
    const [trainingDay] = await this.ensureDb()
      .select()
      .from(trainingDays)
      .where(
        and(
          eq(trainingDays.programId, programId),
          eq(trainingDays.day, day)
        )
      );
    return trainingDay || undefined;
  }

  // Training session operations
  async getUserTrainingSessions(userId: string): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay })[]> {
    const result = await this.ensureDb()
      .select()
      .from(trainingSessions)
      .leftJoin(trainingPrograms, eq(trainingSessions.programId, trainingPrograms.id))
      .leftJoin(trainingDays, eq(trainingSessions.dayId, trainingDays.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingSessions.createdAt));
      
    return result.map((row: any) => ({
      ...row.training_sessions,
      program: row.training_programs || undefined,
      day: row.training_days || undefined
    }));
  }

  async getCurrentTrainingSession(userId: string): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined> {
    const result = await this.ensureDb()
      .select()
      .from(trainingSessions)
      .leftJoin(trainingPrograms, eq(trainingSessions.programId, trainingPrograms.id))
      .leftJoin(trainingDays, eq(trainingSessions.dayId, trainingDays.id))
      .where(
        and(
          eq(trainingSessions.userId, userId),
          eq(trainingSessions.completed, false)
        )
      )
      .orderBy(desc(trainingSessions.createdAt))
      .limit(1);
      
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.training_sessions,
      program: row.training_programs || undefined,
      day: row.training_days || undefined
    };
  }

  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const [session] = await this.ensureDb().select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session || undefined;
  }

  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await this.ensureDb()
      .insert(trainingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<TrainingSession> {
    const [session] = await this.ensureDb()
      .update(trainingSessions)
      .set(updates)
      .where(eq(trainingSessions.id, id))
      .returning();
    return session;
  }

  async completeTrainingSession(id: number, duration: number, rating: number, notes?: string): Promise<TrainingSession> {
    const [session] = await this.ensureDb()
      .update(trainingSessions)
      .set({
        completed: true,
        duration,
        rating,
        notes,
        completedAt: new Date()
      })
      .where(eq(trainingSessions.id, id))
      .returning();
      
    // Update user stats
    const user = await this.getUser(session.userId);
    if (user) {
      await this.updateUser(session.userId, {
        totalTime: user.totalTime + duration,
        exp: user.exp + (rating * 20)
      });
      
      // Check for achievements
      await this.checkAndUnlockAchievements(session.userId);
    }
    
    return session;
  }

  async deleteTrainingSession(id: number): Promise<void> {
    await this.ensureDb().delete(trainingSessions).where(eq(trainingSessions.id, id));
  }

  // Training note operations
  async getTrainingNotes(sessionId: number): Promise<TrainingNote[]> {
    return this.ensureDb()
      .select()
      .from(trainingNotes)
      .where(eq(trainingNotes.sessionId, sessionId))
      .orderBy(trainingNotes.timestamp);
  }

  async getAllTrainingNotes(userId: string): Promise<TrainingNote[]> {
    const result = await this.ensureDb()
      .select()
      .from(trainingNotes)
      .leftJoin(trainingSessions, eq(trainingNotes.sessionId, trainingSessions.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingNotes.timestamp));
      
    return result.map(row => row.training_notes);
  }

  async createTrainingNote(note: InsertTrainingNote): Promise<TrainingNote> {
    const [newNote] = await this.ensureDb()
      .insert(trainingNotes)
      .values(note)
      .returning();
    return newNote;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return this.ensureDb().select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result = await this.ensureDb()
      .select()
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
      
    return result.map((row: any) => ({
      ...row.user_achievements,
      achievement: row.achievements!
    }));
  }

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = userAchievements.map(ua => ua.achievementId);
    
    const newUnlocks: UserAchievement[] = [];
    
    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const condition = achievement.condition as any;
      let shouldUnlock = false;
      
      switch (condition.type) {
        case "complete_sessions":
          const userSessions = await this.getUserTrainingSessions(userId);
          const completedSessions = userSessions.filter(s => s.completed).length;
          shouldUnlock = completedSessions >= condition.target;
          break;
        case "streak":
          shouldUnlock = user.streak >= condition.target;
          break;
        case "level":
          shouldUnlock = user.level >= condition.target;
          break;
        case "total_time":
          shouldUnlock = user.totalTime >= condition.target;
          break;
        case "rating_average":
          const sessions = await this.getUserTrainingSessions(userId);
          const completedWithRating = sessions.filter(s => s.completed && s.rating);
          if (completedWithRating.length >= condition.min_sessions) {
            const avgRating = completedWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / completedWithRating.length;
            shouldUnlock = avgRating >= condition.target;
          }
          break;
      }
      
      if (shouldUnlock) {
        const newAchievement = await this.unlockAchievement(userId, achievement.id);
        newUnlocks.push(newAchievement);
        
        // Award experience points
        await this.updateUser(userId, {
          exp: user.exp + achievement.expReward
        });
      }
    }
    
    return newUnlocks;
  }

  async unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [userAchievement] = await this.ensureDb()
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        completed: true,
        progress: 100
      })
      .returning();
    return userAchievement;
  }

  async updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<void> {
    await this.ensureDb()
      .update(userAchievements)
      .set({ progress })
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
  }

  async initializeAchievements(): Promise<{ inserted: number; skipped: number; message: string }> {
    const initialAchievements = [
      // === 成长路径类 (Level-based) ===
      {
        name: "初学乍练",
        description: "达到等级 1 - 踏上台球训练之旅",
        icon: "🎱",
        type: "level",
        condition: { type: "level", target: 1 },
        expReward: 10,
        category: "beginner"
      },
      {
        name: "渐入佳境",
        description: "达到等级 3 - 掌握了基础技巧",
        icon: "⭐",
        type: "level",
        condition: { type: "level", target: 3 },
        expReward: 30,
        category: "beginner"
      },
      {
        name: "融会贯通",
        description: "达到等级 5 - 成为社区中坚力量",
        icon: "💎",
        type: "level",
        condition: { type: "level", target: 5 },
        expReward: 50,
        category: "intermediate"
      },
      {
        name: "炉火纯青",
        description: "达到等级 7 - 精通各项技术",
        icon: "👑",
        type: "level",
        condition: { type: "level", target: 7 },
        expReward: 75,
        category: "advanced"
      },
      {
        name: "登峰造极",
        description: "达到等级 8 - 大师级别，请受我一拜！",
        icon: "🏆",
        type: "level",
        condition: { type: "level", target: 8 },
        expReward: 100,
        category: "master"
      },

      // === 训练完成类 (Session-based) ===
      {
        name: "第一滴血",
        description: "完成第一次训练 - 伟大的旅程始于足下",
        icon: "🎯",
        type: "training",
        condition: { type: "complete_sessions", target: 1 },
        expReward: 20,
        category: "beginner"
      },
      {
        name: "小试牛刀",
        description: "完成 10 次训练",
        icon: "💪",
        type: "training",
        condition: { type: "complete_sessions", target: 10 },
        expReward: 30,
        category: "beginner"
      },
      {
        name: "勤学苦练",
        description: "完成 30 次训练 - 习惯正在养成",
        icon: "📚",
        type: "training",
        condition: { type: "complete_sessions", target: 30 },
        expReward: 50,
        category: "intermediate"
      },
      {
        name: "百炼成钢",
        description: "完成 100 次训练 - 量变引起质变",
        icon: "⚡",
        type: "training",
        condition: { type: "complete_sessions", target: 100 },
        expReward: 100,
        category: "advanced"
      },
      {
        name: "千锤百炼",
        description: "完成 500 次训练 - 真正的台球大师",
        icon: "🌟",
        type: "training",
        condition: { type: "complete_sessions", target: 500 },
        expReward: 200,
        category: "master"
      },

      // === 连续训练类 (Streak-based) ===
      {
        name: "初心不改",
        description: "连续训练 3 天",
        icon: "🔥",
        type: "streak",
        condition: { type: "streak", target: 3 },
        expReward: 15,
        category: "beginner"
      },
      {
        name: "坚持不懈",
        description: "连续训练 7 天 - 一周打卡成功",
        icon: "📅",
        type: "streak",
        condition: { type: "streak", target: 7 },
        expReward: 30,
        category: "beginner"
      },
      {
        name: "持之以恒",
        description: "连续训练 30 天 - 养成了良好习惯",
        icon: "🎖️",
        type: "streak",
        condition: { type: "streak", target: 30 },
        expReward: 75,
        category: "intermediate"
      },
      {
        name: "百日筑基",
        description: "连续训练 100 天 - 自律的化身",
        icon: "🏅",
        type: "streak",
        condition: { type: "streak", target: 100 },
        expReward: 150,
        category: "advanced"
      },

      // === 训练时长类 (Time-based) ===
      {
        name: "入门时光",
        description: "累计训练 10 小时",
        icon: "⏰",
        type: "time",
        condition: { type: "total_time", target: 600 },
        expReward: 25,
        category: "beginner"
      },
      {
        name: "百小时修炼",
        description: "累计训练 100 小时 - 时间见证成长",
        icon: "⌛",
        type: "time",
        condition: { type: "total_time", target: 6000 },
        expReward: 75,
        category: "intermediate"
      },
      {
        name: "千小时定律",
        description: "累计训练 1000 小时 - 专家级投入",
        icon: "🕐",
        type: "time",
        condition: { type: "total_time", target: 60000 },
        expReward: 200,
        category: "master"
      },

      // === 训练质量类 (Rating-based) ===
      {
        name: "追求卓越",
        description: "至少 5 次训练平均评分达到 4 星",
        icon: "✨",
        type: "rating",
        condition: { type: "rating_average", target: 4, min_sessions: 5 },
        expReward: 40,
        category: "intermediate"
      },
      {
        name: "完美主义者",
        description: "至少 10 次训练平均评分达到 4.5 星",
        icon: "💯",
        type: "rating",
        condition: { type: "rating_average", target: 4.5, min_sessions: 10 },
        expReward: 60,
        category: "advanced"
      },
      {
        name: "五星传奇",
        description: "至少 20 次训练平均评分达到 5 星 - 完美无瑕",
        icon: "🌠",
        type: "rating",
        condition: { type: "rating_average", target: 5, min_sessions: 20 },
        expReward: 100,
        category: "master"
      }
    ];

    // Check if achievements already exist
    const existingAchievements = await this.getAllAchievements();

    if (existingAchievements.length > 0) {
      return {
        inserted: 0,
        skipped: existingAchievements.length,
        message: `Achievements already initialized. Found ${existingAchievements.length} existing achievements.`
      };
    }

    // Insert all achievements
    let inserted = 0;
    for (const achievement of initialAchievements) {
      await this.ensureDb().insert(achievements).values({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        condition: achievement.condition as any,
        expReward: achievement.expReward,
        category: achievement.category,
        unlocked: true,
      });
      inserted++;
    }

    return {
      inserted,
      skipped: 0,
      message: `Successfully initialized ${inserted} achievements.`
    };
  }

  // === V2.1 Training System Implementation ===

  /**
   * Get all training levels with user progress summary
   * Returns array of levels with aggregated progress data
   */
  async getAllTrainingLevels(userId: string): Promise<TrainingLevelWithProgress[]> {
    const db = this.ensureDb();

    // Fetch all levels ordered by levelNumber
    const levels = await db
      .select()
      .from(trainingLevels)
      .where(eq(trainingLevels.isActive, true))
      .orderBy(trainingLevels.orderIndex);

    // For each level, calculate user progress
    const levelsWithProgress: TrainingLevelWithProgress[] = [];

    for (const level of levels) {
      // Get all units for this level (through skills -> subSkills -> units)
      const levelUnits = await db
        .select({
          unitId: trainingUnits.id,
        })
        .from(trainingUnits)
        .innerJoin(subSkills, eq(trainingUnits.subSkillId, subSkills.id))
        .innerJoin(trainingSkills, eq(subSkills.skillId, trainingSkills.id))
        .where(eq(trainingSkills.levelId, level.id));

      const totalUnits = levelUnits.length;

      // Get user progress for these units
      const userProgressRecords = await db
        .select()
        .from(userTrainingProgress)
        .where(
          and(
            eq(userTrainingProgress.userId, userId),
            eq(userTrainingProgress.levelId, level.id)
          )
        );

      const completedUnits = userProgressRecords.filter(p => p.status === 'completed').length;
      const inProgressUnits = userProgressRecords.filter(p => p.status === 'in_progress').length;
      const progressPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

      // Check if level is locked (previous level not completed)
      let isLocked = false;
      if (level.prerequisiteLevelId) {
        const prereqProgress = levelsWithProgress.find(l => l.id === level.prerequisiteLevelId);
        isLocked = prereqProgress ? prereqProgress.userProgress.progressPercentage < 100 : true;
      }

      levelsWithProgress.push({
        id: level.id,
        levelNumber: level.levelNumber,
        title: level.title,
        description: level.description,
        orderIndex: level.orderIndex,
        userProgress: {
          totalUnits,
          completedUnits,
          inProgressUnits,
          progressPercentage,
          isLocked,
        },
      });
    }

    return levelsWithProgress;
  }

  /**
   * Get detailed training level data with full skill tree
   * Includes: level -> skills -> subSkills -> units (with user progress)
   */
  async getTrainingLevelById(levelId: string, userId: string): Promise<TrainingLevelDetail | undefined> {
    const db = this.ensureDb();

    // Fetch the level
    const [level] = await db
      .select()
      .from(trainingLevels)
      .where(eq(trainingLevels.id, levelId));

    if (!level) return undefined;

    // Fetch all skills for this level
    const skills = await db
      .select()
      .from(trainingSkills)
      .where(eq(trainingSkills.levelId, levelId))
      .orderBy(trainingSkills.skillOrder);

    // Build the skill tree with nested data
    const skillsWithContent: TrainingSkillWithContent[] = [];

    for (const skill of skills) {
      // Get sub-skills for this skill
      const subSkillsData = await db
        .select()
        .from(subSkills)
        .where(eq(subSkills.skillId, skill.id))
        .orderBy(subSkills.subSkillOrder);

      const subSkillsWithUnits: SubSkillWithUnits[] = [];

      for (const subSkill of subSkillsData) {
        // Get training units for this sub-skill
        const units = await db
          .select()
          .from(trainingUnits)
          .where(eq(trainingUnits.subSkillId, subSkill.id))
          .orderBy(trainingUnits.unitOrder);

        // Get user progress for these units
        const unitIds = units.map(u => u.id);
        const progressRecords = unitIds.length > 0
          ? await db
              .select()
              .from(userTrainingProgress)
              .where(
                and(
                  eq(userTrainingProgress.userId, userId),
                  inArray(userTrainingProgress.unitId, unitIds)
                )
              )
          : [];

        const progressMap = new Map(progressRecords.map(p => [p.unitId, p]));

        const unitsWithProgress: TrainingUnitWithProgress[] = units.map(unit => ({
          id: unit.id,
          unitType: unit.unitType,
          unitOrder: unit.unitOrder,
          title: unit.title,
          xpReward: unit.xpReward,
          estimatedMinutes: unit.estimatedMinutes,
          userProgress: progressMap.has(unit.id)
            ? {
                status: progressMap.get(unit.id)!.status,
                completedAt: progressMap.get(unit.id)!.completedAt,
              }
            : undefined,
        }));

        subSkillsWithUnits.push({
          id: subSkill.id,
          subSkillName: subSkill.subSkillName,
          subSkillOrder: subSkill.subSkillOrder,
          description: subSkill.description,
          units: unitsWithProgress,
        });
      }

      skillsWithContent.push({
        id: skill.id,
        skillName: skill.skillName,
        skillOrder: skill.skillOrder,
        description: skill.description,
        subSkills: subSkillsWithUnits,
      });
    }

    return {
      id: level.id,
      levelNumber: level.levelNumber,
      title: level.title,
      description: level.description,
      skills: skillsWithContent,
    };
  }

  /**
   * Get training unit details with content and user progress
   */
  async getTrainingUnitById(unitId: string, userId: string): Promise<TrainingUnitDetail | undefined> {
    const db = this.ensureDb();

    // Fetch unit with sub-skill info
    const [unit] = await db
      .select({
        id: trainingUnits.id,
        title: trainingUnits.title,
        unitType: trainingUnits.unitType,
        content: trainingUnits.content,
        xpReward: trainingUnits.xpReward,
        estimatedMinutes: trainingUnits.estimatedMinutes,
        subSkillId: subSkills.id,
        subSkillName: subSkills.subSkillName,
      })
      .from(trainingUnits)
      .innerJoin(subSkills, eq(trainingUnits.subSkillId, subSkills.id))
      .where(eq(trainingUnits.id, unitId));

    if (!unit) return undefined;

    // Fetch user progress for this unit
    const [progress] = await db
      .select()
      .from(userTrainingProgress)
      .where(
        and(
          eq(userTrainingProgress.userId, userId),
          eq(userTrainingProgress.unitId, unitId)
        )
      );

    return {
      id: unit.id,
      title: unit.title,
      unitType: unit.unitType,
      content: unit.content,
      xpReward: unit.xpReward,
      estimatedMinutes: unit.estimatedMinutes,
      subSkill: {
        id: unit.subSkillId,
        subSkillName: unit.subSkillName,
      },
      userProgress: progress
        ? {
            status: progress.status,
            progressData: progress.progressData,
          }
        : undefined,
    };
  }

  /**
   * Get user progress for a specific training unit
   */
  async getUserTrainingProgressByUnit(userId: string, unitId: string): Promise<UserTrainingProgressType | undefined> {
    const db = this.ensureDb();

    const [progress] = await db
      .select()
      .from(userTrainingProgress)
      .where(
        and(
          eq(userTrainingProgress.userId, userId),
          eq(userTrainingProgress.unitId, unitId)
        )
      );

    return progress || undefined;
  }

  /**
   * Start a training unit (mark as in_progress)
   */
  async startTrainingUnit(userId: string, levelId: string, unitId: string): Promise<UserTrainingProgressType> {
    const db = this.ensureDb();

    const now = new Date();
    const initialProgressData = {
      started_at: now.toISOString(),
      last_activity_at: now.toISOString(),
      attempts: 1,
    };

    // Upsert progress record
    const [progress] = await db
      .insert(userTrainingProgress)
      .values({
        userId,
        levelId,
        unitId,
        status: 'in_progress',
        progressData: initialProgressData as any,
      })
      .onConflictDoUpdate({
        target: [userTrainingProgress.userId, userTrainingProgress.unitId],
        set: {
          status: 'in_progress',
          progressData: sql`COALESCE(${userTrainingProgress.progressData}, '{}'::jsonb) || ${JSON.stringify(initialProgressData)}::jsonb`,
          updatedAt: now,
        },
      })
      .returning();

    return progress;
  }

  /**
   * Update training progress (during training)
   */
  async updateTrainingProgress(userId: string, unitId: string, progressData: any): Promise<UserTrainingProgressType> {
    const db = this.ensureDb();

    const now = new Date();
    const updatedData = {
      ...progressData,
      last_activity_at: now.toISOString(),
    };

    const [progress] = await db
      .update(userTrainingProgress)
      .set({
        progressData: updatedData as any,
        updatedAt: now,
      })
      .where(
        and(
          eq(userTrainingProgress.userId, userId),
          eq(userTrainingProgress.unitId, unitId)
        )
      )
      .returning();

    if (!progress) {
      throw new Error(`Training progress not found for user ${userId} and unit ${unitId}`);
    }

    return progress;
  }

  /**
   * Complete a training unit and award XP
   */
  async completeTrainingUnit(
    userId: string,
    unitId: string,
    finalProgressData: any
  ): Promise<{ progress: UserTrainingProgressType; xpAwarded: number }> {
    const db = this.ensureDb();

    const now = new Date();

    // Get unit XP reward
    const [unit] = await db
      .select({ xpReward: trainingUnits.xpReward })
      .from(trainingUnits)
      .where(eq(trainingUnits.id, unitId));

    const xpAwarded = unit?.xpReward || 10;

    // Update progress to completed
    const [progress] = await db
      .update(userTrainingProgress)
      .set({
        status: 'completed',
        progressData: finalProgressData as any,
        completedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(userTrainingProgress.userId, userId),
          eq(userTrainingProgress.unitId, unitId)
        )
      )
      .returning();

    if (!progress) {
      throw new Error(`Training progress not found for user ${userId} and unit ${unitId}`);
    }

    // Award XP to user
    await db
      .update(users)
      .set({
        exp: sql`${users.exp} + ${xpAwarded}`,
      })
      .where(eq(users.id, userId));

    return { progress, xpAwarded };
  }

  /**
   * Get all specialized trainings
   */
  async getAllSpecializedTrainings(): Promise<SpecializedTraining[]> {
    const db = this.ensureDb();

    const trainings = await db
      .select()
      .from(specializedTrainings)
      .orderBy(specializedTrainings.skillCategory, specializedTrainings.difficultyLevel);

    return trainings;
  }

  /**
   * Get training plans for a specialized training
   */
  async getSpecializedTrainingPlans(trainingId: string): Promise<SpecializedTrainingPlan[]> {
    const db = this.ensureDb();

    const plans = await db
      .select()
      .from(specializedTrainingPlans)
      .where(eq(specializedTrainingPlans.trainingId, trainingId))
      .orderBy(specializedTrainingPlans.planOrder);

    return plans;
  }
}

export const storage = new DatabaseStorage();
