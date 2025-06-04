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

    // Create daily training tasks - completely independent from level exercises
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
        title: "第17题 - 高杆技巧",
        description: "练习高杆击球技术，使白球在碰撞后继续向前滚动。",
        level: 4,
        difficulty: "高级",
        category: "高杆技巧",
        imageUrl: "/assessments/4、炉火纯青/4、炉火纯青_03.jpg"
      },
      {
        title: "第18题 - 低杆技巧",
        description: "练习低杆击球技术，使白球在碰撞后向后回拉。",
        level: 4,
        difficulty: "高级",
        category: "低杆技巧",
        imageUrl: "/assessments/4、炉火纯青/4、炉火纯青_04.jpg"
      },
      {
        title: "第19题 - 侧旋技巧",
        description: "练习左右侧旋技术，掌握侧旋对球路的影响。",
        level: 4,
        difficulty: "高级",
        category: "侧旋技巧",
        imageUrl: "/assessments/4、炉火纯青/4、炉火纯青_05.jpg"
      },
      {
        title: "第20题 - 组合杆法",
        description: "练习多种杆法的组合运用，提高技术的综合运用能力。",
        level: 4,
        difficulty: "高级",
        category: "组合杆法",
        imageUrl: "/assessments/4、炉火纯青/4、炉火纯青_06.jpg"
      },

      // Level 5: 登堂入室 - Advanced control (62 exercises)
      {
        title: "第21题 - 高阶控球技术",
        description: "练习更高级的控球技术，实现精确的球路控制。",
        level: 5,
        difficulty: "高级",
        category: "高阶控球",
        imageUrl: "/assessments/5、登堂入室/5、登堂入室_02.jpg"
      },
      {
        title: "第22题 - 实战球型训练",
        description: "模拟实战中的复杂球型，提高实战应用能力。",
        level: 5,
        difficulty: "高级",
        category: "实战训练",
        imageUrl: "/assessments/5、登堂入室/5、登堂入室_03.jpg"
      },
      {
        title: "第23题 - 连续走位",
        description: "练习连续多球的走位控制，保持良好的击球节奏。",
        level: 5,
        difficulty: "高级",
        category: "连续走位",
        imageUrl: "/assessments/5、登堂入室/5、登堂入室_04.jpg"
      },
      {
        title: "第24题 - 防守技巧",
        description: "学习防守性击球，包括做障碍球和安全球的技巧。",
        level: 5,
        difficulty: "高级",
        category: "防守技巧",
        imageUrl: "/assessments/5、登堂入室/5、登堂入室_05.jpg"
      },
      {
        title: "第25题 - 进攻策略",
        description: "练习进攻性击球策略，提高得分效率。",
        level: 5,
        difficulty: "高级",
        category: "进攻策略",
        imageUrl: "/assessments/5、登堂入室/5、登堂入室_06.jpg"
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
