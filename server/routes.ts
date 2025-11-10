import express, { type Express, type Request } from "express";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated, getSessionUser, authDisabled, hasDatabase, demoUserResponse, demoUserProfile } from "./auth.js";
import { generateCoachingFeedback, generateDiaryInsights } from "./openai.js";
import { upload, persistUploadedImage } from "./upload.js";
import { insertDiaryEntrySchema, insertUserTaskSchema, insertTrainingSessionSchema, insertTrainingNoteSchema, trainingSkills, subSkills, trainingUnits } from "../shared/schema.js";
import { getTodaysCourse, getCourseByDay, DAILY_COURSES } from "./dailyCourses.js";
import { analyzeExerciseImage, batchAnalyzeExercises } from "./imageAnalyzer.js";
import { adaptiveLearning } from "./adaptiveLearning.js";
import { requirementCorrector } from "./manualCorrection.js";
import { analyzeTableBounds } from "./imageAnalysis.js";
import {
  calculateTrainingExperience,
  calculateLevelExperience,
  calculateUserLevel,
  getExperienceBreakdown
} from "./experienceSystem.js";
import { recalculateUserExperience } from "./recalculateExperience.js";
import { initializeGoalTemplates, getUserGoalsWithDetails, updateGoalProgress } from "./goalService.js";
import { z } from "zod";
import OpenAI from "openai";
import path from "path";
import fs from "fs";
import { eq, sql } from "drizzle-orm";

function getSessionUserId(req: Request): string | undefined {
  const sessionUser = getSessionUser(req);
  if (sessionUser?.claims?.sub) {
    return sessionUser.claims.sub;
  }

  if (authDisabled && !hasDatabase) {
    return demoUserProfile.id;
  }

  return undefined;
}

function requireSessionUserId(req: Request): string {
  const userId = getSessionUserId(req);
  if (!userId) {
    if (authDisabled && !hasDatabase) {
      return demoUserProfile.id;
    }
    throw new Error("Missing authenticated user id");
  }
  return userId;
}

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Calculate training streak based on completed sessions
function calculateTrainingStreak(completedSessions: any[]): {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  recentDays: { date: string; hasActivity: boolean; sessions: number }[];
} {
  if (completedSessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      recentDays: []
    };
  }

  // Group sessions by date
  const sessionsByDate = new Map<string, number>();
  completedSessions.forEach(session => {
    const date = new Date(session.createdAt).toDateString();
    sessionsByDate.set(date, (sessionsByDate.get(date) || 0) + 1);
  });

  const uniqueDates = Array.from(sessionsByDate.keys()).sort();
  const totalDays = uniqueDates.length;

  // Calculate current streak (consecutive days from today)
  let currentStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Start from today or yesterday if no activity today
  let checkDate = sessionsByDate.has(today) ? today : yesterday;
  let currentDate = new Date(checkDate);
  
  while (sessionsByDate.has(currentDate.toDateString())) {
    currentStreak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  uniqueDates.forEach(dateStr => {
    const date = new Date(dateStr);
    if (prevDate && Math.abs(date.getTime() - prevDate.getTime()) <= 25 * 60 * 60 * 1000) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = date;
  });

  // Generate recent 7 days data
  const recentDays = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toDateString();
    recentDays.push({
      date: dateStr,
      hasActivity: sessionsByDate.has(dateStr),
      sessions: sessionsByDate.get(dateStr) || 0
    });
  }

  return {
    currentStreak,
    longestStreak,
    totalDays,
    recentDays
  };
}

