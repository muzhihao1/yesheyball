import { users, tasks, userTasks, diaryEntries, feedbacks, type User, type InsertUser, type Task, type InsertTask, type UserTask, type InsertUserTask, type DiaryEntry, type InsertDiaryEntry, type Feedback, type InsertFeedback } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userTasks: Map<number, UserTask>;
  private diaryEntries: Map<number, DiaryEntry>;
  private feedbacks: Map<number, Feedback>;
  
  private currentUserId: number;
  private currentTaskId: number;
  private currentUserTaskId: number;
  private currentDiaryId: number;
  private currentFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userTasks = new Map();
    this.diaryEntries = new Map();
    this.feedbacks = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentUserTaskId = 1;
    this.currentDiaryId = 1;
    this.currentFeedbackId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "liangqi",
      level: 2,
      exp: 180,
      streak: 5,
      totalDays: 23,
      completedTasks: 67,
      totalTime: 2520, // 42 hours in minutes
      achievements: ["新手上路", "连续打卡", "精准射手"],
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create default tasks based on professional billiards training materials
    const defaultTasks: Omit<Task, 'id'>[] = [
      // Level 1: 初窥门径 - Basic fundamentals
      {
        title: "白球直线击球练习",
        description: "将白球与目标球摆成直线，练习最基本的直线击球。重点掌握正确的握杆姿势和身体站位，连续完成45次不失误。",
        level: 1,
        difficulty: "初级",
        category: "基础握杆",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        title: "目标球定点入袋",
        description: "如图摆放15个不同位置的目标球，将每个目标球击入指定袋内，全部一次成功不失误。",
        level: 1,
        difficulty: "初级",
        category: "瞄准精度",
        imageUrl: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400"
      },
      {
        title: "白球库边返回控制",
        description: "将白球向对面库边击打，使其返回时从1、2号球中间穿过，连续完成5次。",
        level: 1,
        difficulty: "初级",
        category: "力度控制",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },

      // Level 2: 小有所成 - Basic positioning
      {
        title: "白球定住练习",
        description: "将目标球打进指定袋中，且白球定住，位移不可超过1颗球。连续完成10次不失误。",
        level: 2,
        difficulty: "初级",
        category: "定杆技巧",
        imageUrl: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400"
      },
      {
        title: "白球跟进控制",
        description: "将目标球打进指定袋中，且白球越过黄线，但不可摔袋。连续完成10次不失误。",
        level: 2,
        difficulty: "中级",
        category: "跟进球",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        title: "不同角度直线球",
        description: "白球分别放在3个位置且与目标球呈直线，将目标球打进指定袋中，且白球定住。每个位置完成10次不失误。",
        level: 2,
        difficulty: "中级",
        category: "角度控制",
        imageUrl: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400"
      },

      // Level 3: 渐入佳境 - Advanced techniques
      {
        title: "库边反弹球练习",
        description: "将白球往库边任意位置击打，判断其第二库吃库点并标记出来。完成100次练习。",
        level: 3,
        difficulty: "高级",
        category: "库边技巧",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        title: "一库解黑八",
        description: "如图摆放球型，通过一库反弹将黑八解进指定袋内。连续完成5次不失误。",
        level: 3,
        difficulty: "高级",
        category: "解球技巧",
        imageUrl: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400"
      },
      {
        title: "传球练习",
        description: "击打2号球将1号球传进指定袋内。掌握传球的力度和角度控制。连续完成3次不失误。",
        level: 3,
        difficulty: "高级",
        category: "传球技巧",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },

      // Level 4: 炉火纯青 - Advanced positioning
      {
        title: "击球后撞击指定球",
        description: "将1号打进后白球撞击到2号球。练习精确的白球走位控制。连续完成5次不失误。",
        level: 4,
        difficulty: "高级",
        category: "走位控制",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        title: "连续K球练习",
        description: "将1号打进后依次去K到其他球，不可越号K球。失误不超过2次按顺序K到全部球。",
        level: 4,
        difficulty: "高级",
        category: "连续击球",
        imageUrl: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400"
      },
      {
        title: "目标区域走位",
        description: "将1号打进后白球停留在目标区域内。练习多种不同的走位路线。连续完成5次不失误。",
        level: 4,
        difficulty: "高级",
        category: "精确走位",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
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
}

export const storage = new MemStorage();
