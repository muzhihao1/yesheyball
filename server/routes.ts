import express, { type Express, type Request } from "express";
import { storage } from "./storage.js";
import { db } from "./db.js";
import { setupAuth, isAuthenticated, getSessionUser, authDisabled, hasDatabase, demoUserResponse, demoUserProfile } from "./auth.js";
import { generateCoachingFeedback, generateDiaryInsights } from "./openai.js";
import { upload, persistUploadedImage } from "./upload.js";
import { insertDiaryEntrySchema, insertUserTaskSchema, insertTrainingSessionSchema, insertTrainingNoteSchema, trainingSkills, subSkills, trainingUnits, trainingLevels, userTrainingProgress, users, userSkillProgressV3, userNinetyDayProgress, ninetyDayTrainingRecords } from "../shared/schema.js";
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
import {
  processTrainingRecord,
  getUserAbilityScores,
  getUserTrainingHistory,
  type TrainingSubmission
} from "./abilityScoreEngine.js";

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

      // Fetch training records from BOTH systems
      // System 1: Skills Library (training_sessions table)
      const skillsLibrarySessions = await storage.getUserTrainingSessions(userId);
      const completedSkillsSessions = skillsLibrarySessions.filter(s => s.completed);

      // System 2: 90-Day Challenge (ninety_day_training_records table)
      const ninetyDaySessions = await db!
        .select()
        .from(ninetyDayTrainingRecords)
        .where(eq(ninetyDayTrainingRecords.userId, userId));

      // Merge both systems into unified format for streak calculation
      const allCompletedSessions = [
        // Skills Library sessions
        ...completedSkillsSessions.map(s => ({
          createdAt: s.createdAt,
          source: 'skills_library' as const
        })),
        // 90-Day Challenge sessions (use completedAt as the date)
        ...ninetyDaySessions.map(s => ({
          createdAt: s.completedAt,
          source: 'ninety_day_challenge' as const
        }))
      ];

      // Calculate streak data from merged sessions
      const streakData = calculateTrainingStreak(allCompletedSessions);

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

  // ============================================================================
  // V2.1 Advanced Training System API Endpoints
  // ============================================================================

  /**
   * GET /api/v2/training-path
   * Get complete training path for Level 4-8 with user progress
   * Returns nested structure: levels -> skills -> sub-skills -> units with progress
   */
  app.get("/api/v2/training-path", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ levels: [] });
      }

      const db = storage['ensureDb']();

      // Query all Level 4-8 data with nested relations
      const levels = await db
        .select()
        .from(trainingLevels)
        .where(sql`${trainingLevels.levelNumber} BETWEEN 4 AND 8`)
        .orderBy(trainingLevels.levelNumber);

      // For each level, get skills, sub-skills, and units with progress
      const levelsWithData = await Promise.all(
        levels.map(async (level) => {
          const skills = await db
            .select()
            .from(trainingSkills)
            .where(eq(trainingSkills.levelId, level.id))
            .orderBy(trainingSkills.skillOrder);

          const skillsWithData = await Promise.all(
            skills.map(async (skill) => {
              const subSkillsData = await db
                .select()
                .from(subSkills)
                .where(eq(subSkills.skillId, skill.id))
                .orderBy(subSkills.subSkillOrder);

              const subSkillsWithUnits = await Promise.all(
                subSkillsData.map(async (subSkill) => {
                  const units = await db
                    .select({
                      id: trainingUnits.id,
                      title: trainingUnits.title,
                      unitType: trainingUnits.unitType,
                      unitOrder: trainingUnits.unitOrder,
                      xpReward: trainingUnits.xpReward,
                      estimatedMinutes: trainingUnits.estimatedMinutes,
                      content: trainingUnits.content,
                      status: sql`COALESCE(${userTrainingProgress.status}, 'not_started')`,
                      completedAt: userTrainingProgress.completedAt,
                    })
                    .from(trainingUnits)
                    .leftJoin(
                      userTrainingProgress,
                      sql`${userTrainingProgress.unitId} = ${trainingUnits.id} AND ${userTrainingProgress.userId} = ${userId}`
                    )
                    .where(eq(trainingUnits.subSkillId, subSkill.id))
                    .orderBy(trainingUnits.unitOrder);

                  return {
                    ...subSkill,
                    units,
                  };
                })
              );

              return {
                ...skill,
                subSkills: subSkillsWithUnits,
              };
            })
          );

          return {
            ...level,
            skills: skillsWithData,
          };
        })
      );

      res.json({ levels: levelsWithData });
    } catch (error) {
      console.error("Error fetching V2.1 training path:", error);
      res.status(500).json({ message: "Failed to fetch training path" });
    }
  });

  /**
   * POST /api/v2/user-progress
   * Update user progress for a training unit
   * Body: { unitId, status, progressData }
   */
  app.post("/api/v2/user-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { unitId, status, progressData } = req.body;

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Validate required fields
      if (!unitId || !status) {
        return res.status(400).json({ message: "Unit ID and status are required" });
      }

      // Validate unitId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(unitId)) {
        return res.status(400).json({ message: "Invalid unit ID format" });
      }

      const db = storage['ensureDb']();

      // Get unit details to find levelId
      const [unit] = await db
        .select({
          unitId: trainingUnits.id,
          levelId: trainingSkills.levelId,
          xpReward: trainingUnits.xpReward,
        })
        .from(trainingUnits)
        .innerJoin(subSkills, eq(trainingUnits.subSkillId, subSkills.id))
        .innerJoin(trainingSkills, eq(subSkills.skillId, trainingSkills.id))
        .where(eq(trainingUnits.id, unitId))
        .limit(1);

      if (!unit) {
        return res.status(404).json({ message: "Training unit not found" });
      }

      // Upsert user progress
      const now = new Date();
      const progressRecord = {
        userId,
        levelId: unit.levelId,
        unitId,
        status,
        progressData: progressData || {},
        completedAt: status === 'completed' ? now : null,
        updatedAt: now,
      };

      await db
        .insert(userTrainingProgress)
        .values(progressRecord)
        .onConflictDoUpdate({
          target: [userTrainingProgress.userId, userTrainingProgress.unitId],
          set: {
            status,
            progressData: progressData || {},
            completedAt: status === 'completed' ? now : null,
            updatedAt: now,
          },
        });

      // If completed, award XP to user
      if (status === 'completed') {
        await db
          .update(users)
          .set({
            exp: sql`${users.exp} + ${unit.xpReward}`,
          })
          .where(eq(users.id, userId));
      }

      res.json({
        message: "Progress updated successfully",
        xpAwarded: status === 'completed' ? unit.xpReward : 0,
      });
    } catch (error) {
      console.error("Error updating V2.1 user progress:", error);
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  /**
   * GET /api/v2/recommendations
   * Get personalized training recommendations based on user progress
   * Returns units that are not started or incomplete, prioritized by level
   */
  app.get("/api/v2/recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ recommendations: [] });
      }

      const db = storage['ensureDb']();

      // Find incomplete units (not started or in progress)
      const recommendations = await db
        .select({
          unitId: trainingUnits.id,
          title: trainingUnits.title,
          unitType: trainingUnits.unitType,
          xpReward: trainingUnits.xpReward,
          estimatedMinutes: trainingUnits.estimatedMinutes,
          levelNumber: trainingLevels.levelNumber,
          skillName: trainingSkills.skillName,
          subSkillName: subSkills.subSkillName,
          status: sql`COALESCE(${userTrainingProgress.status}, 'not_started')`,
        })
        .from(trainingUnits)
        .innerJoin(subSkills, eq(trainingUnits.subSkillId, subSkills.id))
        .innerJoin(trainingSkills, eq(subSkills.skillId, trainingSkills.id))
        .innerJoin(trainingLevels, eq(trainingSkills.levelId, trainingLevels.id))
        .leftJoin(
          userTrainingProgress,
          sql`${userTrainingProgress.unitId} = ${trainingUnits.id} AND ${userTrainingProgress.userId} = ${userId}`
        )
        .where(
          sql`${trainingLevels.levelNumber} BETWEEN 4 AND 8 AND (${userTrainingProgress.status} IS NULL OR ${userTrainingProgress.status} != 'completed')`
        )
        .orderBy(trainingLevels.levelNumber, trainingUnits.unitOrder)
        .limit(10);

      // Add recommendation reason
      const recommendationsWithReason = recommendations.map((rec) => ({
        ...rec,
        reason:
          rec.status === 'not_started'
            ? '未开始训练'
            : rec.status === 'in_progress'
            ? '训练进行中'
            : '推荐练习',
      }));

      res.json({ recommendations: recommendationsWithReason });
    } catch (error) {
      console.error("Error fetching V2.1 recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
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

      // Validate trainingId is a valid VARCHAR format (st_*)
      const validIdRegex = /^st_[a-z_]+$/;
      if (!validIdRegex.test(trainingId)) {
        return res.status(400).json({ message: "Invalid training ID format" });
      }

      const plans = await storage.getSpecializedTrainingPlans(trainingId);
      res.json({ plans });
    } catch (error) {
      console.error("Error fetching training plans:", error);
      res.status(500).json({ message: "Failed to fetch training plans" });
    }
  });

  // ============================================================================
  // 90-Day Training System API Endpoints (Fu Jiajun V2.1)
  // ============================================================================

  /**
   * GET /api/tencore-skills
   * Get all ten core skills (Fu Jiajun's 十大招)
   * Returns list of 10 core skills with basic info
   */
  app.get("/api/tencore-skills", isAuthenticated, async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ skills: [] });
      }

      const skills = await storage.getTencoreSkills();
      res.json({ skills });
    } catch (error) {
      console.error("Error fetching ten core skills:", error);
      res.status(500).json({ message: "Failed to fetch ten core skills" });
    }
  });

  /**
   * GET /api/ninety-day/curriculum
   * Get 90-day curriculum with optional filters
   * Query params: dayNumber, skillId
   * Returns filtered curriculum data
   */
  app.get("/api/ninety-day/curriculum", isAuthenticated, async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ curriculum: [] });
      }

      const { dayNumber, skillId } = req.query;

      // Build filter params
      const params: { dayNumber?: number; skillId?: string } = {};
      if (dayNumber) {
        const day = parseInt(dayNumber as string);
        if (isNaN(day) || day < 1 || day > 90) {
          return res.status(400).json({ message: "Day number must be between 1 and 90" });
        }
        params.dayNumber = day;
      }
      if (skillId) {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(skillId as string)) {
          return res.status(400).json({ message: "Invalid skill ID format" });
        }
        params.skillId = skillId as string;
      }

      const curriculum = await storage.getNinetyDayCurriculum(params);
      res.json({ curriculum });
    } catch (error) {
      console.error("Error fetching 90-day curriculum:", error);
      res.status(500).json({ message: "Failed to fetch 90-day curriculum" });
    }
  });

  /**
   * GET /api/ninety-day/progress
   * Get current user's 90-day training progress
   * Returns progress data including completed days, skill progress, current day
   */
  app.get("/api/ninety-day/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({
          currentDay: 1,
          completedDays: [],
          tencoreProgress: {},
          specializedProgress: {},
          totalTrainingTime: 0
        });
      }

      const progress = await storage.getUserNinetyDayProgress(userId);

      // Initialize progress if not exists
      if (!progress) {
        const newProgress = await storage.initializeUserNinetyDayProgress(userId);
        return res.json(newProgress);
      }

      res.json(progress);
    } catch (error) {
      console.error("Error fetching 90-day progress:", error);
      res.status(500).json({ message: "Failed to fetch 90-day progress" });
    }
  });

  /**
   * POST /api/ninety-day/complete-day
   * Complete a day's training in the 90-day curriculum
   * Body: { dayNumber, duration, rating, notes? }
   * Returns updated progress and training record
   */
  app.post("/api/ninety-day/complete-day", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);
      const { dayNumber, duration, rating, notes } = req.body;

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      // Validate required fields
      if (!dayNumber || duration === undefined || rating === undefined) {
        return res.status(400).json({
          message: "Day number, duration, and rating are required"
        });
      }

      // Validate day number
      const day = parseInt(dayNumber);
      if (isNaN(day) || day < 1 || day > 90) {
        return res.status(400).json({ message: "Day number must be between 1 and 90" });
      }

      // Validate duration
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum < 0) {
        return res.status(400).json({ message: "Duration must be a non-negative number" });
      }

      // Validate rating
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      // Complete the training day
      const result = await storage.completeNinetyDayTraining(
        userId,
        day,
        durationNum,
        ratingNum,
        notes
      );

      console.log(`90-day training completed: user ${userId}, day ${day}, duration ${durationNum}min, rating ${ratingNum}/5`);

      res.json({
        message: "Training day completed successfully",
        record: result.record,
        progress: result.progress
      });
    } catch (error) {
      console.error("Error completing 90-day training:", error);
      res.status(500).json({ message: "Failed to complete training day" });
    }
  });

  /**
   * GET /api/ninety-day/specialized-training
   * Get specialized training exercises for 90-day system
   * Query param: category (optional) - filter by training category
   * Returns list of specialized training exercises
   */
  app.get("/api/ninety-day/specialized-training", isAuthenticated, async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ trainings: [] });
      }

      const { category } = req.query;
      const trainings = await storage.getNinetyDaySpecializedTrainings(
        category ? String(category) : undefined
      );

      res.json({ trainings });
    } catch (error) {
      console.error("Error fetching 90-day specialized training:", error);
      res.status(500).json({ message: "Failed to fetch specialized training" });
    }
  });

  /**
   * GET /api/ninety-day/records
   * Get user's 90-day training history
   * Query params: dayNumber (optional), limit (optional, default 50)
   * Returns training records sorted by completion date (newest first)
   */
  app.get("/api/ninety-day/records", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ records: [] });
      }

      const { dayNumber, limit } = req.query;

      // Build filter params
      const params: { dayNumber?: number; limit?: number } = {};
      if (dayNumber) {
        const day = parseInt(dayNumber as string);
        if (isNaN(day) || day < 1 || day > 90) {
          return res.status(400).json({ message: "Day number must be between 1 and 90" });
        }
        params.dayNumber = day;
      }
      if (limit) {
        const limitNum = parseInt(limit as string);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
          return res.status(400).json({ message: "Limit must be between 1 and 500" });
        }
        params.limit = limitNum;
      } else {
        params.limit = 50; // Default limit
      }

      const records = await storage.getNinetyDayTrainingRecords(userId, params);
      res.json({ records });
    } catch (error) {
      console.error("Error fetching 90-day training records:", error);
      res.status(500).json({ message: "Failed to fetch training records" });
    }
  });

  // ========================================================================
  // === Ten Core Skills System V3 API Routes (十大招系统) ===
  // ========================================================================

  /**
   * GET /api/skills-v3
   * Get all ten core skills (十大招列表)
   * Returns array of skills ordered by skillOrder
   */
  app.get("/api/skills-v3", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ skills: [] });
      }

      const skills = await storage.getSkillsV3();
      res.json({ skills });
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  /**
   * GET /api/skills-v3/:skillId
   * Get a specific skill by ID
   * Params: skillId (e.g., 'skill_1')
   * Returns skill details
   */
  app.get("/api/skills-v3/:skillId", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.status(404).json({ message: "Skill not found" });
      }

      const { skillId } = req.params;
      const skill = await storage.getSkillV3ById(skillId);

      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }

      res.json({ skill });
    } catch (error) {
      console.error("Error fetching skill:", error);
      res.status(500).json({ message: "Failed to fetch skill" });
    }
  });

  /**
   * GET /api/skills-v3/:skillId/sub-skills
   * Get all sub-skills for a specific skill
   * Params: skillId (e.g., 'skill_1')
   * Returns array of sub-skills ordered by subSkillOrder
   */
  app.get("/api/skills-v3/:skillId/sub-skills", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ subSkills: [] });
      }

      const { skillId } = req.params;
      const subSkills = await storage.getSubSkillsV3BySkillId(skillId);

      res.json({ subSkills });
    } catch (error) {
      console.error("Error fetching sub-skills:", error);
      res.status(500).json({ message: "Failed to fetch sub-skills" });
    }
  });

  /**
   * GET /api/sub-skills-v3/:subSkillId
   * Get a specific sub-skill by ID
   * Params: subSkillId (e.g., 'sub_skill_1_1')
   * Returns sub-skill details
   */
  app.get("/api/sub-skills-v3/:subSkillId", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.status(404).json({ message: "Sub-skill not found" });
      }

      const { subSkillId } = req.params;
      const subSkill = await storage.getSubSkillV3ById(subSkillId);

      if (!subSkill) {
        return res.status(404).json({ message: "Sub-skill not found" });
      }

      res.json({ subSkill });
    } catch (error) {
      console.error("Error fetching sub-skill:", error);
      res.status(500).json({ message: "Failed to fetch sub-skill" });
    }
  });

  /**
   * GET /api/sub-skills-v3/:subSkillId/units
   * Get all training units for a specific sub-skill
   * Params: subSkillId (e.g., 'sub_skill_1_1')
   * Returns array of training units ordered by unitOrder
   */
  app.get("/api/sub-skills-v3/:subSkillId/units", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ units: [] });
      }

      const { subSkillId } = req.params;
      const units = await storage.getTrainingUnitsV3BySubSkillId(subSkillId);

      res.json({ units });
    } catch (error) {
      console.error("Error fetching training units:", error);
      res.status(500).json({ message: "Failed to fetch training units" });
    }
  });

  /**
   * GET /api/training-units-v3/:unitId
   * Get a specific training unit by ID
   * Params: unitId (e.g., 'unit_1_1_1')
   * Returns training unit details including content (JSONB)
   */
  app.get("/api/training-units-v3/:unitId", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.status(404).json({ message: "Training unit not found" });
      }

      const { unitId } = req.params;
      const unit = await storage.getTrainingUnitV3ById(unitId);

      if (!unit) {
        return res.status(404).json({ message: "Training unit not found" });
      }

      res.json({ unit });
    } catch (error) {
      console.error("Error fetching training unit:", error);
      res.status(500).json({ message: "Failed to fetch training unit" });
    }
  });

  /**
   * GET /api/user/skills-v3/progress
   * Get user's progress across all skills
   * Query param: skillId (optional) - filter by specific skill
   * Returns array of skill progress records
   */
  app.get("/api/user/skills-v3/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ progress: [] });
      }

      const { skillId } = req.query;
      const progress = await storage.getUserSkillProgressV3(
        userId,
        skillId ? String(skillId) : undefined
      );

      res.json({ progress });
    } catch (error) {
      console.error("Error fetching skill progress:", error);
      res.status(500).json({ message: "Failed to fetch skill progress" });
    }
  });

  /**
   * GET /api/user/units-v3/completions
   * Get user's completed training units
   * Query param: unitId (optional) - filter by specific unit
   * Returns array of completion records sorted by completion date (newest first)
   */
  app.get("/api/user/units-v3/completions", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({ completions: [] });
      }

      const { unitId } = req.query;
      const completions = await storage.getUserUnitCompletions(
        userId,
        unitId ? String(unitId) : undefined
      );

      res.json({ completions });
    } catch (error) {
      console.error("Error fetching unit completions:", error);
      res.status(500).json({ message: "Failed to fetch unit completions" });
    }
  });

  /**
   * POST /api/training-units-v3/:unitId/complete
   * Mark a training unit as completed
   * Params: unitId (e.g., 'unit_1_1_1')
   * Body: { score?: number, notes?: string }
   * Returns completion record and updates skill progress
   */
  app.post("/api/training-units-v3/:unitId/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      const { unitId } = req.params;
      const { score, notes } = req.body;

      // Validate score if provided
      if (score !== undefined && score !== null) {
        const scoreNum = parseInt(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
          return res.status(400).json({ message: "Score must be between 0 and 100" });
        }
      }

      const completion = await storage.completeTrainingUnitV3(
        userId,
        unitId,
        score ? parseInt(score) : undefined,
        notes
      );

      res.json({
        message: "Training unit completed successfully",
        completion,
      });
    } catch (error) {
      console.error("Error completing training unit:", error);
      res.status(500).json({ message: "Failed to complete training unit" });
    }
  });

  /**
   * GET /api/curriculum/:dayNumber/units
   * Get training units linked to a specific day in 90-day curriculum
   * Params: dayNumber (1-90)
   * Returns array of curriculum-unit mappings
   */
  app.get("/api/curriculum/:dayNumber/units", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.json({ units: [] });
      }

      const { dayNumber } = req.params;
      const day = parseInt(dayNumber);

      if (isNaN(day) || day < 1 || day > 90) {
        return res.status(400).json({ message: "Day number must be between 1 and 90" });
      }

      const units = await storage.getCurriculumDayUnits(day);
      res.json({ units });
    } catch (error) {
      console.error("Error fetching curriculum units:", error);
      res.status(500).json({ message: "Failed to fetch curriculum units" });
    }
  });

  // ============================================================================
  // 90-Day Challenge & Ability Score API Endpoints
  // ============================================================================

  /**
   * Start 90-day challenge for the user
   * POST /api/ninety-day/start-challenge
   *
   * Initializes the challenge by setting start_date in user_ninety_day_progress table
   * Can only be called once per user (unless start_date is null)
   *
   * Flow:
   * 1. Check if progress record exists
   * 2. If exists and has startDate → return 400 (already started)
   * 3. If no progress record → create one (without startDate)
   * 4. Set startDate and estimatedCompletionDate
   * 5. Sync to users table for backward compatibility
   */
  app.post("/api/ninety-day/start-challenge", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.status(200).json({
          success: true,
          message: "Demo mode: Challenge started"
        });
      }

      // Check user_ninety_day_progress table (primary source of truth)
      let progress = await storage.getUserNinetyDayProgress(userId);

      // If progress exists and already has start date, return 400
      if (progress && progress.startDate) {
        return res.status(400).json({
          message: "Challenge already started",
          startDate: progress.startDate
        });
      }

      const now = new Date();
      const completionDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // If no progress record exists, create one (without startDate)
      if (!progress) {
        progress = await storage.initializeUserNinetyDayProgress(userId);
      }

      // Now set startDate and estimatedCompletionDate (whether newly created or existing)
      progress = await storage.updateUserNinetyDayProgress(userId, {
        startDate: now,
        estimatedCompletionDate: completionDate,
      });

      // Sync to users table for backward compatibility
      await db!.update(users)
        .set({
          challengeStartDate: progress.startDate,
          challengeCurrentDay: progress.currentDay,
          challengeCompletedDays: (progress.completedDays as number[]).length,
        })
        .where(eq(users.id, userId));

      console.log(`✅ Started 90-day challenge for user ${userId}`);

      res.json({
        success: true,
        message: "90天挑战已开始！",
        startDate: progress.startDate,
      });
    } catch (error) {
      console.error("Error starting 90-day challenge:", error);
      res.status(500).json({
        message: "Failed to start challenge"
      });
    }
  });

  /**
   * Submit a training record for the 90-day challenge
   * POST /api/ninety-day-training
   *
   * Body: {
   *   day_number: number,
   *   training_stats: {
   *     total_attempts?: number,
   *     successful_shots?: number,
   *     completed_count?: number,
   *     target_count?: number,
   *     duration_minutes?: number
   *   },
   *   duration_minutes: number,
   *   notes?: string
   * }
   */
  app.post("/api/ninety-day-training", isAuthenticated, async (req, res) => {
    try {
      const userId = requireSessionUserId(req);

      // Validate request body
      const submissionSchema = z.object({
        day_number: z.number().int().min(1).max(90),
        training_stats: z.object({
          total_attempts: z.number().int().optional(),
          successful_shots: z.number().int().optional(),
          completed_count: z.number().int().optional(),
          target_count: z.number().int().optional(),
          duration_minutes: z.number().optional(),
        }),
        duration_minutes: z.number().min(0.1), // Allow minimum 0.1 minutes (6 seconds)
        notes: z.string().optional(),
      });

      const validatedData = submissionSchema.parse(req.body);

      const submission: TrainingSubmission = {
        user_id: userId,
        ...validatedData,
      };

      // Process training and update ability scores
      const result = await processTrainingRecord(submission);

      res.json({
        success: true,
        message: "训练记录已提交，能力分已更新",
        score_changes: result.scoreChanges,
        new_scores: result.newScores,
      });
    } catch (error: any) {
      console.error("Error submitting training record:", error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      }

      res.status(500).json({
        message: error.message || "Failed to submit training record"
      });
    }
  });

  /**
   * @deprecated This endpoint is deprecated. Use GET /api/v1/dashboard/summary instead.
   *
   * Get user's current ability scores
   * GET /api/users/:userId/ability-scores
   *
   * DEPRECATED: Use /api/v1/dashboard/summary which returns unified data including ability scores.
   * This endpoint will be removed in a future version.
   * Migration: Use the abilityScores field from /api/v1/dashboard/summary response.
   */
  app.get("/api/users/:userId/ability-scores", isAuthenticated, async (req, res) => {
    console.warn('⚠️  DEPRECATED API called: GET /api/users/:userId/ability-scores - Use /api/v1/dashboard/summary instead');
    try {
      const requestingUserId = requireSessionUserId(req);
      const targetUserId = req.params.userId;

      // Users can only view their own scores (for now)
      if (requestingUserId !== targetUserId && requestingUserId !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const scores = await getUserAbilityScores(targetUserId);

      if (!scores) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ scores });
    } catch (error) {
      console.error("Error fetching ability scores:", error);
      res.status(500).json({ message: "Failed to fetch ability scores" });
    }
  });

  /**
   * Get user's training history for 90-day challenge
   * GET /api/ninety-day-training/:userId?limit=30
   */
  app.get("/api/ninety-day-training/:userId", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = requireSessionUserId(req);
      const targetUserId = req.params.userId;

      // Users can only view their own history (for now)
      if (requestingUserId !== targetUserId && requestingUserId !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const limit = parseInt(req.query.limit as string) || 30;
      const history = await getUserTrainingHistory(targetUserId, limit);

      res.json({ history });
    } catch (error) {
      console.error("Error fetching training history:", error);
      res.status(500).json({ message: "Failed to fetch training history" });
    }
  });

  /**
   * Get 90-day curriculum for a specific day
   * GET /api/ninety-day-curriculum/:dayNumber
   */
  app.get("/api/ninety-day-curriculum/:dayNumber", isAuthenticated, async (req, res) => {
    try {
      const dayNumber = parseInt(req.params.dayNumber);

      if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 90) {
        return res.status(400).json({ message: "Day number must be between 1 and 90" });
      }

      const curriculum = await storage.getNinetyDayCurriculumByDay(dayNumber);

      if (!curriculum) {
        return res.status(404).json({ message: "Curriculum not found for this day" });
      }

      res.json({ curriculum });
    } catch (error) {
      console.error("Error fetching curriculum:", error);
      res.status(500).json({ message: "Failed to fetch curriculum" });
    }
  });

  /**
   * Get user's 90-day challenge progress
   * GET /api/users/:userId/ninety-day-progress
   *
   * Returns comprehensive challenge data including:
   * - Challenge progress (startDate, currentDay, completedDays)
   * - Ability scores (5 dimensions + clearance)
   * - Training statistics (total days, successful days, days since start)
   */
  app.get("/api/users/:userId/ninety-day-progress", isAuthenticated, async (req, res) => {
    try {
      const requestingUserId = requireSessionUserId(req);
      const targetUserId = req.params.userId;

      // Users can only view their own progress (for now)
      if (requestingUserId !== targetUserId && requestingUserId !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!hasDatabase) {
        return res.json({
          challenge_start_date: null,
          challenge_current_day: 1,
          challenge_completed_days: 0,
          accuracy_score: 0,
          spin_score: 0,
          positioning_score: 0,
          power_score: 0,
          strategy_score: 0,
          clearance_score: 0,
          total_trained_days: 0,
          successful_days: 0,
          days_since_start: null,
        });
      }

      // Get progress data
      const progress = await storage.getUserNinetyDayProgress(targetUserId);

      // Get user's ability scores
      const [user] = await db!.select().from(users).where(eq(users.id, targetUserId)).limit(1);

      // Calculate days since start
      let daysSinceStart: number | null = null;
      if (progress?.startDate) {
        const start = new Date(progress.startDate);
        const now = new Date();
        daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Count completed days
      const completedDaysCount = Array.isArray(progress?.completedDays)
        ? progress.completedDays.length
        : 0;

      // Return data in format expected by frontend
      res.json({
        challenge_start_date: progress?.startDate || null,
        challenge_current_day: progress?.currentDay || 1,
        challenge_completed_days: completedDaysCount,
        accuracy_score: user?.accuracyScore || 0,
        spin_score: user?.spinScore || 0,
        positioning_score: user?.positioningScore || 0,
        power_score: user?.powerScore || 0,
        strategy_score: user?.strategyScore || 0,
        clearance_score: user?.clearanceScore || 0,
        total_trained_days: completedDaysCount,
        successful_days: 0, // TODO: Calculate from training records
        days_since_start: daysSinceStart,
      });
    } catch (error) {
      console.error("Error fetching 90-day progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  /**
   * Unified Dashboard Summary API
   * Returns aggregated data from all training modules for the profile dashboard
   * GET /api/v1/dashboard/summary
   */
  app.get("/api/v1/dashboard/summary", isAuthenticated, async (req, res) => {
    try {
      const targetUserId = requireSessionUserId(req);

      if (!hasDatabase) {
        return res.json({
          ninetyDayChallenge: {
            currentDay: 1,
            totalDays: 90,
            completedDays: 0,
            startDate: null,
            daysSinceStart: null
          },
          skillsLibrary: {
            totalSkills: 10,
            masteredSkills: 0,
            inProgressSkills: 0,
            overallProgress: 0
          },
          practiceField: {
            currentLevel: 1,
            currentXP: 0,
            nextLevelXP: 1000
          },
          abilityScores: {
            accuracy: 0,
            spin: 0,
            positioning: 0,
            power: 0,
            strategy: 0,
            clearance: 0
          }
        });
      }

      // Fetch user data for practice field and ability scores
      const [user] = await db!.select().from(users).where(eq(users.id, targetUserId)).limit(1);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // === 1. 90-Day Challenge Data ===
      const ninetyDayProgress = await storage.getUserNinetyDayProgress(targetUserId);

      let daysSinceStart: number | null = null;
      if (ninetyDayProgress?.startDate) {
        const start = new Date(ninetyDayProgress.startDate);
        const now = new Date();
        daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      const completedDaysCount = Array.isArray(ninetyDayProgress?.completedDays)
        ? ninetyDayProgress.completedDays.length
        : 0;

      // === 2. Skills Library Data (Ten Core Skills V3) ===
      const skillsProgress = await db!
        .select()
        .from(userSkillProgressV3)
        .where(eq(userSkillProgressV3.userId, targetUserId));

      const totalSkills = 10; // Ten Core Skills system
      const masteredSkills = skillsProgress.filter(sp => (sp.progressPercentage ?? 0) === 100).length;
      const inProgressSkills = skillsProgress.filter(sp => {
        const progress = sp.progressPercentage ?? 0;
        return progress > 0 && progress < 100;
      }).length;
      const overallProgress = skillsProgress.length > 0
        ? Math.round(skillsProgress.reduce((sum, sp) => sum + (sp.progressPercentage ?? 0), 0) / totalSkills)
        : 0;

      // === 3. Practice Field Data (Level System) ===
      const currentLevel = user.level || 1;
      const currentXP = user.exp || 0;

      // Calculate next level XP requirement (same logic as experienceSystem.ts)
      const baseExp = 1000;
      const expMultiplier = 1.5;
      const nextLevelXP = Math.floor(baseExp * Math.pow(expMultiplier, currentLevel));

      // === 4. Ability Scores ===
      const abilityScores = {
        accuracy: user.accuracyScore || 0,
        spin: user.spinScore || 0,
        positioning: user.positioningScore || 0,
        power: user.powerScore || 0,
        strategy: user.strategyScore || 0,
        clearance: user.clearanceScore || 0
      };

      // Return unified dashboard data
      res.json({
        ninetyDayChallenge: {
          currentDay: ninetyDayProgress?.currentDay || 1,
          totalDays: 90,
          completedDays: completedDaysCount,
          startDate: ninetyDayProgress?.startDate || null,
          daysSinceStart
        },
        skillsLibrary: {
          totalSkills,
          masteredSkills,
          inProgressSkills,
          overallProgress
        },
        practiceField: {
          currentLevel,
          currentXP,
          nextLevelXP
        },
        abilityScores
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  /**
   * Admin Endpoint: Seed Specialized Training Plans
   * POST /api/admin/seed-training-plans
   *
   * Seeds 24 training plans (3 per dojo × 8 dojos) into the database
   * This should be called once to populate the specialized training plans
   */
  app.post("/api/admin/seed-training-plans", async (req, res) => {
    try {
      if (!hasDatabase) {
        return res.status(503).json({ message: "Database not available" });
      }

      console.log('🌱 Starting to seed specialized training plans...');

      // First, ensure the metadata column exists
      console.log('Checking if metadata column exists...');
      try {
        await db!.execute(sql`
          ALTER TABLE specialized_training_plans
          ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb
        `);
        console.log('✅ Metadata column ensured');
      } catch (metadataError) {
        console.log('⚠️  Metadata column might already exist:', metadataError);
      }

      // Import the specialized training plans schema
      const { specializedTrainingPlansV3 } = await import("../shared/schema.js");

      // Define all 24 training plans
      const allTrainingPlans = [
        // 1. 基本功训练道场 (st_basic)
        {
          id: 'plan_basic_beginner',
          trainingId: 'st_basic',
          title: '站位与姿势练习',
          description: '入门级基本功训练：反复练习标准的站位和姿势，做到稳定、舒适。形成标准的击球姿势。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'fundamentals',
            primarySkill: '基本功',
            level: '入门',
            recordConfig: {
              metrics: ['stability', 'consistency'],
              scoringMethod: 'performance',
              targetSuccessRate: 85
            }
          },
          content: {
            duration: 30,
            goal: '形成标准的击球姿势',
            evaluation: '每次击球都能保持稳定的姿势',
            keyPoints: ['站位稳定', '重心平衡', '姿势舒适', '视线正确'],
            practice: ['镜前练习站位', '空杆练习', '观察专业选手姿势']
          }
        },
        {
          id: 'plan_basic_intermediate',
          trainingId: 'st_basic',
          title: '握杆与手架练习',
          description: '进阶级基本功训练：练习正确的握杆方法和稳固的手架，能够根据不同球形变换手架。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 30,
          metadata: {
            trainingType: 'fundamentals',
            primarySkill: '基本功',
            level: '进阶',
            recordConfig: {
              metrics: ['gripControl', 'bridgeStability'],
              scoringMethod: 'performance',
              targetSuccessRate: 80
            }
          },
          content: {
            duration: 45,
            goal: '掌握稳固的握杆和手架',
            evaluation: '能够根据不同球形变换手架',
            keyPoints: ['握杆松紧适度', '手架稳固', '能变换不同手架', '远台手架'],
            practice: ['标准握杆练习', '凤眼手架', 'V形手架', '远台手架']
          }
        },
        {
          id: 'plan_basic_master',
          trainingId: 'st_basic',
          title: '出杆精准度练习',
          description: '大师级基本功训练：做到出杆笔直、平顺，能够长时间保持出杆的稳定性。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 40,
          metadata: {
            trainingType: 'fundamentals',
            primarySkill: '基本功',
            level: '大师',
            recordConfig: {
              metrics: ['strokeAccuracy', 'consistency'],
              scoringMethod: 'performance',
              targetSuccessRate: 90
            }
          },
          content: {
            duration: 60,
            goal: '做到出杆笔直、平顺',
            evaluation: '能够长时间保持出杆的稳定性',
            keyPoints: ['出杆笔直', '运杆平顺', '延伸完整', '回杆稳定'],
            practice: ['空杆练习200次', '瓶颈练习', '摆球练习', '长时间练习']
          }
        },
        // 2. 准度训练道场 (st_accuracy)
        {
          id: 'plan_accuracy_beginner',
          trainingId: 'st_accuracy',
          title: '直线球练习（短、中距离）',
          description: '入门级准度训练：练习不同距离下的直线球击打，掌握直线球的稳定击打。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'accuracy',
            primarySkill: '准度',
            level: '入门',
            recordConfig: {
              metrics: ['successRate'],
              scoringMethod: 'percentage',
              targetSuccessRate: 80
            }
          },
          content: {
            duration: 30,
            goal: '掌握直线球的稳定击打',
            evaluation: '10颗球进8颗为合格',
            sets: 5,
            repsPerSet: 10,
            keyPoints: ['瞄准球心', '出杆稳定', '力度均匀', '延伸完整'],
            distances: ['近台(1球台)', '中台(2球台)', '远台(3球台)']
          }
        },
        {
          id: 'plan_accuracy_intermediate',
          trainingId: 'st_accuracy',
          title: '角度球练习（15、30度）',
          description: '进阶级准度训练：练习15、30度等常见角度的击打，建立角度球的初步感觉。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 30,
          metadata: {
            trainingType: 'accuracy',
            primarySkill: '准度',
            level: '进阶',
            recordConfig: {
              metrics: ['angleAccuracy'],
              scoringMethod: 'percentage',
              targetSuccessRate: 60
            }
          },
          content: {
            duration: 45,
            goal: '建立角度球的初步感觉',
            evaluation: '10颗球进6颗为合格',
            sets: 5,
            repsPerSet: 10,
            angles: ['15度', '30度', '45度'],
            keyPoints: ['找准切点', '瞄准修正', '力度控制', '杆法配合']
          }
        },
        {
          id: 'plan_accuracy_master',
          trainingId: 'st_accuracy',
          title: '贴库球与翻袋练习',
          description: '大师级准度训练：克服特殊球形的心理障碍，掌握贴库球和翻袋技巧。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'accuracy',
            primarySkill: '准度',
            level: '大师',
            recordConfig: {
              metrics: ['specialShotAccuracy'],
              scoringMethod: 'percentage',
              targetSuccessRate: 50
            }
          },
          content: {
            duration: 60,
            goal: '克服特殊球形的心理障碍',
            evaluation: '10颗球进5颗为合格',
            sets: 5,
            repsPerSet: 10,
            shotTypes: ['贴库球', '中袋翻袋', '底袋翻袋'],
            keyPoints: ['克服心理压力', '精确瞄准', '力度把控', '杆法运用']
          }
        },
        // 3. 杆法训练道场 (st_spin)
        {
          id: 'plan_spin_beginner',
          trainingId: 'st_spin',
          title: '基础杆法练习（高、中、低）',
          description: '入门级杆法训练：掌握不同杆法的击球点和效果，能够稳定打出三种基础杆法。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'technique',
            primarySkill: '杆法',
            level: '入门',
            recordConfig: {
              metrics: ['techniqueControl'],
              scoringMethod: 'performance',
              targetSuccessRate: 85
            }
          },
          content: {
            duration: 30,
            goal: '掌握不同杆法的击球点和效果',
            evaluation: '能够稳定打出三种杆法',
            sets: 4,
            repsPerSet: 10,
            techniques: ['高杆(推杆)', '中杆(定杆)', '低杆(拉杆)'],
            keyPoints: ['击球点准确', '力度适当', '观察效果', '分离角理解']
          }
        },
        {
          id: 'plan_spin_intermediate',
          trainingId: 'st_spin',
          title: '加塞练习（左、右塞）',
          description: '进阶级杆法训练：掌握加塞的瞄准修正和走位控制，能够控制母球的横向走位。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 35,
          metadata: {
            trainingType: 'technique',
            primarySkill: '杆法',
            level: '进阶',
            recordConfig: {
              metrics: ['sideSpinControl'],
              scoringMethod: 'performance',
              targetSuccessRate: 75
            }
          },
          content: {
            duration: 45,
            goal: '掌握加塞的瞄准修正',
            evaluation: '能够控制母球的横向走位',
            sets: 4,
            repsPerSet: 10,
            techniques: ['左塞', '右塞', '不同力度的塞'],
            keyPoints: ['瞄准修正', '塞量控制', '反弹线路', '实战应用']
          }
        },
        {
          id: 'plan_spin_master',
          trainingId: 'st_spin',
          title: '高级杆法练习（推、拉、顿）',
          description: '大师级杆法训练：应对复杂球形，能够根据需要使用高级杆法。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'technique',
            primarySkill: '杆法',
            level: '大师',
            recordConfig: {
              metrics: ['advancedTechnique'],
              scoringMethod: 'performance',
              targetSuccessRate: 70
            }
          },
          content: {
            duration: 60,
            goal: '应对复杂球形',
            evaluation: '能够根据需要使用高级杆法',
            sets: 3,
            repsPerSet: 10,
            techniques: ['推杆', '拉杆', '顿杆', '混合杆法'],
            keyPoints: ['杆法组合', '精确控制', '效果预判', '实战运用']
          }
        },
        // 4. 走位训练道场 (st_positioning)
        {
          id: 'plan_positioning_beginner',
          trainingId: 'st_positioning',
          title: '分离角练习',
          description: '入门级走位训练：理解母球与目标球的分离规律，能够预测母球的大致走向。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '走位',
            level: '入门',
            recordConfig: {
              metrics: ['angleUnderstanding'],
              scoringMethod: 'performance',
              targetSuccessRate: 80
            }
          },
          content: {
            duration: 30,
            goal: '理解母球与目标球的分离规律',
            evaluation: '能够预测母球的大致走向',
            sets: 5,
            repsPerSet: 10,
            angles: ['90度分离(定杆)', '<90度分离(推杆)', '>90度分离(拉杆)'],
            keyPoints: ['观察分离角', '理解分离规律', '杆法影响', '力度影响']
          }
        },
        {
          id: 'plan_positioning_intermediate',
          trainingId: 'st_positioning',
          title: '叫位练习',
          description: '进阶级走位训练：练习将母球走到指定区域，能够将母球控制在目标区域内。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 35,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '走位',
            level: '进阶',
            recordConfig: {
              metrics: ['positioningAccuracy'],
              scoringMethod: 'performance',
              targetSuccessRate: 70
            }
          },
          content: {
            duration: 45,
            goal: '练习将母球走到指定区域',
            evaluation: '能够将母球控制在目标区域内',
            sets: 4,
            repsPerSet: 10,
            targets: ['近台区域', '中台区域', '远台区域'],
            keyPoints: ['规划走位路线', '力度控制', '杆法选择', '分离角运用']
          }
        },
        {
          id: 'plan_positioning_master',
          trainingId: 'st_positioning',
          title: 'K球与蛇彩练习',
          description: '大师级走位训练：综合运用走位技巧，能够完成一次完整的蛇彩练习。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '走位',
            level: '大师',
            recordConfig: {
              metrics: ['advancedPositioning'],
              scoringMethod: 'success',
              targetSuccessRate: 60
            }
          },
          content: {
            duration: 60,
            goal: '综合运用走位技巧',
            evaluation: '能够完成一次完整的蛇彩练习',
            sets: 3,
            repsPerSet: 5,
            scenarios: ['K球练习', '蛇彩练习', '组合球练习'],
            keyPoints: ['K球时机', 'K球力度', '连续走位', '整体规划']
          }
        },
        // 5. 发力训练道场 (st_power)
        {
          id: 'plan_power_beginner',
          trainingId: 'st_power',
          title: '空杆与力量控制练习',
          description: '入门级发力训练：掌握正确的发力动作，出杆平顺、稳定。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'power',
            primarySkill: '发力',
            level: '入门',
            recordConfig: {
              metrics: ['strokeSmooth'],
              scoringMethod: 'performance',
              targetSuccessRate: 85
            }
          },
          content: {
            duration: 30,
            goal: '掌握正确的发力动作',
            evaluation: '出杆平顺、稳定',
            sets: 5,
            repsPerSet: 20,
            powerLevels: ['小力', '中力', '大力'],
            keyPoints: ['发力通透', '出杆稳定', '力量传导', '身体协调']
          }
        },
        {
          id: 'plan_power_intermediate',
          trainingId: 'st_power',
          title: '发力节奏练习',
          description: '进阶级发力训练：培养稳定的发力节奏，能够在大力和小力之间自如切换。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 35,
          metadata: {
            trainingType: 'power',
            primarySkill: '发力',
            level: '进阶',
            recordConfig: {
              metrics: ['powerControl'],
              scoringMethod: 'performance',
              targetSuccessRate: 80
            }
          },
          content: {
            duration: 45,
            goal: '培养稳定的发力节奏',
            evaluation: '能够在大力和小力之间自如切换',
            sets: 4,
            repsPerSet: 15,
            rhythms: ['慢节奏', '快节奏', '节奏变换'],
            keyPoints: ['稳定节奏', '力度控制', '心态平稳', '避免变形']
          }
        },
        {
          id: 'plan_power_master',
          trainingId: 'st_power',
          title: '实战发力应用',
          description: '大师级发力训练：在实战中运用不同的发力技巧，能够根据球形需要选择合适的发力。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'power',
            primarySkill: '发力',
            level: '大师',
            recordConfig: {
              metrics: ['practicalApplication'],
              scoringMethod: 'performance',
              targetSuccessRate: 75
            }
          },
          content: {
            duration: 60,
            goal: '在实战中运用不同的发力技巧',
            evaluation: '能够根据球形需要选择合适的发力',
            sets: 3,
            repsPerSet: 10,
            scenarios: ['轻柔球', '中力球', '爆发球', '连续变化'],
            keyPoints: ['因球制宜', '发力精确', '效果预判', '实战应用']
          }
        },
        // 6. 策略训练道场 (st_angle)
        {
          id: 'plan_angle_beginner',
          trainingId: 'st_angle',
          title: '清台思路练习',
          description: '入门级策略训练：培养基本的清台规划能力，能够规划出2-3颗球的清台路线。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 25,
          metadata: {
            trainingType: 'strategy',
            primarySkill: '策略',
            level: '入门',
            recordConfig: {
              metrics: ['planningAbility'],
              scoringMethod: 'performance',
              targetSuccessRate: 75
            }
          },
          content: {
            duration: 30,
            goal: '培养基本的清台规划能力',
            evaluation: '能够规划出2-3颗球的清台路线',
            sets: 5,
            repsPerSet: 5,
            ballCounts: [2, 3],
            keyPoints: ['观察球形', '规划路线', '先难后易', '确保成功']
          }
        },
        {
          id: 'plan_angle_intermediate',
          trainingId: 'st_angle',
          title: '防守练习',
          description: '进阶级策略训练：学习制作斯诺克和安全球，能够做出有效的防守。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 35,
          metadata: {
            trainingType: 'strategy',
            primarySkill: '策略',
            level: '进阶',
            recordConfig: {
              metrics: ['defensiveSkill'],
              scoringMethod: 'performance',
              targetSuccessRate: 70
            }
          },
          content: {
            duration: 45,
            goal: '学习制作斯诺克和安全球',
            evaluation: '能够做出有效的防守',
            sets: 4,
            repsPerSet: 10,
            techniques: ['制造斯诺克', '做安全球', '交换球权'],
            keyPoints: ['防守意识', '障碍制造', '降低对手机会', '战术运用']
          }
        },
        {
          id: 'plan_angle_master',
          trainingId: 'st_angle',
          title: '特殊球形处理',
          description: '大师级策略训练：练习处理贴库球、组合球等复杂球形，能够应对各种复杂球形。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'strategy',
            primarySkill: '策略',
            level: '大师',
            recordConfig: {
              metrics: ['complexHandling'],
              scoringMethod: 'performance',
              targetSuccessRate: 65
            }
          },
          content: {
            duration: 60,
            goal: '练习处理贴库球、组合球等',
            evaluation: '能够应对各种复杂球形',
            sets: 3,
            repsPerSet: 10,
            scenarios: ['贴库球', '组合球', '借球', '连击球'],
            keyPoints: ['球形分析', '解决方案', '技术运用', '随机应变']
          }
        },
        // 7. 清台挑战道场 (st_clearance)
        {
          id: 'plan_clearance_beginner',
          trainingId: 'st_clearance',
          title: '顺序清彩',
          description: '入门级清台训练：掌握基本的清彩流程，能够完成一次完整的顺序清彩。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 25,
          metadata: {
            trainingType: 'comprehensive',
            primarySkill: '清台',
            level: '入门',
            recordConfig: {
              metrics: ['clearanceSuccess'],
              scoringMethod: 'success',
              targetSuccessRate: 70
            }
          },
          content: {
            duration: 30,
            goal: '掌握基本的清彩流程',
            evaluation: '能够完成一次完整的顺序清彩',
            sets: 5,
            repsPerSet: 1,
            ballCounts: [3, 4, 5],
            keyPoints: ['按序清彩', '走位规划', '稳定心态', '完成清台']
          }
        },
        {
          id: 'plan_clearance_intermediate',
          trainingId: 'st_clearance',
          title: '乱序清彩',
          description: '进阶级清台训练：培养根据球形规划路线的能力，能够根据球形选择最优清彩路线。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 40,
          metadata: {
            trainingType: 'comprehensive',
            primarySkill: '清台',
            level: '进阶',
            recordConfig: {
              metrics: ['routeOptimization'],
              scoringMethod: 'success',
              targetSuccessRate: 60
            }
          },
          content: {
            duration: 45,
            goal: '培养根据球形规划路线的能力',
            evaluation: '能够根据球形选择最优清彩路线',
            sets: 4,
            repsPerSet: 1,
            ballCounts: [5, 6],
            keyPoints: ['整体规划', '灵活调整', '优化路线', '完成清台']
          }
        },
        {
          id: 'plan_clearance_master',
          trainingId: 'st_clearance',
          title: '计时清彩',
          description: '大师级清台训练：提升压力下的清台能力，在规定时间内完成清彩。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 60,
          metadata: {
            trainingType: 'comprehensive',
            primarySkill: '清台',
            level: '大师',
            recordConfig: {
              metrics: ['speedClearance'],
              scoringMethod: 'time',
              targetSuccessRate: 50
            }
          },
          content: {
            duration: 60,
            goal: '提升压力下的清台能力',
            evaluation: '在规定时间内完成清彩',
            sets: 3,
            repsPerSet: 1,
            ballCounts: [6, 7, 8],
            timeLimits: [180, 240, 300],
            keyPoints: ['速度与准度', '时间管理', '抗压能力', '稳定发挥']
          }
        },
        // 8. 五分点速成道场 (st_five_points)
        {
          id: 'plan_five_points_beginner',
          trainingId: 'st_five_points',
          title: '五分点叫位',
          description: '入门级五分点训练：熟悉五分点区域，能够将母球走到五分点附近。',
          difficulty: 'easy',
          estimatedTimeMinutes: 30,
          xpReward: 20,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '五分点',
            level: '入门',
            recordConfig: {
              metrics: ['fivePointAccuracy'],
              scoringMethod: 'performance',
              targetSuccessRate: 75
            }
          },
          content: {
            duration: 30,
            goal: '熟悉五分点区域',
            evaluation: '能够将母球走到五分点附近',
            sets: 5,
            repsPerSet: 10,
            positions: ['不同起点到五分点'],
            keyPoints: ['五分点位置', '走位路线', '力度控制', '杆法运用']
          }
        },
        {
          id: 'plan_five_points_intermediate',
          trainingId: 'st_five_points',
          title: '五分点发散',
          description: '进阶级五分点训练：掌握从五分点到全台的走位，能够从五分点精确叫位到目标球。',
          difficulty: 'medium',
          estimatedTimeMinutes: 45,
          xpReward: 35,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '五分点',
            level: '进阶',
            recordConfig: {
              metrics: ['positioningPrecision'],
              scoringMethod: 'performance',
              targetSuccessRate: 70
            }
          },
          content: {
            duration: 45,
            goal: '掌握从五分点到全台的走位',
            evaluation: '能够从五分点精确叫位到目标球',
            sets: 4,
            repsPerSet: 10,
            targets: ['全台各位置'],
            keyPoints: ['精确控制', '分离角运用', '力度把握', '实战应用']
          }
        },
        {
          id: 'plan_five_points_master',
          trainingId: 'st_five_points',
          title: '五分点实战应用',
          description: '大师级五分点训练：在实战中灵活运用五分点，能够利用五分点完成连续进攻。',
          difficulty: 'hard',
          estimatedTimeMinutes: 60,
          xpReward: 50,
          metadata: {
            trainingType: 'positioning',
            primarySkill: '五分点',
            level: '大师',
            recordConfig: {
              metrics: ['practicalMastery'],
              scoringMethod: 'success',
              targetSuccessRate: 65
            }
          },
          content: {
            duration: 60,
            goal: '在实战中灵活运用五分点',
            evaluation: '能够利用五分点完成连续进攻',
            sets: 3,
            repsPerSet: 5,
            scenarios: ['连续进攻', '复杂球形', '清台实战'],
            keyPoints: ['灵活运用', '整体规划', '连续走位', '清台完成']
          }
        }
      ];

      console.log(`📊 Total: ${allTrainingPlans.length} training plans to seed`);

      // Insert all plans using onConflictDoNothing() to avoid duplicates
      await db!.insert(specializedTrainingPlansV3).values(allTrainingPlans).onConflictDoNothing();

      console.log('✅ Successfully seeded all training plans!');

      // Group by dojo for response
      const dojoGroups: Record<string, string[]> = {};
      allTrainingPlans.forEach(plan => {
        if (!dojoGroups[plan.trainingId]) {
          dojoGroups[plan.trainingId] = [];
        }
        dojoGroups[plan.trainingId].push(plan.title);
      });

      res.json({
        message: "Successfully seeded specialized training plans",
        count: allTrainingPlans.length,
        dojos: dojoGroups
      });

    } catch (error) {
      console.error('❌ Error seeding training plans:', error);
      res.status(500).json({ message: "Failed to seed training plans", error: String(error) });
    }
  });

  return;
}
