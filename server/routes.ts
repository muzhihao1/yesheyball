import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTrainingFeedback, generateDiaryInsights } from "./openai";
import { upload } from "./upload";
import { insertDiaryEntrySchema, insertUserTaskSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current user (defaulting to user ID 1 for demo)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
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
      const aiFeedback = await generateTrainingFeedback(
        taskData.task.title,
        taskData.task.description,
        rating,
        user.level,
        user.completedTasks
      );

      // Save feedback to storage
      await storage.createFeedback({
        userId: 1,
        taskId: taskData.taskId,
        content: aiFeedback.feedback,
        rating: aiFeedback.rating,
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

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: "File not found" });
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
