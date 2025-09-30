import { users, tasks, userTasks, diaryEntries, feedbacks, trainingPrograms, trainingDays, trainingSessions, trainingNotes, achievements, userAchievements, type User, type InsertUser, type UpsertUser, type Task, type InsertTask, type UserTask, type InsertUserTask, type DiaryEntry, type InsertDiaryEntry, type Feedback, type InsertFeedback, type TrainingProgram, type InsertTrainingProgram, type TrainingDay, type InsertTrainingDay, type TrainingSession, type InsertTrainingSession, type TrainingNote, type InsertTrainingNote, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement } from "@shared/schema";
import { db } from "./db.js";
import { eq, desc, gte, and, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  // Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
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
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
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
    return db.select().from(tasks);
  }

  async getTasksByLevel(level: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.level, level));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  // User task operations
  async getUserTasks(userId: string): Promise<(UserTask & { task: Task })[]> {
    const result = await db
      .select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .orderBy(desc(userTasks.createdAt));
      
    return result.map(row => ({
      ...row.user_tasks,
      task: row.tasks!
    }));
  }

  async getTodayUserTasks(userId: string): Promise<(UserTask & { task: Task })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await db
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
      
    return result.map(row => ({
      ...row.user_tasks,
      task: row.tasks!
    }));
  }

  async createUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const [newUserTask] = await db
      .insert(userTasks)
      .values(userTask)
      .returning();
    return newUserTask;
  }

  async completeUserTask(id: number, rating: number): Promise<UserTask> {
    const [userTask] = await db
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
    return db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [newEntry] = await db
      .insert(diaryEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  // Feedback operations
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedbacks)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getUserFeedbacks(userId: string): Promise<Feedback[]> {
    return db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.date));
  }

  // Training program operations
  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return db.select().from(trainingPrograms);
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    const [program] = await db.select().from(trainingPrograms).where(eq(trainingPrograms.id, id));
    return program || undefined;
  }

  async updateTrainingProgram(id: number, updates: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const [program] = await db
      .update(trainingPrograms)
      .set(updates)
      .where(eq(trainingPrograms.id, id))
      .returning();
    return program;
  }

  async getTrainingDays(programId: number): Promise<TrainingDay[]> {
    return db
      .select()
      .from(trainingDays)
      .where(eq(trainingDays.programId, programId))
      .orderBy(trainingDays.day);
  }

  async getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined> {
    const [trainingDay] = await db
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
    const result = await db
      .select()
      .from(trainingSessions)
      .leftJoin(trainingPrograms, eq(trainingSessions.programId, trainingPrograms.id))
      .leftJoin(trainingDays, eq(trainingSessions.dayId, trainingDays.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingSessions.createdAt));
      
    return result.map(row => ({
      ...row.training_sessions,
      program: row.training_programs || undefined,
      day: row.training_days || undefined
    }));
  }

  async getCurrentTrainingSession(userId: string): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined> {
    const result = await db
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
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session || undefined;
  }

  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await db
      .insert(trainingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<TrainingSession> {
    const [session] = await db
      .update(trainingSessions)
      .set(updates)
      .where(eq(trainingSessions.id, id))
      .returning();
    return session;
  }

  async completeTrainingSession(id: number, duration: number, rating: number, notes?: string): Promise<TrainingSession> {
    const [session] = await db
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
    await db.delete(trainingSessions).where(eq(trainingSessions.id, id));
  }

  // Training note operations
  async getTrainingNotes(sessionId: number): Promise<TrainingNote[]> {
    return db
      .select()
      .from(trainingNotes)
      .where(eq(trainingNotes.sessionId, sessionId))
      .orderBy(trainingNotes.timestamp);
  }

  async getAllTrainingNotes(userId: string): Promise<TrainingNote[]> {
    const result = await db
      .select()
      .from(trainingNotes)
      .leftJoin(trainingSessions, eq(trainingNotes.sessionId, trainingSessions.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingNotes.timestamp));
      
    return result.map(row => row.training_notes);
  }

  async createTrainingNote(note: InsertTrainingNote): Promise<TrainingNote> {
    const [newNote] = await db
      .insert(trainingNotes)
      .values(note)
      .returning();
    return newNote;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result = await db
      .select()
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
      
    return result.map(row => ({
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
    const [userAchievement] = await db
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
    await db
      .update(userAchievements)
      .set({ progress })
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
