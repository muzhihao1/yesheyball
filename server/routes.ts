import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCoachingFeedback, generateDiaryInsights } from "./openai";
import { upload } from "./upload";
import { insertDiaryEntrySchema, insertUserTaskSchema, insertTrainingSessionSchema, insertTrainingNoteSchema } from "@shared/schema";
import { getTodaysCourse, getCourseByDay, DAILY_COURSES } from "./dailyCourses";
import { analyzeExerciseImage, batchAnalyzeExercises } from "./imageAnalyzer";
import { adaptiveLearning } from "./adaptiveLearning";
import { requirementCorrector } from "./manualCorrection";
import { analyzeTableBounds } from "./imageAnalysis";
import { 
  calculateTrainingExperience, 
  calculateLevelExperience, 
  calculateUserLevel,
  getExperienceBreakdown 
} from "./experienceSystem";
import { z } from "zod";
import OpenAI from "openai";
import path from "path";
import fs from "fs";

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
    if (prevDate && (date.getTime() - prevDate.getTime()) <= 24 * 60 * 60 * 1000 + 1000) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve assessment images as static files
  const assessmentsPath = path.join(process.cwd(), 'assessments');
  app.use('/assessments', express.static(assessmentsPath));
  
  // Get current user (defaulting to user ID 1 for demo)
  app.get("/api/user", async (req, res) => {
    try {
      // Prevent caching to ensure fresh data after training completions
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user training streak data
  app.get("/api/user/streak", async (req, res) => {
    try {
      const userId = 1;
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
  app.post("/api/user/streak", async (req, res) => {
    try {
      const user = await storage.updateUserStreak(1);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update streak" });
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
  app.get("/api/user/tasks/today", async (req, res) => {
    try {
      const userTasks = await storage.getTodayUserTasks(1);
      res.json(userTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's tasks" });
    }
  });

  // Complete a task
  app.post("/api/user/tasks/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const userTask = await storage.completeUserTask(parseInt(id), rating);
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get task details for AI feedback
      const allUserTasks = await storage.getUserTasks(1);
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
        userId: 1,
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
  app.get("/api/diary", async (req, res) => {
    try {
      const entries = await storage.getDiaryEntries(1);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get diary entries" });
    }
  });

  // Create diary entry
  app.post("/api/diary", upload.single('image'), async (req, res) => {
    try {
      const { content, duration, rating } = req.body;
      
      const entryData = {
        userId: 1,
        content,
        duration: duration ? parseInt(duration) : null,
        rating: rating ? parseInt(rating) : null,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        date: new Date(),
      };

      const validatedData = insertDiaryEntrySchema.parse(entryData);
      const entry = await storage.createDiaryEntry(validatedData);
      
      // Generate AI insights for the diary content
      if (content && content.length > 10) {
        const user = await storage.getUser(1);
        if (user) {
          const insights = await generateDiaryInsights(content, user.level, user.completedTasks);
          // You could save insights as feedback or return them directly
        }
      }

      res.json(entry);
    } catch (error) {
      console.error("Diary creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid diary data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create diary entry" });
    }
  });

  // Get user feedbacks
  app.get("/api/feedbacks", async (req, res) => {
    try {
      const feedbacks = await storage.getUserFeedbacks(1);
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feedbacks" });
    }
  });

  // Generate coaching feedback for training session
  app.post("/api/coaching-feedback", async (req, res) => {
    try {
      const { duration, summary, rating, exerciseType, level } = req.body;
      
      if (!duration || !summary) {
        return res.status(400).json({ message: "Duration and summary are required" });
      }

      const feedback = await generateCoachingFeedback({
        duration: parseInt(duration),
        summary: summary.trim(),
        rating: rating ? parseInt(rating) : null,
        exerciseType,
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

  app.get("/api/user-achievements", async (req, res) => {
    try {
      // Prevent caching to ensure fresh achievement data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const userAchievements = await storage.getUserAchievements(1);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user achievements" });
    }
  });

  app.post("/api/check-achievements", async (req, res) => {
    try {
      const newAchievements = await storage.checkAndUnlockAchievements(1);
      res.json(newAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Training program routes
  app.get("/api/training-programs", async (req, res) => {
    try {
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
  app.get("/api/training-sessions", async (req, res) => {
    try {
      const sessions = await storage.getUserTrainingSessions(1);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training sessions" });
    }
  });

  app.get("/api/training-sessions/current", async (req, res) => {
    try {
      const session = await storage.getCurrentTrainingSession(1);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current training session" });
    }
  });

  app.post("/api/training-sessions", async (req, res) => {
    try {
      console.log('Training session request body:', JSON.stringify(req.body, null, 2));
      const validatedData = insertTrainingSessionSchema.parse(req.body);
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
      
      const sessionWithAI = { ...validatedData, aiFeedback };
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
        const expGained = calculateTrainingExperience({
          sessionType: validatedData.sessionType || "custom",
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
          
          const updateData = {
            exp: newTotalExp,
            level: levelInfo.level,
            completedTasks: currentUser.completedTasks + 1,
            totalTime: currentUser.totalTime + Math.floor((validatedData.duration || 0) / 60)
          };
          
          console.log('Updating user with data:', updateData);
          
          const updatedUser = await storage.updateUser(validatedData.userId, updateData);
          
          console.log('After update - User stats:', {
            exp: updatedUser.exp,
            completedTasks: updatedUser.completedTasks,
            totalTime: updatedUser.totalTime
          });
          
          // Check and unlock achievements after updating user stats
          await storage.checkAndUnlockAchievements(validatedData.userId);
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

  app.post("/api/training-sessions/:id/complete", async (req, res) => {
    try {
      const { duration, rating, notes } = req.body;
      const sessionId = parseInt(req.params.id);
      
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
          completedTasks: currentUser.completedTasks + 1,
          totalTime: currentUser.totalTime + Math.floor((duration || 0) / 60)
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
  app.get("/api/training-logs", async (req, res) => {
    try {
      const logs = await storage.getAllTrainingNotes(1);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get training logs" });
    }
  });

  // Get training records (completed sessions) for a user
  app.get("/api/training-records", async (req, res) => {
    try {
      // Prevent caching to ensure fresh data after deletions
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const sessions = await storage.getUserTrainingSessions(1);
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
  app.patch("/api/training-records/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (!notes && notes !== "") {
        return res.status(400).json({ message: "Notes field is required" });
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
  app.delete("/api/training-records/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      await storage.deleteTrainingSession(sessionId);
      res.json({ message: "Training record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete training record" });
    }
  });

  // Progress to next episode
  app.post("/api/training-programs/next-episode", async (req, res) => {
    try {
      const programs = await storage.getAllTrainingPrograms();
      const beginnerProgram = programs.find(p => p.name === "耶氏台球学院系统教学");
      
      if (beginnerProgram) {
        const currentDay = beginnerProgram.currentDay || 1;
        const nextDay = Math.min(currentDay + 1, 30); // Limit to 30 episodes
        await storage.updateTrainingProgram(beginnerProgram.id, { currentDay: nextDay });
        
        // Create new session for next episode
        const newSession = await storage.createTrainingSession({
          userId: 1,
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

  app.post("/api/training-sessions/:sessionId/notes", async (req, res) => {
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

  // Get user statistics
  app.get("/api/user/stats", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const diaryEntries = await storage.getDiaryEntries(1);
      const userTasks = await storage.getUserTasks(1);
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
      const userId = parseInt(req.params.userId);
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
        userId,
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

  const httpServer = createServer(app);
  return httpServer;
}