// Generate AI coaching feedback
async function generateAICoachingFeedback(sessionData: {
  title: string;
  sessionType: string;
  duration: number;
  rating: number;
  notes?: string | null;
}): Promise<string> {
  try {
    const prompt = `作为一位专业的中式八球台球教练，请为以下训练内容提供简洁的反馈建议（100字以内）：

训练项目：${sessionData.title}
训练类型：${sessionData.sessionType === 'guided' ? '系统训练' : sessionData.sessionType === 'custom' ? '自主训练' : '特训模式'}
训练时长：${sessionData.duration}分钟
自我评分：${sessionData.rating}/5星
训练笔记：${sessionData.notes || '无'}

请提供：
1. 针对性的技术建议
2. 下次训练重点
3. 鼓励性总结

回复要专业、简洁、实用。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "训练完成！继续保持努力，技术会持续提升。";
  } catch (error) {
    console.error('AI feedback generation error:', error);
    return "训练完成！继续保持努力，技术会持续提升。";
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  
  // Setup session-based auth middleware
  await setupAuth(app);
  
  // Serve assessment images as static files
  const assessmentsPath = path.join(process.cwd(), 'assessments');
  app.use('/assessments', express.static(assessmentsPath));
  
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      if (!hasDatabase) {
        return res.json({ ...demoUserResponse });
      }

      const user = await storage.getUser(userId);

      // Add session debugging info
      if (process.env.NODE_ENV === 'development') {
        const sessionUser = getSessionUser(req);
        if (sessionUser) {
          console.log(`Auth check for user ${userId}: session valid, token expires at ${new Date(sessionUser.expires_at * 1000)}`);
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get current user
  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      // Prevent caching to ensure fresh data after training completions
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = requireSessionUserId(req);
      if (!hasDatabase) {
        return res.json({ ...demoUserResponse });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user training streak data
  app.get("/api/user/streak", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      // Demo mode: return empty streak data
      if (!hasDatabase) {
        return res.json({
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          recentDays: []
        });
      }

      const sessions = await storage.getUserTrainingSessions(userId);
      const completedSessions = sessions.filter(s => s.completed);

      // Calculate streak data
      const streakData = calculateTrainingStreak(completedSessions);

      res.json(streakData);
    } catch (error) {
      console.error("Streak calculation error:", error);
      res.status(500).json({ message: "Failed to calculate streak" });
    }
  });

  // Update user streak
  app.post("/api/user/streak", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const user = await storage.updateUserStreak(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update streak" });
    }
  });

  // Recalculate user experience points
  app.post("/api/recalculate-experience", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const result = await recalculateUserExperience(userId);
      res.json(result);
    } catch (error) {
      console.error("Experience recalculation error:", error);
      res.status(500).json({ message: "Failed to recalculate experience" });
    }
  });

  // Get users ranking (all users sorted by experience)
  app.get("/api/users/ranking", isAuthenticated, async (req, res) => {
    try {
      // Get all users and sort by experience
      const allUsers = await storage.getAllUsers();

      if (!allUsers || allUsers.length === 0) {
        return res.json([]);
      }

      // Transform users to ranking format with rank numbers
      const rankings = allUsers.map((user, index) => ({
        id: user.id,
        name: user.firstName || user.email?.split('@')[0] || 'User',
        level: user.level || 1,
        exp: user.exp || 0,
        streak: user.streak || 0,
        totalTime: user.totalTime || 0,
        achievements: 0, // TODO: Calculate actual achievements count
        profileImageUrl: user.profileImageUrl,
        rank: index + 1
      }));

      res.json(rankings);
    } catch (error) {
      console.error("Ranking error:", error);
      res.status(500).json({ message: "Failed to get rankings" });
    }
  });

  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // Get today's daily course
  app.get("/api/daily-course/today", async (req, res) => {
    try {
      const todaysCourse = getTodaysCourse();
      res.json(todaysCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's course" });
    }
  });

  // Get course by day
  app.get("/api/daily-course/:day", async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      if (isNaN(day) || day < 1 || day > 52) {
        return res.status(400).json({ message: "Invalid day number" });
      }
      const course = getCourseByDay(day);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to get course" });
    }
  });

  // Get all daily courses
  app.get("/api/daily-courses", async (req, res) => {
    try {
      res.json(DAILY_COURSES);
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily courses" });
    }
  });

  // Get today's tasks for user
  app.get("/api/user/tasks/today", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const userTasks = await storage.getTodayUserTasks(userId);
      res.json(userTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's tasks" });
    }
  });

  // Complete a task
  app.post("/api/user/tasks/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const userId = requireSessionUserId(req);
      const userTask = await storage.completeUserTask(parseInt(id), rating);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get task details for AI feedback
      const allUserTasks = await storage.getUserTasks(userId);
      const taskData = allUserTasks.find(ut => ut.id === parseInt(id));
      
      if (!taskData) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Generate AI feedback
      const aiFeedback = await generateCoachingFeedback({
        duration: 30, // Default session duration
        summary: `完成练习: ${taskData.task.title}`,
        rating: rating,
        exerciseType: taskData.task.category,
        level: user.level
      });

      // Save feedback to storage
      await storage.createFeedback({
        userId,
        taskId: taskData.taskId,
        content: aiFeedback,
        rating: rating,
        date: new Date(),
      });

      res.json({
        userTask,
        feedback: aiFeedback
      });
    } catch (error) {
      console.error("Task completion error:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Get diary entries
  app.get("/api/diary", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      // Demo mode: return empty array
      if (!hasDatabase) {
        return res.json([]);
      }

      const entries = await storage.getDiaryEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get diary entries" });
    }
  });

  // Create diary entry
  app.post("/api/diary", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      const { content, duration, rating, exerciseCompleted } = req.body;
      const userId = requireSessionUserId(req);

      // Demo mode: return success without saving
      if (!hasDatabase) {
        return res.json({
          id: Date.now(),
          userId,
          content,
          duration: duration ? parseInt(duration) : null,
          rating: rating ? parseInt(rating) : null,
          imageUrl: null,
          date: new Date(),
          createdAt: new Date()
        });
      }

      const storedImage = await persistUploadedImage(req.file);

      const entryData = {
        userId,
        content,
        duration: duration ? parseInt(duration) : null,
        rating: rating ? parseInt(rating) : null,
        imageUrl: storedImage?.url || null,
        date: new Date(),
      };

      const validatedData = insertDiaryEntrySchema.parse(entryData);
      const entry = await storage.createDiaryEntry(validatedData);
      
      // Award experience and update user progress if this is an exercise completion
      if (exerciseCompleted && rating) {
        const user = await storage.getUser(userId);
        if (user) {
          // Extract exercise info from diary content - support multiple formats
          let exerciseNumber = null;
          
          // Try different patterns to match exercise numbers
          const patterns = [
            /第(\d+)题练习/,           // 第7题练习
            /第(\d+)题/,              // 第7题
            /练习第(\d+)题/,          // 练习第7题
            /(\d+)题练习/,            // 7题练习
            /题目(\d+)/,              // 题目7
            /exercise\s*(\d+)/i,      // exercise 7
            /第(\d+)道题/,            // 第7道题
            /完成了.*第(\d+)题/,       // 完成了第7题
          ];
          
          for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
              exerciseNumber = parseInt(match[1]);
              break;
            }
          }
          
          if (exerciseNumber) {
            // Calculate experience based on exercise completion
            const expGained = calculateTrainingExperience({
              sessionType: "custom",
              duration: (duration || 1) * 60, // Convert minutes to seconds
              rating: parseInt(rating),
              difficulty: "初级"
            });
            
            const newExp = user.exp + expGained;
            const newCompletedTasks = user.completedTasks + 1;
            
            // Update exercise progression - any completed exercise should advance the user
            const currentLevel = user.level || 1;
            const completedExercises = (user.completedExercises as Record<string, number>) || {};
            const currentLevelCompleted = completedExercises[currentLevel.toString()] || 0;
            
            // Update completion count for this level
            const newLevelCompleted = Math.max(currentLevelCompleted, exerciseNumber);
            const newCompletedExercises = {
              ...completedExercises,
              [currentLevel.toString()]: newLevelCompleted
            };
            
            // Calculate new level based on experience
            const levelInfo = calculateUserLevel(newExp);
            
            // Update user data - completing any exercise advances progress
            await storage.updateUser(userId, {
              exp: newExp,
              level: levelInfo.level,
              completedTasks: newCompletedTasks,
              currentExercise: newLevelCompleted + 1,
              completedExercises: newCompletedExercises
            });
            
            console.log(`Exercise ${exerciseNumber} completed! User gained ${expGained} exp. Level ${currentLevel} progress: ${newLevelCompleted} exercises completed. New level: ${levelInfo.level}`);
            
            // Check if user should advance to next level
            const levelExerciseCounts: Record<number, number> = {
              1: 35, 2: 40, 3: 50, 4: 60, 5: 52, 6: 62, 7: 72, 8: 72, 9: 72
            };
            const exercisesNeededForNextLevel = levelExerciseCounts[currentLevel] || 35;
            
            if (newLevelCompleted >= Math.ceil(exercisesNeededForNextLevel * 0.7)) { // 70% completion threshold
              const nextLevel = currentLevel + 1;
              if (nextLevel <= 9) { // Max level is 9
                await storage.updateUser(userId, {
                  level: nextLevel,
                  currentExercise: 1,
                  exp: newExp
                });
                console.log(`User advanced to level ${nextLevel}! Completed ${newLevelCompleted}/${exercisesNeededForNextLevel} exercises in level ${currentLevel}.`);
              }
            }
          }
        }
      }
      
      // Respond immediately to user
      res.json(entry);
      
      // Generate AI insights asynchronously in the background (non-blocking)
      if (content && content.length > 10) {
        setImmediate(async () => {
          try {
            const user = await storage.getUser(userId);
            if (user) {
              const insights = await generateDiaryInsights(content, user.level, user.completedTasks);
              // You could save insights as feedback or return them directly
              console.log("AI insights generated in background for diary entry:", entry.id);
            }
          } catch (error) {
            console.error("Background AI insights generation failed:", error);
          }
        });
      }
    } catch (error) {
      console.error("Diary creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid diary data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create diary entry" });
    }
  });

  // Get user feedbacks
  app.get("/api/feedbacks", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const feedbacks = await storage.getUserFeedbacks(userId);
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feedbacks" });
    }
  });

  // Generate coaching feedback for training session
  app.post("/api/coaching-feedback", async (req, res) => {
    try {
      // Support both old format (summary) and new format (sessionType + notes)
      const { duration, summary, notes, sessionType, rating, exerciseType, level } = req.body;

      // Use notes if provided (new format), otherwise fall back to summary (old format)
      const trainingNotes = notes || summary;

      if (!duration || !trainingNotes) {
        return res.status(400).json({ message: "Duration and training notes are required" });
      }

      const feedback = await generateCoachingFeedback({
        duration: parseInt(duration),
        summary: trainingNotes.trim(),
        rating: rating ? parseInt(rating) : null,
        exerciseType: sessionType || exerciseType,
        level
      });

      res.json({ feedback });
    } catch (error) {
      console.error("Coaching feedback error:", error);
      res.status(500).json({ message: "Failed to generate coaching feedback" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  app.get("/api/user-achievements", isAuthenticated, async (req, res) => {
    try {
      // Prevent caching to ensure fresh achievement data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userId = requireSessionUserId(req);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user achievements" });
    }
  });

  app.post("/api/check-achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const newAchievements = await storage.checkAndUnlockAchievements(userId);
      res.json(newAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Initialize achievements (admin/development only)
  app.post("/api/admin/init-achievements", async (req, res) => {
    try {
      const result = await storage.initializeAchievements();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to initialize achievements",
        error: error.message
      });
    }
  });

  // === Daily Goals Routes ===

  // Get user's daily goals
  app.get("/api/goals/daily", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const goals = await getUserGoalsWithDetails(userId);
      res.json(goals);
    } catch (error: any) {
      console.error("Failed to get daily goals:", error);
      res.status(500).json({
        message: "Failed to get daily goals",
        error: error.message
      });
    }
  });

  // Initialize goal templates (admin/development only)
  app.post("/api/admin/init-goal-templates", async (req, res) => {
    try {
      const result = await initializeGoalTemplates();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to initialize goal templates",
        error: error.message
      });
    }
  });

  // Training program routes
  app.get("/api/training-programs", async (req, res) => {
    try {
      // Demo mode: return empty array
      if (!hasDatabase) {
        return res.json([]);
      }

      const programs = await storage.getAllTrainingPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training programs" });
    }
  });

  app.get("/api/training-programs/:id", async (req, res) => {
    try {
      const program = await storage.getTrainingProgram(parseInt(req.params.id));
      if (!program) {
        return res.status(404).json({ message: "Training program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training program" });
    }
  });

  app.get("/api/training-programs/:id/days", async (req, res) => {
    try {
      const days = await storage.getTrainingDays(parseInt(req.params.id));
      res.json(days);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training days" });
    }
  });

  app.get("/api/training-programs/:programId/days/:day", async (req, res) => {
    try {
      const day = await storage.getTrainingDay(parseInt(req.params.programId), parseInt(req.params.day));
      if (!day) {
        return res.status(404).json({ message: "Training day not found" });
      }
      res.json(day);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training day" });
    }
  });

  // Training session routes
  app.get("/api/training-sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const sessions = await storage.getUserTrainingSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training sessions" });
    }
  });

  app.get("/api/training-sessions/current", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const session = await storage.getCurrentTrainingSession(userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current training session" });
    }
  });

  app.post("/api/training-sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      console.log('Training session request body:', JSON.stringify(req.body, null, 2));
      const requestData = { ...req.body, userId };
      const validatedData = insertTrainingSessionSchema.parse(requestData);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      
      // Generate AI coaching feedback if session is completed
      let aiFeedback: string | null = null;
      if (validatedData.completed && validatedData.rating && validatedData.duration) {
        console.log('Generating AI feedback for session:', validatedData.title);
        aiFeedback = await generateAICoachingFeedback({
          title: validatedData.title,
          sessionType: validatedData.sessionType || "custom",
          duration: validatedData.duration,
          rating: validatedData.rating,
          notes: validatedData.notes || null
        });
        console.log('AI feedback generated:', aiFeedback);
      }
      
      const sessionWithAI = { 
        ...validatedData, 
        aiFeedback,
        completedAt: validatedData.completed ? new Date() : null
      };
      const session = await storage.createTrainingSession(sessionWithAI);
      
      // If session is completed, update user stats and check achievements
      if (validatedData.completed) {
        console.log('Session completed, updating user stats...');
        
        // Get program details for difficulty calculation
        let programDifficulty = "新手";
        if (validatedData.programId) {
          const program = await storage.getTrainingProgram(validatedData.programId);
          if (program) {
            programDifficulty = program.difficulty;
          }
        }
        
        // Calculate experience points
        const sessionType = validatedData.sessionType === "special" ? "custom" : (validatedData.sessionType || "custom");
        const expGained = calculateTrainingExperience({
          sessionType: sessionType as "guided" | "custom",
          duration: validatedData.duration || 0,
          rating: validatedData.rating || undefined,
          programDifficulty
        });
        
        console.log('Experience gained:', expGained);
        
        // Award experience and update user stats
        const currentUser = await storage.getUser(validatedData.userId);
        if (currentUser) {
          const newTotalExp = currentUser.exp + expGained;
          const levelInfo = calculateUserLevel(newTotalExp);
          
          console.log('Before update - Current user stats:', {
            exp: currentUser.exp,
            completedTasks: currentUser.completedTasks,
            totalTime: currentUser.totalTime
          });
          
          const updateData: any = {
            exp: newTotalExp,
            level: levelInfo.level,
            completedTasks: currentUser.completedTasks + 1,
            totalTime: currentUser.totalTime + Math.floor((validatedData.duration || 0) / 60)
          };

          // If this is a guided training session (system training), advance to next day
          if (validatedData.sessionType === "guided" && validatedData.dayId) {
            const nextDay = validatedData.dayId + 1;
            // Cap at 30 days for the main program
            updateData.currentDay = Math.min(nextDay, 30);
            console.log('Advancing user to day:', updateData.currentDay);
          }

          console.log('Updating user with data:', updateData);

          const updatedUser = await storage.updateUser(validatedData.userId, updateData);
          
          console.log('After update - User stats:', {
            exp: updatedUser.exp,
            completedTasks: updatedUser.completedTasks,
            totalTime: updatedUser.totalTime
          });
          
          // Check and unlock achievements after updating user stats
          await storage.checkAndUnlockAchievements(validatedData.userId);

          // Update daily goals progress
          try {
            await updateGoalProgress(validatedData.userId, {
              type: "TRAINING_COMPLETED",
              duration: Math.floor((validatedData.duration || 0) / 60), // Convert seconds to minutes
              rating: validatedData.rating || null,
            });
            console.log('Daily goals progress updated');
          } catch (error) {
            console.error('Failed to update daily goals:', error);
            // Don't fail the whole request if goal update fails
          }

          // Auto-progress to next episode if this was a guided session from training program
          if (validatedData.programId && validatedData.dayId && validatedData.sessionType === "guided") {
            try {
              const program = await storage.getTrainingProgram(validatedData.programId);
              if (program && program.name === "耶氏台球学院系统教学") {
                const currentDay = validatedData.dayId;
                const nextDay = currentDay + 1;
                
                if (nextDay <= 30) { // Only progress if within 30-day program
                  // Update program current day
                  await storage.updateTrainingProgram(validatedData.programId, { currentDay: nextDay });
                  console.log(`Auto-progressed from day ${currentDay} to day ${nextDay} of training program`);
                }
              }
            } catch (error) {
              console.error("Failed to auto-progress training program:", error);
              // Don't fail the whole request if auto-progress fails
            }
          }
        }
      }
      
      res.json(session);
    } catch (error) {
      console.error('Training session validation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        res.status(400).json({ 
          message: "Invalid training session data", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Invalid training session data" });
      }
    }
  });

  app.patch("/api/training-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateTrainingSession(parseInt(req.params.id), req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update training session" });
    }
  });

  app.delete("/api/training-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Get session details before deletion to check if we need to update program progress
      const sessionDetails = await storage.getTrainingSession(sessionId);
      
      await storage.deleteTrainingSession(sessionId);
      
      // Update training program progress if this was a guided session
      if (sessionDetails && sessionDetails.programId && sessionDetails.sessionType === "guided") {
        const userId = sessionDetails.userId;
        const programId = sessionDetails.programId;
        
        // Get all remaining completed guided sessions for this program
        const allSessions = await storage.getUserTrainingSessions(userId);
        const completedGuidedSessions = allSessions.filter(s => 
          s.completed && 
          s.sessionType === "guided" && 
          s.programId === programId
        );
        
        // Find the highest completed day, or reset to day 1 if no sessions remain
        let maxCompletedDay = 0;
        completedGuidedSessions.forEach(session => {
          if (session.dayId && session.dayId > maxCompletedDay) {
            maxCompletedDay = session.dayId;
          }
        });
        
        // Set current day to the next day after the highest completed day
        const newCurrentDay = maxCompletedDay + 1;
        await storage.updateTrainingProgram(programId, { currentDay: newCurrentDay });
        
        console.log(`Updated training program ${programId} current day to ${newCurrentDay} after session deletion`);
      }
      
      res.json({ message: "Training session deleted successfully" });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ message: "Failed to delete training session" });
    }
  });

  app.post("/api/training-sessions/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const { duration, rating, notes } = req.body;
      const sessionId = parseInt(req.params.id);
      
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      if (duration && (isNaN(duration) || duration < 0)) {
        return res.status(400).json({ message: "Invalid duration" });
      }
      
      if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Get session details before completion
      const sessionDetails = await storage.getTrainingSession(sessionId);
      if (!sessionDetails) {
        return res.status(404).json({ message: "Training session not found" });
      }
      
      // Get program details for difficulty calculation
      let programDifficulty = "新手";
      if (sessionDetails.programId) {
        const program = await storage.getTrainingProgram(sessionDetails.programId);
        if (program) {
          programDifficulty = program.difficulty;
        }
      }
      
      // Calculate experience points
      const expGained = calculateTrainingExperience({
        sessionType: sessionDetails.sessionType as "guided" | "custom",
        duration: duration || 0,
        rating: rating || undefined,
        programDifficulty
      });
      
      // Complete the session
      const session = await storage.completeTrainingSession(sessionId, duration, rating, notes);
      
      // Award experience and update user stats
      const currentUser = await storage.getUser(sessionDetails.userId);
      if (currentUser) {
        const newTotalExp = currentUser.exp + expGained;
        const levelInfo = calculateUserLevel(newTotalExp);
        
        console.log('Before update - Current user stats:', {
          exp: currentUser.exp,
          completedTasks: currentUser.completedTasks,
          totalTime: currentUser.totalTime
        });
        
        const updateData = {
          exp: newTotalExp,
          level: levelInfo.level,
          completedTasks: (currentUser.completedTasks || 0) + 1,
          totalTime: (currentUser.totalTime || 0) + Math.floor((duration || 0) / 60)
        };
        
        console.log('Updating user with data:', updateData);
        
        const updatedUser = await storage.updateUser(sessionDetails.userId, updateData);
        
        console.log('After update - User stats:', {
          exp: updatedUser.exp,
          completedTasks: updatedUser.completedTasks,
          totalTime: updatedUser.totalTime
        });
        
        // Check and unlock achievements after updating user stats
        await storage.checkAndUnlockAchievements(sessionDetails.userId);
      }
      
      // Auto-progress to next episode if this was a guided session from training program
      if (sessionDetails.programId && sessionDetails.dayId && sessionDetails.sessionType === "guided") {
        try {
          const program = await storage.getTrainingProgram(sessionDetails.programId);
          if (program && program.name === "耶氏台球学院系统教学") {
            const currentDay = sessionDetails.dayId;
            const nextDay = currentDay + 1;
            
            if (nextDay <= 30) { // Only progress if within 30-day program
              // Update program current day
              await storage.updateTrainingProgram(sessionDetails.programId, { currentDay: nextDay });
              console.log(`Auto-progressed to day ${nextDay} of training program`);
            }
          }
        } catch (error) {
          console.error("Failed to auto-progress training program:", error);
          // Don't fail the whole request if auto-progress fails
        }
      }
      
      // Return session with experience info
      res.json({
        ...session,
        expGained,
        experienceBreakdown: getExperienceBreakdown({
          sessionType: sessionDetails.sessionType as "guided" | "custom",
          duration: duration || 0,
          rating: rating || undefined,
          programDifficulty
        })
      });
    } catch (error) {
      console.error("Training completion error:", error);
      res.status(500).json({ message: "Failed to complete training session" });
    }
  });

  // Training notes routes
  app.get("/api/training-sessions/:sessionId/notes", async (req, res) => {
    try {
      const notes = await storage.getTrainingNotes(parseInt(req.params.sessionId));
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training notes" });
    }
  });

  // Get all training logs/notes for a user
  app.get("/api/training-logs", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const logs = await storage.getAllTrainingNotes(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training logs" });
    }
  });

  // Get training records (completed sessions) for a user
  app.get("/api/training-records", isAuthenticated, async (req, res) => {
    try {
      // Prevent caching to ensure fresh data after deletions
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      const userId = requireSessionUserId(req);

      // Demo mode: return empty array
      if (!hasDatabase) {
        return res.json([]);
      }

      const sessions = await storage.getUserTrainingSessions(userId);
      const completedSessions = sessions.filter(s => s.completed).map(s => ({
        id: s.id,
        userId: s.userId,
        title: s.title,
        content: s.notes || "训练已完成",
        duration: s.duration,
        rating: s.rating,
        completedAt: s.completedAt,
        sessionType: s.sessionType,
        notes: s.notes,
        aiFeedback: s.aiFeedback
      }));
      res.json(completedSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training records" });
    }
  });

  // Update training record notes
  app.patch("/api/training-records/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (!notes && notes !== "") {
        return res.status(400).json({ message: "Notes field is required" });
      }

      const userId = requireSessionUserId(req);
      const session = await storage.getTrainingSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Training record not found" });
      }
      
      const updatedSession = await storage.updateTrainingSession(sessionId, { notes });
      res.json({
        id: updatedSession.id,
        userId: updatedSession.userId,
        title: updatedSession.title,
        content: updatedSession.notes || "训练已完成",
        duration: updatedSession.duration,
        rating: updatedSession.rating,
        completedAt: updatedSession.completedAt,
        sessionType: updatedSession.sessionType
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update training record" });
    }
  });

  // Delete training record
  app.delete("/api/training-records/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Get session details before deletion to check if we need to update program progress
      const sessionDetails = await storage.getTrainingSession(sessionId);

      const userId = requireSessionUserId(req);
      if (!sessionDetails || sessionDetails.userId !== userId) {
        return res.status(404).json({ message: "Training record not found" });
      }
      
      await storage.deleteTrainingSession(sessionId);
      
      // Update training program progress if this was a guided session
      if (sessionDetails.programId && sessionDetails.sessionType === "guided") {
        const programId = sessionDetails.programId;
        
        // Get all remaining completed guided sessions for this program
        const allSessions = await storage.getUserTrainingSessions(userId);
        const completedGuidedSessions = allSessions.filter(s => 
          s.completed && 
          s.sessionType === "guided" && 
          s.programId === programId
        );
        
        // Find the highest completed day, or reset to day 1 if no sessions remain
        let maxCompletedDay = 0;
        completedGuidedSessions.forEach(session => {
          if (session.dayId && session.dayId > maxCompletedDay) {
            maxCompletedDay = session.dayId;
          }
        });
        
        // Set current day to the next day after the highest completed day
        const newCurrentDay = maxCompletedDay + 1;
        await storage.updateTrainingProgram(programId, { currentDay: newCurrentDay });
        
        console.log(`Updated training program ${programId} current day to ${newCurrentDay} after record deletion`);
      }
      
      res.json({ message: "Training record deleted successfully" });
    } catch (error) {
      console.error("Delete training record error:", error);
      res.status(500).json({ message: "Failed to delete training record" });
    }
  });

  // Reset training program progress
  app.post("/api/training-programs/:id/reset-progress", isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const userId = requireSessionUserId(req);
      
      // Get all remaining completed guided sessions for this program
      const allSessions = await storage.getUserTrainingSessions(userId);
      const completedGuidedSessions = allSessions.filter(s => 
        s.completed && 
        s.sessionType === "guided" && 
        s.programId === programId
      );
      
      // Find the highest completed day, or reset to day 1 if no sessions remain
      let maxCompletedDay = 0;
      completedGuidedSessions.forEach(session => {
        if (session.dayId && session.dayId > maxCompletedDay) {
          maxCompletedDay = session.dayId;
        }
      });
      
      // Set current day to the next day after the highest completed day
      const newCurrentDay = maxCompletedDay + 1;
      const updatedProgram = await storage.updateTrainingProgram(programId, { currentDay: newCurrentDay });
      
      console.log(`Reset training program ${programId} current day to ${newCurrentDay}`);
      
      res.json({ 
        message: "Training program progress reset successfully",
        program: updatedProgram,
        newCurrentDay
      });
    } catch (error) {
      console.error("Reset training program error:", error);
      res.status(500).json({ message: "Failed to reset training program progress" });
    }
  });

  // Progress to next episode
  app.post("/api/training-programs/next-episode", isAuthenticated, async (req, res) => {
    try {
      const programs = await storage.getAllTrainingPrograms();
      const beginnerProgram = programs.find(p => p.name === "耶氏台球学院系统教学");
      
      if (beginnerProgram) {
        const currentDay = beginnerProgram.currentDay || 1;
        const nextDay = Math.min(currentDay + 1, 30); // Limit to 30 episodes
        await storage.updateTrainingProgram(beginnerProgram.id, { currentDay: nextDay });
        
        // Create new session for next episode
        const newSession = await storage.createTrainingSession({
          userId: requireSessionUserId(req),
          programId: beginnerProgram.id,
          dayId: nextDay,
          title: `第${nextDay}集：${nextDay <= 17 ? '基础技能训练' : nextDay <= 34 ? '中级技术提升' : '高级技巧掌握'}`,
          description: `第${nextDay}集训练内容，持续提升台球技能。`,
          sessionType: "guided"
        });
        
        res.json(newSession);
      } else {
        res.status(404).json({ message: "Training program not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to progress to next episode" });
    }
  });

  app.post("/api/training-sessions/:sessionId/notes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTrainingNoteSchema.parse({
        ...req.body,
        sessionId: parseInt(req.params.sessionId)
      });
      const note = await storage.createTrainingNote(validatedData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid training note data" });
    }
  });

  // Skip level challenge endpoint
  app.post("/api/user/skip-level", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      const { targetLevel, challengeScore } = req.body;
      
      if (!targetLevel || challengeScore === undefined) {
        return res.status(400).json({ message: "Missing targetLevel or challengeScore" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate that user is eligible to skip to this level
      if (targetLevel <= user.level) {
        return res.status(400).json({ message: "Cannot skip to a level at or below current level" });
      }

      if (targetLevel > user.level + 3) {
        return res.status(400).json({ message: "Cannot skip more than 3 levels at once" });
      }

      // Check if challenge score is sufficient (80% required)
      if (challengeScore < 80) {
        return res.status(400).json({ 
          message: "Challenge score too low", 
          score: challengeScore,
          required: 80 
        });
      }

      // Calculate experience needed for target level
      const getExpForLevel = (level: number) => {
        if (level <= 1) return 0;
        if (level === 2) return 1000;
        if (level === 3) return 2000;
        if (level === 4) return 3000;
        if (level === 5) return 4000;
        if (level === 6) return 5000;
        if (level === 7) return 6000;
        if (level === 8) return 7000;
        return (level - 1) * 1000;
      };

      const newExp = getExpForLevel(targetLevel);
      
      // Mark all exercises from previous levels as completed
      const currentCompletedExercises: Record<string, number> = (user.completedExercises as Record<string, number>) || {};
      
      for (let level = 1; level < targetLevel; level++) {
        // Calculate how many exercises exist for each level
        let exerciseCount;
        if (level === 1) exerciseCount = 35; // Level 1 has 35 exercises
        else if (level === 2) exerciseCount = 40; // Level 2 has 40 exercises  
        else if (level === 3) exerciseCount = 50; // Level 3 has 50 exercises
        else if (level === 4) exerciseCount = 60; // Level 4 has 60 exercises
        else if (level === 5) exerciseCount = 60; // Level 5 has 60 exercises
        else if (level === 6) exerciseCount = 60; // Level 6 has 60 exercises
        else if (level === 7) exerciseCount = 55; // Level 7 has 55 exercises
        else if (level === 8) exerciseCount = 55; // Level 8 has 55 exercises
        else exerciseCount = 55; // Default for higher levels

        // Mark all exercises in this level as completed
        currentCompletedExercises[level.toString()] = exerciseCount;
      }

      // For target level, don't unlock all exercises - keep normal progression
      // Only set to 0 if no progress exists, otherwise keep existing progress
      if (!currentCompletedExercises[targetLevel.toString()]) {
        currentCompletedExercises[targetLevel.toString()] = 0;
      }

      // Update user with all changes at once
      const updatedUser = await storage.updateUser(userId, {
        level: targetLevel,
        exp: newExp,
        completedExercises: currentCompletedExercises,
        currentExercise: Math.max(1, currentCompletedExercises[targetLevel.toString()] + 1)
      });

      // Create diary entry for the skip level achievement
      await storage.createDiaryEntry({
        userId,
        content: `成功完成跳级挑战！从等级 ${user.level} 跳级到等级 ${targetLevel}。挑战得分：${challengeScore.toFixed(0)}%`,
        rating: 5,
        duration: 15
      });

      res.json({
        success: true,
        user: updatedUser,
        message: `Successfully skipped to level ${targetLevel}`,
        challengeScore
      });

    } catch (error) {
      console.error("Skip level error:", error);
      res.status(500).json({ message: "Failed to process skip level challenge" });
    }
  });

  // Get user statistics
  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const diaryEntries = await storage.getDiaryEntries(userId);
      const userTasks = await storage.getUserTasks(userId);
      const completedTasks = userTasks.filter(ut => ut.completed);

      const stats = {
        level: user.level,
        exp: user.exp,
        streak: user.streak,
        totalDays: user.totalDays,
        completedTasks: user.completedTasks,
        totalTime: user.totalTime,
        achievements: user.achievements,
        diaryCount: diaryEntries.length,
        averageRating: completedTasks.length > 0
          ? completedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / completedTasks.length
          : 0,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get training trend data (last 30 days)
  app.get("/api/user/stats/trend", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const days = parseInt(req.query.days as string) || 30;

      // Get training sessions from the last N days
      const trainingSessions = await storage.getUserTrainingSessions(userId);

      // Group by date and calculate total duration per day
      const trendMap = new Map<string, number>();
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      trainingSessions.forEach((session: any) => {
        const sessionDate = new Date(session.createdAt);
        if (sessionDate >= cutoffDate && session.completed) {
          const dateKey = sessionDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
          const currentDuration = trendMap.get(dateKey) || 0;
          trendMap.set(dateKey, currentDuration + (session.duration || 0));
        }
      });

      // Convert to array and sort by date
      const trendData = Array.from(trendMap.entries())
        .map(([date, duration]) => ({ date, duration }))
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      res.json(trendData);
    } catch (error) {
      console.error("Trend data error:", error);
      res.status(500).json({ message: "Failed to get trend data" });
    }
  });

  // Get user skill levels for radar chart
  app.get("/api/user/stats/skills", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const trainingSessions = await storage.getUserTrainingSessions(userId);
      const completedSessions = trainingSessions.filter((s: any) => s.completed);

      // Calculate skill levels based on training data
      // These are simplified calculations - you can make them more sophisticated
      const totalSessions = completedSessions.length;
      const avgRating = completedSessions.reduce((sum: any, s: any) => sum + (s.rating || 0), 0) / Math.max(totalSessions, 1);

      // Base skills calculation on level, experience, and training history
      const baseSkill = Math.min(20 + (user.level * 8), 100);
      const experienceBonus = Math.min((user.exp / 100), 30);

      const skills = [
        {
          name: '准度',
          value: Math.min(Math.round(baseSkill + experienceBonus + (avgRating * 5)), 100),
          fullMark: 100
        },
        {
          name: '力度',
          value: Math.min(Math.round(baseSkill + experienceBonus - 5), 100),
          fullMark: 100
        },
        {
          name: '走位',
          value: Math.min(Math.round(baseSkill + (experienceBonus * 0.8)), 100),
          fullMark: 100
        },
        {
          name: '策略',
          value: Math.min(Math.round(baseSkill + (experienceBonus * 0.9) + (totalSessions * 2)), 100),
          fullMark: 100
        },
        {
          name: '心态',
          value: Math.min(Math.round(baseSkill + experienceBonus + (user.streak * 3)), 100),
          fullMark: 100
        }
      ];

      res.json(skills);
    } catch (error) {
      console.error("Skills data error:", error);
      res.status(500).json({ message: "Failed to get skills data" });
    }
  });

  // Analyze single exercise image
  app.post("/api/analyze-exercise", async (req, res) => {
    try {
      const { level, levelName, exerciseNumber } = req.body;
      
      if (!level || !levelName || !exerciseNumber) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const exerciseNumberPadded = exerciseNumber.toString().padStart(2, '0');
      const imagePath = path.join(process.cwd(), 'assessments', `${level}、${levelName}`, `${level}、${levelName}_${exerciseNumberPadded}.jpg`);
      
      const analysis = await analyzeExerciseImage(imagePath);
      if (!analysis) {
        return res.status(404).json({ message: "Could not analyze image" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Failed to analyze exercise image" });
    }
  });

  // Batch analyze all exercises for a level
  app.post("/api/analyze-level", async (req, res) => {
    try {
      const { level, levelName, totalExercises } = req.body;
      
      if (!level || !levelName || !totalExercises) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const results = await batchAnalyzeExercises(level, levelName, totalExercises);
      res.json(results);
    } catch (error) {
      console.error("Batch analysis error:", error);
      res.status(500).json({ message: "Failed to analyze level exercises" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: "File not found" });
      }
    });
  });

  // Get adaptive learning path for user
  app.get("/api/adaptive-learning/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's exercise performance data
      const userTasks = await storage.getUserTasks(userId);
      const performance = userTasks
        .filter(ut => ut.completed)
        .map(ut => ({
          exerciseId: `${ut.task.level || 1}-${ut.task.id}`,
          stars: ut.rating || 1,
          attempts: Math.floor(Math.random() * 5) + 1
        }));

      const learningPath = adaptiveLearning.generateLearningPath(
        String(userId),
        user.level,
        performance
      );

      res.json(learningPath);
    } catch (error) {
      console.error("Adaptive learning error:", error);
      res.status(500).json({ message: "Failed to generate learning path" });
    }
  });

  // Get exercise complexity analysis
  app.post("/api/exercise-complexity", async (req, res) => {
    try {
      const { exerciseKey } = req.body;
      
      const requirementsPath = path.join(process.cwd(), 'client/src/data/exerciseRequirements.json');
      const requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
      
      const requirement = requirements[exerciseKey];
      if (!requirement) {
        return res.status(404).json({ message: "Exercise requirement not found" });
      }

      const complexity = adaptiveLearning.analyzeExerciseComplexity(requirement);
      complexity.level = parseInt(exerciseKey.split('-')[0]);
      complexity.exerciseNumber = parseInt(exerciseKey.split('-')[1]);

      res.json(complexity);
    } catch (error) {
      console.error("Complexity analysis error:", error);
      res.status(500).json({ message: "Failed to analyze exercise complexity" });
    }
  });

  // Manual correction endpoint for exercise requirements
  app.post("/api/correct-requirement", async (req, res) => {
    try {
      const { level, exerciseNumber, requirement } = req.body;
      
      if (!level || !exerciseNumber || !requirement) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const success = requirementCorrector.updateExerciseRequirement(level, exerciseNumber, requirement);
      
      if (success) {
        res.json({ 
          success: true, 
          message: `Updated ${level}-${exerciseNumber}: ${requirement}` 
        });
      } else {
        res.status(500).json({ message: "Failed to update requirement" });
      }
    } catch (error) {
      console.error("Requirement correction error:", error);
      res.status(500).json({ message: "Failed to correct requirement" });
    }
  });

  // Validate current requirements
  app.get("/api/validate-requirements", async (req, res) => {
    try {
      const validation = requirementCorrector.validateRequirements();
      res.json(validation);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ message: "Failed to validate requirements" });
    }
  });

  // Analyze table bounds in exercise image
  app.post("/api/analyze-table-bounds", async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const bounds = await analyzeTableBounds(imageUrl);
      res.json(bounds);
    } catch (error) {
      console.error("Table bounds analysis error:", error);
      res.status(500).json({ message: "Failed to analyze table bounds" });
    }
  });

  // === V2.1 Training System API Routes ===

  /**
   * GET /api/training/levels
   * Get all training levels with user progress summary
   */
  app.get("/api/training/levels", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ levels: [] });
      }

      const levels = await storage.getAllTrainingLevels(userId);
      res.json({ levels });
    } catch (error) {
      console.error("Error fetching training levels:", error);
      res.status(500).json({ message: "Failed to fetch training levels" });
    }
  });

  /**
   * GET /api/training/levels/:levelId
   * Get detailed training level data with full skill tree
   */
  app.get("/api/training/levels/:levelId", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { levelId } = req.params;

      if (!hasDatabase) {
        return res.status(404).json({ message: "Level not found" });
      }

      // Validate levelId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(levelId)) {
        return res.status(400).json({ message: "Invalid level ID format" });
      }

      const level = await storage.getTrainingLevelById(levelId, userId);

      if (!level) {
        return res.status(404).json({ message: "Level not found" });
      }

      res.json({ level });
    } catch (error) {
      console.error("Error fetching training level:", error);
      res.status(500).json({ message: "Failed to fetch training level" });
    }
  });

  /**
   * GET /api/training/units/:unitId
   * Get training unit details with content and user progress
   */
  app.get("/api/training/units/:unitId", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { unitId } = req.params;

      if (!hasDatabase) {
        return res.status(404).json({ message: "Unit not found" });
      }

      // Validate unitId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID format" });
      }

      const unit = await storage.getTrainingUnitById(unitId, userId);

      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }

      res.json({ unit });
    } catch (error) {
      console.error("Error fetching training unit:", error);
      res.status(500).json({ message: "Failed to fetch training unit" });
    }
  });

  /**
   * POST /api/training/progress/start
   * Start a training unit (mark as in_progress)
   */
  app.post("/api/training/progress/start", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { unitId } = req.body;

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Validate required fields
      if (!unitId) {
        return res.status(400).json({ message: "Unit ID is required" });
      }

      // Validate unitId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID format" });
      }

      // Get unit details to find levelId
      const unit = await storage.getTrainingUnitById(unitId, userId);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }

      // Find the levelId for this unit (query through relations)
      // For now, we'll need to pass levelId from the client or fetch it
      // Let's fetch it from the database
      const [unitWithLevel] = await storage['ensureDb']()
        .select({
          levelId: trainingSkills.levelId
        })
        .from(trainingUnits)
        .innerJoin(subSkills, eq(trainingUnits.subSkillId, subSkills.id))
        .innerJoin(trainingSkills, eq(subSkills.skillId, trainingSkills.id))
        .where(eq(trainingUnits.id, unitId))
        .limit(1);

      if (!unitWithLevel || !unitWithLevel.levelId) {
        return res.status(404).json({ message: "Unit configuration error" });
      }

      const progress = await storage.startTrainingUnit(
        userId,
        unitWithLevel.levelId as string,
        unitId
      );

      res.json({ progress });
    } catch (error) {
      console.error("Error starting training unit:", error);
      res.status(500).json({ message: "Failed to start training unit" });
    }
  });

  /**
   * POST /api/training/progress/update
   * Update training progress (during training)
   */
  app.post("/api/training/progress/update", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { unitId, progressData } = req.body;

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Validate required fields
      if (!unitId || !progressData) {
        return res.status(400).json({ message: "Unit ID and progress data are required" });
      }

      // Validate unitId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID format" });
      }

      const progress = await storage.updateTrainingProgress(userId, unitId, progressData);

      res.json({ progress });
    } catch (error) {
      console.error("Error updating training progress:", error);
      res.status(500).json({ message: "Failed to update training progress" });
    }
  });

  /**
   * POST /api/training/progress/complete
   * Complete a training unit and award XP
   */
  app.post("/api/training/progress/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { unitId, finalProgressData } = req.body;

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Validate required fields
      if (!unitId) {
        return res.status(400).json({ message: "Unit ID is required" });
      }

      // Validate unitId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID format" });
      }

      const result = await storage.completeTrainingUnit(
        userId,
        unitId,
        finalProgressData || {}
      );

      // Get updated user stats
      const user = await storage.getUser(userId);

      res.json({
        progress: result.progress,
        xpAwarded: result.xpAwarded,
        userStats: {
          totalXp: user?.exp || 0,
          level: user?.level || 1,
        },
      });
    } catch (error) {
      console.error("Error completing training unit:", error);
      res.status(500).json({ message: "Failed to complete training unit" });
    }
  });

  /**
   * GET /api/specialized-trainings
   * Get all specialized trainings (8 core skills)
   */
  app.get("/api/specialized-trainings", isAuthenticated, async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ trainings: [] });
      }

      const trainings = await storage.getAllSpecializedTrainings();
      res.json({ trainings });
    } catch (error) {
      console.error("Error fetching specialized trainings:", error);
      res.status(500).json({ message: "Failed to fetch specialized trainings" });
    }
  });

  /**
   * GET /api/specialized-trainings/:trainingId/plans
   * Get training plans for a specialized training
   */
  app.get("/api/specialized-trainings/:trainingId/plans", isAuthenticated, async (req, res) => {
    try {
      const { trainingId } = req.params;

      if (!hasDatabase) {
        return res.json({ plans: [] });
      }

      // Validate trainingId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trainingId)) {
        return res.status(400).json({ message: "Invalid training ID format" });
      }

      const plans = await storage.getSpecializedTrainingPlans(trainingId);
      res.json({ plans });
    } catch (error) {
      console.error("Error fetching training plans:", error);
      res.status(500).json({ message: "Failed to fetch training plans" });
    }
  });

  return;
}
