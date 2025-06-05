import { users, tasks, userTasks, diaryEntries, feedbacks, trainingPrograms, trainingDays, trainingSessions, trainingNotes, achievements, userAchievements, type User, type InsertUser, type Task, type InsertTask, type UserTask, type InsertUserTask, type DiaryEntry, type InsertDiaryEntry, type Feedback, type InsertFeedback, type TrainingProgram, type InsertTrainingProgram, type TrainingDay, type InsertTrainingDay, type TrainingSession, type InsertTrainingSession, type TrainingNote, type InsertTrainingNote, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, and, lte } from "drizzle-orm";

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
  deleteTrainingSession(id: number): Promise<void>;
  
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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStreak(userId: number): Promise<User> {
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
      newStreak = user.streak + 1;
    } else if (lastActive.getTime() < yesterday.getTime()) {
      newStreak = 1;
    }
    
    return this.updateUser(userId, { 
      streak: newStreak,
      totalDays: user.totalDays + (newStreak > user.streak ? 1 : 0)
    });
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByLevel(level: number): Promise<Task[]> {
    return await db.select().from(tasks).where(lte(tasks.level, level));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  // User task operations
  async getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    return await db
      .select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .then(results => results.map(({ user_tasks, tasks: task }) => ({
        ...user_tasks,
        task: task!
      })));
  }

  async getTodayUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = await db
      .select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(and(
        eq(userTasks.userId, userId),
        gte(userTasks.createdAt, today)
      ));
    
    // If no tasks for today, create 3 random tasks
    if (todayTasks.length === 0) {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      const availableTasks = await this.getTasksByLevel(user.level);
      const shuffled = availableTasks.sort(() => 0.5 - Math.random());
      const selectedTasks = shuffled.slice(0, 3);
      
      const newUserTasks = [];
      for (const task of selectedTasks) {
        const [userTask] = await db
          .insert(userTasks)
          .values({
            userId,
            taskId: task.id,
            completed: false
          })
          .returning();
        newUserTasks.push({ ...userTask, task });
      }
      return newUserTasks;
    }
    
    return todayTasks.map(({ user_tasks, tasks: task }) => ({
      ...user_tasks,
      task: task!
    }));
  }

  async createUserTask(insertUserTask: InsertUserTask): Promise<UserTask> {
    const [userTask] = await db
      .insert(userTasks)
      .values(insertUserTask)
      .returning();
    return userTask;
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
      await this.updateUser(user.id, {
        exp: user.exp + (rating * 5),
        completedTasks: user.completedTasks + 1
      });
    }
    
    return userTask;
  }

  // Diary operations
  async getDiaryEntries(userId: number): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  async createDiaryEntry(insertEntry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [entry] = await db
      .insert(diaryEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  // Feedback operations
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  async getUserFeedbacks(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.date));
  }

  // Training program operations
  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return await db.select().from(trainingPrograms);
  }

  async getTrainingProgram(id: number): Promise<TrainingProgram | undefined> {
    const [program] = await db
      .select()
      .from(trainingPrograms)
      .where(eq(trainingPrograms.id, id));
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
    return await db
      .select()
      .from(trainingDays)
      .where(eq(trainingDays.programId, programId))
      .orderBy(trainingDays.day);
  }

  async getTrainingDay(programId: number, day: number): Promise<TrainingDay | undefined> {
    const [trainingDay] = await db
      .select()
      .from(trainingDays)
      .where(and(
        eq(trainingDays.programId, programId),
        eq(trainingDays.day, day)
      ));
    return trainingDay || undefined;
  }

  // Training session operations
  async getUserTrainingSessions(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay })[]> {
    return await db
      .select()
      .from(trainingSessions)
      .leftJoin(trainingPrograms, eq(trainingSessions.programId, trainingPrograms.id))
      .leftJoin(trainingDays, eq(trainingSessions.dayId, trainingDays.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingSessions.createdAt))
      .then(results => results.map(({ training_sessions, training_programs, training_days }) => ({
        ...training_sessions,
        program: training_programs || undefined,
        day: training_days || undefined
      })));
  }

  async getCurrentTrainingSession(userId: number): Promise<(TrainingSession & { program?: TrainingProgram; day?: TrainingDay }) | undefined> {
    const [result] = await db
      .select()
      .from(trainingSessions)
      .leftJoin(trainingPrograms, eq(trainingSessions.programId, trainingPrograms.id))
      .leftJoin(trainingDays, eq(trainingSessions.dayId, trainingDays.id))
      .where(and(
        eq(trainingSessions.userId, userId),
        eq(trainingSessions.completed, false)
      ))
      .orderBy(desc(trainingSessions.createdAt))
      .limit(1);
    
    if (!result) return undefined;
    
    return {
      ...result.training_sessions,
      program: result.training_programs || undefined,
      day: result.training_days || undefined
    };
  }

  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const [session] = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, id));
    return session || undefined;
  }

  async createTrainingSession(insertSession: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db
      .insert(trainingSessions)
      .values(insertSession)
      .returning();
    return session;
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
        notes: notes || null,
        completedAt: new Date()
      })
      .where(eq(trainingSessions.id, id))
      .returning();
    
    // Update user stats
    const user = await this.getUser(session.userId);
    if (user) {
      await this.updateUser(user.id, {
        exp: user.exp + (rating * 10),
        totalTime: user.totalTime + duration
      });
      await this.updateUserStreak(user.id);
    }
    
    return session;
  }

  async deleteTrainingSession(id: number): Promise<void> {
    await db.delete(trainingSessions).where(eq(trainingSessions.id, id));
  }

  // Training note operations
  async getTrainingNotes(sessionId: number): Promise<TrainingNote[]> {
    return await db
      .select()
      .from(trainingNotes)
      .where(eq(trainingNotes.sessionId, sessionId))
      .orderBy(trainingNotes.timestamp);
  }

  async getAllTrainingNotes(userId: number): Promise<TrainingNote[]> {
    return await db
      .select({
        id: trainingNotes.id,
        sessionId: trainingNotes.sessionId,
        content: trainingNotes.content,
        timestamp: trainingNotes.timestamp
      })
      .from(trainingNotes)
      .leftJoin(trainingSessions, eq(trainingNotes.sessionId, trainingSessions.id))
      .where(eq(trainingSessions.userId, userId))
      .orderBy(desc(trainingNotes.timestamp));
  }

  async createTrainingNote(insertNote: InsertTrainingNote): Promise<TrainingNote> {
    const [note] = await db
      .insert(trainingNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db
      .select()
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .then(results => results.map(({ user_achievements, achievements: achievement }) => ({
        ...user_achievements,
        achievement: achievement!
      })));
  }

  async checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const allAchievements = await this.getAllAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const newlyUnlocked: UserAchievement[] = [];
    
    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;
      
      const condition = achievement.condition as any;
      let shouldUnlock = false;
      
      switch (condition.type) {
        case "complete_sessions":
          const sessions = await this.getUserTrainingSessions(userId);
          const completedSessions = sessions.filter(s => s.completed).length;
          shouldUnlock = completedSessions >= condition.target;
          break;
        case "daily_streak":
          shouldUnlock = user.streak >= condition.target;
          break;
        case "total_time":
          shouldUnlock = user.totalTime >= condition.target;
          break;
        case "high_rating":
          const recentSessions = await this.getUserTrainingSessions(userId);
          const highRatingSessions = recentSessions.filter(s => s.rating && s.rating >= condition.target).length;
          shouldUnlock = highRatingSessions >= (condition.count || 1);
          break;
      }
      
      if (shouldUnlock) {
        const newUserAchievement = await this.unlockAchievement(userId, achievement.id);
        newlyUnlocked.push(newUserAchievement);
      }
    }
    
    return newlyUnlocked;
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        completed: true,
        progress: 100
      })
      .returning();
    
    // Award experience
    const achievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .then(results => results[0]);
    
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
    await db
      .update(userAchievements)
      .set({ progress })
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
  }
}

export const storage = new DatabaseStorage();