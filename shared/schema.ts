import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table with email/password authentication and Supabase Auth migration support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed to varchar for Replit user IDs
  email: varchar("email").unique(),
  passwordHash: text("password_hash"), // Bcrypt hashed password for email authentication (cleared after migration)

  // Supabase Auth migration fields
  supabaseUserId: uuid("supabase_user_id"), // UUID linking to auth.users.id
  migratedToSupabase: boolean("migrated_to_supabase").notNull().default(false), // Migration tracking flag

  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: text("username").unique(), // Keep for backwards compatibility
  level: integer("level").notNull().default(1),
  exp: integer("exp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  totalDays: integer("total_days").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
  totalTime: integer("total_time").notNull().default(0), // in minutes
  achievements: jsonb("achievements").default([]),
  // Sequential exercise progression tracking
  currentLevel: integer("current_level").notNull().default(1), // Current exercise level
  currentExercise: integer("current_exercise").notNull().default(1), // Next exercise to complete
  completedExercises: jsonb("completed_exercises").default({}), // { "1": 3, "2": 0 } = level 1 has 3 completed, level 2 has 0
  // System training progression tracking (耶氏台球学院系统教学)
  currentDay: integer("current_day").notNull().default(1), // Current training day in the system program (1-30)

  // Ability Score System (5-dimension scoring for 90-day challenge)
  // 五维能力评分系统：每个维度独立计分0-100，清台能力总分为五维求和0-500
  // 计算公式 (server/abilityScoreEngine.ts:130): clearanceScore = accuracy + spin + positioning + power + strategy
  accuracyScore: integer("accuracy_score").notNull().default(0), // 准度分 (0-100)
  spinScore: integer("spin_score").notNull().default(0), // 杆法分 (0-100)
  positioningScore: integer("positioning_score").notNull().default(0), // 走位分 (0-100)
  powerScore: integer("power_score").notNull().default(0), // 发力分 (0-100)
  strategyScore: integer("strategy_score").notNull().default(0), // 策略分 (0-100)
  clearanceScore: integer("clearance_score").notNull().default(0), // 清台能力总分 (0-500, 五维简单求和)

  // Raw data for ability score calculation
  accuracyTotalShots: integer("accuracy_total_shots").notNull().default(0),
  accuracySuccessfulShots: integer("accuracy_successful_shots").notNull().default(0),
  spinTotalDifficultyPoints: integer("spin_total_difficulty_points").notNull().default(0),
  spinCompletedDifficultyPoints: integer("spin_completed_difficulty_points").notNull().default(0),
  positioningTotalDifficultyPoints: integer("positioning_total_difficulty_points").notNull().default(0),
  positioningCompletedDifficultyPoints: integer("positioning_completed_difficulty_points").notNull().default(0),
  powerTotalDifficultyPoints: integer("power_total_difficulty_points").notNull().default(0),
  powerCompletedDifficultyPoints: integer("power_completed_difficulty_points").notNull().default(0),
  strategyTotalDifficultyPoints: integer("strategy_total_difficulty_points").notNull().default(0),
  strategyCompletedDifficultyPoints: integer("strategy_completed_difficulty_points").notNull().default(0),

  // 90-day challenge progress tracking
  challengeStartDate: timestamp("challenge_start_date"), // When user started 90-day challenge
  challengeCurrentDay: integer("challenge_current_day").default(1), // Current day in 90-day challenge (1-90)
  challengeCompletedDays: integer("challenge_completed_days").default(0), // Total days completed successfully

  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: integer("level").notNull().default(1),
  difficulty: text("difficulty").notNull(), // "初级", "中级", "高级"
  imageUrl: text("image_url"),
  category: text("category").notNull(), // "直线击球", "角度球", "走位控制" etc.
});

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  rating: integer("rating"), // 1-5 stars
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  duration: integer("duration"), // in minutes
  rating: integer("rating"), // 1-5 stars
  imageUrl: text("image_url"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  content: text("content").notNull(), // AI generated feedback
  rating: integer("rating"), // Task performance rating
  date: timestamp("date").notNull().defaultNow(),
});

export const trainingPrograms = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  totalDays: integer("total_days").notNull(),
  currentDay: integer("current_day").notNull().default(1),
  difficulty: text("difficulty").notNull(), // "新手", "进阶", "高级"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trainingDays = pgTable("training_days", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => trainingPrograms.id),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  objectives: text("objectives").array().notNull(),
  keyPoints: text("key_points").array(),
  estimatedDuration: integer("estimated_duration"), // in minutes
});

export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  programId: integer("program_id").references(() => trainingPrograms.id),
  dayId: integer("day_id").references(() => trainingDays.id),
  title: text("title").notNull(),
  description: text("description"),
  notes: text("notes"),
  duration: integer("duration"), // actual duration in minutes
  rating: integer("rating"), // 1-5 stars
  completed: boolean("completed").notNull().default(false),
  sessionType: text("session_type", { enum: ["guided", "custom", "special"] }).notNull().default("guided"),
  aiFeedback: text("ai_feedback"), // AI coaching feedback
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const trainingNotes = pgTable("training_notes", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => trainingSessions.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // "training", "streak", "level", "time", "rating"
  condition: jsonb("condition").notNull(), // { type: "complete_sessions", target: 1 }
  expReward: integer("exp_reward").notNull().default(0),
  category: text("category").notNull(), // "beginner", "intermediate", "advanced", "master"
  unlocked: boolean("unlocked").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});

// === Daily Goals System ===
export const goalTemplates = pgTable("goal_templates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "SESSION_COUNT", "TOTAL_DURATION", "MIN_RATING"
  description: text("description").notNull(), // "完成 {target} 次训练"
  difficulty: text("difficulty").notNull().default("EASY"), // "EASY", "MEDIUM", "HARD"
  rewardXp: integer("reward_xp").notNull().default(10),
  active: boolean("active").notNull().default(true), // Whether this template is active
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userDailyGoals = pgTable("user_daily_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  goalTemplateId: integer("goal_template_id").notNull().references(() => goalTemplates.id),
  date: timestamp("date").notNull(), // The date this goal is for (stored as start of day UTC)
  targetValue: integer("target_value").notNull(), // e.g., 3 sessions, 15 minutes
  currentValue: integer("current_value").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  lastActiveAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  lastActiveAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  createdAt: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({
  id: true,
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingDaySchema = createInsertSchema(trainingDays).omit({
  id: true,
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingNoteSchema = createInsertSchema(trainingNotes).omit({
  id: true,
  timestamp: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;
export type TrainingDay = typeof trainingDays.$inferSelect;
export type InsertTrainingDay = z.infer<typeof insertTrainingDaySchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingNote = typeof trainingNotes.$inferSelect;
export type InsertTrainingNote = z.infer<typeof insertTrainingNoteSchema>;

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Daily Goals Schemas
export const insertGoalTemplateSchema = createInsertSchema(goalTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertUserDailyGoalSchema = createInsertSchema(userDailyGoals).omit({
  id: true,
  createdAt: true,
});

export type GoalTemplate = typeof goalTemplates.$inferSelect;
export type InsertGoalTemplate = z.infer<typeof insertGoalTemplateSchema>;
export type UserDailyGoal = typeof userDailyGoals.$inferSelect;
export type InsertUserDailyGoal = z.infer<typeof insertUserDailyGoalSchema>;

// === V2.1 Training System (十大招 System) ===

// ============================================================================
// 90天训练系统 (90-Day Training System - Fu Jiajun Ten Core Skills)
// ============================================================================

/**
 * Ten Core Skills Table (十大招主表)
 * Fu Jiajun's 10 core billiards skills that form the foundation of the 90-day program
 */
export const tencoreSkills = pgTable("tencore_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillNumber: integer("skill_number").notNull().unique(), // 1-10
  skillName: varchar("skill_name", { length: 50 }).notNull(), // e.g., "基本功", "发力", "五分点"
  description: text("description"),
  trainingDays: integer("training_days").notNull(), // Number of days for this skill
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 90-Day Curriculum Table (90天课程表)
 * Daily training curriculum mapped to the ten core skills
 */
export const ninetyDayCurriculum = pgTable("ninety_day_curriculum", {
  dayNumber: integer("day_number").primaryKey(), // 1-90, PRIMARY KEY
  tencoreSkillId: varchar("tencore_skill_id", { length: 50 }),  // References skills.id (VARCHAR)
  trainingType: varchar("training_type", { length: 20 }).notNull(), // '系统', '专项', '测试', '理论', '考核'
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  originalCourseRef: varchar("original_course_ref", { length: 50 }), // e.g., "第1集"
  objectives: text("objectives").array().notNull().default([]), // ["目标1", "目标2"]
  keyPoints: text("key_points").array().notNull().default([]), // ["要点1", "要点2"]
  practiceRequirements: jsonb("practice_requirements").default({}),

  // Ability dimension mapping for scoring
  primarySkill: varchar("primary_skill", { length: 20 }), // 'accuracy', 'spin', 'positioning', 'power', 'strategy'
  scoringMethod: varchar("scoring_method", { length: 20 }).default('completion'), // 'success_rate' or 'completion'
  maxAttempts: integer("max_attempts"), // For success_rate scoring
  estimatedDuration: integer("estimated_duration").default(60), // minutes
  difficulty: varchar("difficulty", { length: 10 }), // '初级', '中级', '高级'
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Specialized Training Table (专项训练表)
 * Specialized drills for specific skills: 五分点, 力度, 分离角
 */
export const specializedTraining = pgTable("specialized_training", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(), // '五分点', '力度', '分离角'
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  trainingMethod: text("training_method"), // Detailed training instructions
  evaluationCriteria: jsonb("evaluation_criteria").default({}), // {"初级": "...", "中级": "...", "高级": "..."}
  relatedTencoreSkills: jsonb("related_tencore_skills").default([]), // [3, 4, 5]
  difficulty: varchar("difficulty", { length: 10 }), // '初级', '中级', '高级'
  estimatedDuration: integer("estimated_duration").default(30), // minutes
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * User 90-Day Progress Table (用户90天训练进度表)
 * Tracks user's progress through the 90-day program
 */
export const userNinetyDayProgress = pgTable("user_ninety_day_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentDay: integer("current_day").notNull().default(1), // 1-90
  completedDays: jsonb("completed_days").default([]), // [1, 2, 3]
  tencoreProgress: jsonb("tencore_progress").default({}), // {"1": 60, "2": 40}
  specializedProgress: jsonb("specialized_progress").default({}), // {"五分点": {"1分点": 80}}
  totalTrainingTime: integer("total_training_time").default(0), // minutes
  lastTrainingDate: timestamp("last_training_date", { withTimezone: true }),
  startDate: timestamp("start_date", { withTimezone: true }), // NULL until user explicitly starts challenge
  estimatedCompletionDate: timestamp("estimated_completion_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_ninety_day_progress_user_unique").on(table.userId),
]);

/**
 * 90-Day Training Records Table (90天训练记录表)
 * Detailed records of each training session
 */
export const ninetyDayTrainingRecords = pgTable("ninety_day_training_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayNumber: integer("day_number").notNull(), // 1-90, references ninety_day_curriculum.day_number
  trainingType: varchar("training_type", { length: 20 }).notNull(), // '系统', '专项', '测试'
  duration: integer("duration").notNull(), // minutes
  rating: integer("rating"), // 1-5
  notes: text("notes"),
  aiFeedback: text("ai_feedback"),

  // Training statistics and ability score tracking
  trainingStats: jsonb("training_stats").default({}), // Flexible stats: { total_attempts: 10, successful_shots: 7, angle: 30, etc. }
  successRate: integer("success_rate"), // Success rate stored as integer (0-100) for percentage
  achievedTarget: boolean("achieved_target"), // Whether training target was met
  scoreChanges: jsonb("score_changes").default({}), // Ability score changes: { accuracy: +5, clearance: +3 }

  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// Old V2.1 Training System (8-Level System - Keep for now)
// ============================================================================

/**
 * Training Levels Table (训练关卡表)
 * Represents the 8-level "十大招" training system
 */
export const trainingLevels = pgTable("training_levels", {
  id: uuid("id").defaultRandom().primaryKey(),
  levelNumber: integer("level_number").notNull().unique(), // 1-8
  title: varchar("title", { length: 100 }).notNull(), // e.g., "第一招：站姿与握杆"
  description: text("description"),
  prerequisiteLevelId: uuid("prerequisite_level_id").references((): any => trainingLevels.id),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Training Skills Table (技能主表)
 * Each level contains multiple skills (e.g., "站姿", "握杆")
 * NOTE: This replaces the old skill tree "skills" table
 */
export const trainingSkills = pgTable("training_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  levelId: uuid("level_id").notNull().references(() => trainingLevels.id, { onDelete: 'cascade' }),
  skillName: varchar("skill_name", { length: 100 }).notNull(), // e.g., "站姿"
  skillOrder: integer("skill_order").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Sub Skills Table (子技能表)
 * Each skill is broken down into sub-skills (e.g., "脚位", "身体姿态")
 */
export const subSkills = pgTable("sub_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id").notNull().references(() => trainingSkills.id, { onDelete: 'cascade' }),
  subSkillName: varchar("sub_skill_name", { length: 100 }).notNull(), // e.g., "脚位"
  subSkillOrder: integer("sub_skill_order").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Training Units Table (训练单元表)
 * Each sub-skill contains training units: theory, practice, challenge
 * Content is stored in JSONB for flexibility
 */
export const trainingUnits = pgTable("training_units", {
  id: uuid("id").defaultRandom().primaryKey(),
  subSkillId: uuid("sub_skill_id").notNull().references(() => subSkills.id, { onDelete: 'cascade' }),
  unitType: varchar("unit_type", { length: 20 }).notNull(), // 'theory', 'practice', 'challenge'
  unitOrder: integer("unit_order").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: jsonb("content").notNull(), // Flexible content structure based on unitType
  xpReward: integer("xp_reward").default(10),
  estimatedMinutes: integer("estimated_minutes").default(5),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * User Training Progress Table (核心进度表)
 * Tracks individual user progress through training units
 * This is the core table for progress tracking
 */
export const userTrainingProgress = pgTable("user_training_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  levelId: uuid("level_id").notNull().references(() => trainingLevels.id, { onDelete: 'cascade' }),
  unitId: uuid("unit_id").notNull().references(() => trainingUnits.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  progressData: jsonb("progress_data"), // Stores detailed progress information
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_training_progress_user_unit_unique").on(table.userId, table.unitId),
]);

/**
 * Specialized Trainings Table (专项训练主表)
 * Represents the 8 core skill categories for specialized training
 */
export const specializedTrainings = pgTable("specialized_trainings", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillCategory: varchar("skill_category", { length: 50 }).notNull(), // '准度', '走位', '防守', etc.
  trainingName: varchar("training_name", { length: 100 }).notNull(),
  description: text("description"),
  difficultyLevel: integer("difficulty_level").default(1), // 1-5
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Specialized Training Plans Table (专项训练计划表)
 * Contains the detailed exercises for each specialized training
 */
export const specializedTrainingPlans = pgTable("specialized_training_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainingId: uuid("training_id").notNull().references(() => specializedTrainings.id, { onDelete: 'cascade' }),
  planOrder: integer("plan_order").notNull(),
  exerciseName: varchar("exercise_name", { length: 200 }).notNull(),
  exerciseDescription: text("exercise_description"),
  demoVideoUrl: varchar("demo_video_url", { length: 500 }),
  targetMetrics: jsonb("target_metrics"), // Target performance metrics
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 90-Day Training System Insert Schemas
// ============================================================================

export const insertTencoreSkillSchema = createInsertSchema(tencoreSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNinetyDayCurriculumSchema = createInsertSchema(ninetyDayCurriculum).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertNinetyDaySpecializedTrainingSchema = createInsertSchema(specializedTraining).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserNinetyDayProgressSchema = createInsertSchema(userNinetyDayProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNinetyDayTrainingRecordSchema = createInsertSchema(ninetyDayTrainingRecords).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// 90-Day Training System TypeScript Types
// ============================================================================

export type TencoreSkill = typeof tencoreSkills.$inferSelect;
export type InsertTencoreSkill = z.infer<typeof insertTencoreSkillSchema>;

export type NinetyDayCurriculum = typeof ninetyDayCurriculum.$inferSelect;
export type InsertNinetyDayCurriculum = z.infer<typeof insertNinetyDayCurriculumSchema>;

export type NinetyDaySpecializedTraining = typeof specializedTraining.$inferSelect;
export type InsertNinetyDaySpecializedTraining = z.infer<typeof insertNinetyDaySpecializedTrainingSchema>;

export type UserNinetyDayProgress = typeof userNinetyDayProgress.$inferSelect;
export type InsertUserNinetyDayProgress = z.infer<typeof insertUserNinetyDayProgressSchema>;

export type NinetyDayTrainingRecord = typeof ninetyDayTrainingRecords.$inferSelect;
export type InsertNinetyDayTrainingRecord = z.infer<typeof insertNinetyDayTrainingRecordSchema>;

// ============================================================================
// Old V2.1 TypeScript Content Types
// ============================================================================

export interface TheoryContent {
  type: 'theory';
  text: string;
  images?: string[];
  video?: string;
}

export interface PracticeContent {
  type: 'practice';
  instructions: string;
  demo_video: string;
  success_criteria: {
    type: 'repetitions';
    target: number;
  };
}

export interface ChallengeContent {
  type: 'challenge';
  instructions: string;
  success_criteria: {
    type: 'success_rate';
    target: number; // 0.0 - 1.0 (percentage)
  };
}

export type TrainingUnitContent = TheoryContent | PracticeContent | ChallengeContent;

export interface ProgressData {
  started_at: string;
  last_activity_at: string;
  attempts: number;
  current_count?: number; // For practice units
  success_rate?: number; // For challenge units (0.0 - 1.0)
  notes?: string;
}

// V2.1 Insert Schemas
export const insertTrainingLevelSchema = createInsertSchema(trainingLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingSkillSchema = createInsertSchema(trainingSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubSkillSchema = createInsertSchema(subSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingUnitSchema = createInsertSchema(trainingUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTrainingProgressSchema = createInsertSchema(userTrainingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpecializedTrainingSchema = createInsertSchema(specializedTrainings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpecializedTrainingPlanSchema = createInsertSchema(specializedTrainingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// V2.1 Types
export type TrainingLevel = typeof trainingLevels.$inferSelect;
export type InsertTrainingLevel = z.infer<typeof insertTrainingLevelSchema>;
export type TrainingSkill = typeof trainingSkills.$inferSelect;
export type InsertTrainingSkill = z.infer<typeof insertTrainingSkillSchema>;
export type SubSkill = typeof subSkills.$inferSelect;
export type InsertSubSkill = z.infer<typeof insertSubSkillSchema>;
export type TrainingUnit = typeof trainingUnits.$inferSelect;
export type InsertTrainingUnit = z.infer<typeof insertTrainingUnitSchema>;
export type UserTrainingProgress = typeof userTrainingProgress.$inferSelect;
export type InsertUserTrainingProgress = z.infer<typeof insertUserTrainingProgressSchema>;
export type SpecializedTraining = typeof specializedTrainings.$inferSelect;
export type InsertSpecializedTraining = z.infer<typeof insertSpecializedTrainingSchema>;
export type SpecializedTrainingPlan = typeof specializedTrainingPlans.$inferSelect;
export type InsertSpecializedTrainingPlan = z.infer<typeof insertSpecializedTrainingPlanSchema>;

// === OLD Skill Tree System (DEPRECATED - To be removed) ===
// NOTE: This old skill tree system conflicts with the new V2.1 training system
// It should be removed after confirming it's not being used anywhere
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  // 用于前端渲染的位置信息 (例如: { x: 100, y: 200 })
  position: jsonb("position").default('{}').notNull(),
  // UI相关的元数据，如图标、颜色等
  metadata: jsonb("metadata").default('{}').notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skillDependencies = pgTable("skill_dependencies", {
  sourceSkillId: integer("source_skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  targetSkillId: integer("target_skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: { name: 'skill_dependencies_pk', columns: [table.sourceSkillId, table.targetSkillId] },
}));

export const skillUnlockConditions = pgTable("skill_unlock_conditions", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  // 条件类型: 'LEVEL', 'COURSE', 'ACHIEVEMENT', 'DAILY_GOAL' 等
  conditionType: varchar("condition_type", { length: 50 }).notNull(),
  // 条件关联的ID，例如课程ID、成就ID (使用 text 以支持灵活的引用)
  conditionValue: text("condition_value").notNull(),
  // 可选：完成次数要求，默认为1
  requiredCount: integer("required_count").notNull().default(1),
  // 条件描述，用于前端展示
  conditionDescription: text("condition_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSkillProgress = pgTable("user_skill_progress", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  // 记录解锁时的数据快照，用于审计或展示
  unlockContext: jsonb("unlock_context").default('{}').notNull(),
}, (table) => ({
  pk: { name: 'user_skill_progress_pk', columns: [table.userId, table.skillId] },
}));

// Skill Tree Insert Schemas
export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertSkillDependencySchema = createInsertSchema(skillDependencies);

export const insertSkillUnlockConditionSchema = createInsertSchema(skillUnlockConditions).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillProgressSchema = createInsertSchema(userSkillProgress).omit({
  unlockedAt: true,
});

// Skill Tree Types
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SkillDependency = typeof skillDependencies.$inferSelect;
export type InsertSkillDependency = z.infer<typeof insertSkillDependencySchema>;
export type SkillUnlockCondition = typeof skillUnlockConditions.$inferSelect;
export type InsertSkillUnlockCondition = z.infer<typeof insertSkillUnlockConditionSchema>;
export type UserSkillProgress = typeof userSkillProgress.$inferSelect;
export type InsertUserSkillProgress = z.infer<typeof insertUserSkillProgressSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userTasks: many(userTasks),
  diaryEntries: many(diaryEntries),
  feedbacks: many(feedbacks),
  trainingSessions: many(trainingSessions),
  userAchievements: many(userAchievements),
  userDailyGoals: many(userDailyGoals),
  userSkillProgress: many(userSkillProgress),
  // V2.1 Training System
  userTrainingProgress: many(userTrainingProgress),
  // 90-Day Training System
  ninetyDayProgress: many(userNinetyDayProgress),
  ninetyDayTrainingRecords: many(ninetyDayTrainingRecords),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks),
  feedbacks: many(feedbacks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
  }),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [feedbacks.taskId],
    references: [tasks.id],
  }),
}));

export const trainingProgramsRelations = relations(trainingPrograms, ({ many }) => ({
  trainingDays: many(trainingDays),
  trainingSessions: many(trainingSessions),
}));

export const trainingDaysRelations = relations(trainingDays, ({ one, many }) => ({
  program: one(trainingPrograms, {
    fields: [trainingDays.programId],
    references: [trainingPrograms.id],
  }),
  trainingSessions: many(trainingSessions),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [trainingSessions.userId],
    references: [users.id],
  }),
  program: one(trainingPrograms, {
    fields: [trainingSessions.programId],
    references: [trainingPrograms.id],
  }),
  day: one(trainingDays, {
    fields: [trainingSessions.dayId],
    references: [trainingDays.id],
  }),
  trainingNotes: many(trainingNotes),
}));

export const trainingNotesRelations = relations(trainingNotes, ({ one }) => ({
  session: one(trainingSessions, {
    fields: [trainingNotes.sessionId],
    references: [trainingSessions.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const goalTemplatesRelations = relations(goalTemplates, ({ many }) => ({
  userDailyGoals: many(userDailyGoals),
}));

export const userDailyGoalsRelations = relations(userDailyGoals, ({ one }) => ({
  user: one(users, {
    fields: [userDailyGoals.userId],
    references: [users.id],
  }),
  template: one(goalTemplates, {
    fields: [userDailyGoals.goalTemplateId],
    references: [goalTemplates.id],
  }),
}));

// ============================================================================
// 90-Day Training System Relations
// ============================================================================

export const tencoreSkillsRelations = relations(tencoreSkills, ({ many }) => ({
  curriculumDays: many(ninetyDayCurriculum),
}));

export const ninetyDayCurriculumRelations = relations(ninetyDayCurriculum, ({ one, many }) => ({
  tencoreSkill: one(tencoreSkills, {
    fields: [ninetyDayCurriculum.tencoreSkillId],
    references: [tencoreSkills.id],
  }),
  trainingRecords: many(ninetyDayTrainingRecords),
}));

export const userNinetyDayProgressRelations = relations(userNinetyDayProgress, ({ one }) => ({
  user: one(users, {
    fields: [userNinetyDayProgress.userId],
    references: [users.id],
  }),
}));

export const ninetyDayTrainingRecordsRelations = relations(ninetyDayTrainingRecords, ({ one }) => ({
  user: one(users, {
    fields: [ninetyDayTrainingRecords.userId],
    references: [users.id],
  }),
  curriculum: one(ninetyDayCurriculum, {
    fields: [ninetyDayTrainingRecords.dayNumber],
    references: [ninetyDayCurriculum.dayNumber],
  }),
}));

// ============================================================================
// Old V2.1 Training System Relations
// ============================================================================

export const trainingLevelsRelations = relations(trainingLevels, ({ many, one }) => ({
  skills: many(trainingSkills),
  userProgress: many(userTrainingProgress),
  prerequisiteLevel: one(trainingLevels, {
    fields: [trainingLevels.prerequisiteLevelId],
    references: [trainingLevels.id],
  }),
}));

export const trainingSkillsRelations = relations(trainingSkills, ({ one, many }) => ({
  level: one(trainingLevels, {
    fields: [trainingSkills.levelId],
    references: [trainingLevels.id],
  }),
  subSkills: many(subSkills),
}));

export const subSkillsRelations = relations(subSkills, ({ one, many }) => ({
  skill: one(trainingSkills, {
    fields: [subSkills.skillId],
    references: [trainingSkills.id],
  }),
  trainingUnits: many(trainingUnits),
}));

export const trainingUnitsRelations = relations(trainingUnits, ({ one, many }) => ({
  subSkill: one(subSkills, {
    fields: [trainingUnits.subSkillId],
    references: [subSkills.id],
  }),
  userProgress: many(userTrainingProgress),
}));

export const userTrainingProgressRelations = relations(userTrainingProgress, ({ one }) => ({
  user: one(users, {
    fields: [userTrainingProgress.userId],
    references: [users.id],
  }),
  level: one(trainingLevels, {
    fields: [userTrainingProgress.levelId],
    references: [trainingLevels.id],
  }),
  unit: one(trainingUnits, {
    fields: [userTrainingProgress.unitId],
    references: [trainingUnits.id],
  }),
}));

export const specializedTrainingsRelations = relations(specializedTrainings, ({ many }) => ({
  plans: many(specializedTrainingPlans),
}));

export const specializedTrainingPlansRelations = relations(specializedTrainingPlans, ({ one }) => ({
  training: one(specializedTrainings, {
    fields: [specializedTrainingPlans.trainingId],
    references: [specializedTrainings.id],
  }),
}));

// === OLD Skill Tree Relations (DEPRECATED) ===

export const skillsRelations = relations(skills, ({ many }) => ({
  dependencies: many(skillDependencies, { relationName: 'source' }),
  dependents: many(skillDependencies, { relationName: 'target' }),
  unlockConditions: many(skillUnlockConditions),
  userProgress: many(userSkillProgress),
}));

export const skillDependenciesRelations = relations(skillDependencies, ({ one }) => ({
  sourceSkill: one(skills, {
    fields: [skillDependencies.sourceSkillId],
    references: [skills.id],
    relationName: 'source',
  }),
  targetSkill: one(skills, {
    fields: [skillDependencies.targetSkillId],
    references: [skills.id],
    relationName: 'target',
  }),
}));

export const skillUnlockConditionsRelations = relations(skillUnlockConditions, ({ one }) => ({
  skill: one(skills, {
    fields: [skillUnlockConditions.skillId],
    references: [skills.id],
  }),
}));

export const userSkillProgressRelations = relations(userSkillProgress, ({ one }) => ({
  user: one(users, {
    fields: [userSkillProgress.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkillProgress.skillId],
    references: [skills.id],
  }),
}));

// ============================================================================
// === TEN CORE SKILLS SYSTEM V3 (VARCHAR主键版本) ===
// 十大招核心系统 - 与SQL 26/27/28创建的数据库表匹配
// ============================================================================

/**
 * Skills Table - 十大招主表
 * 10 core skills forming the theoretical framework
 */
export const skillsV3 = pgTable("skills", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'skill_1' to 'skill_10'
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  skillOrder: integer("skill_order").notNull().unique(),
  iconName: varchar("icon_name", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Sub Skills Table - 子技能表
 * Each skill contains multiple sub-skills (关卡组)
 */
export const subSkillsV3 = pgTable("sub_skills", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'sub_skill_1_1', 'sub_skill_1_2'
  skillId: varchar("skill_id", { length: 50 }).notNull().references(() => skillsV3.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  subSkillOrder: integer("sub_skill_order").notNull(),
  unlockCondition: text("unlock_condition"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Training Units Table - 训练单元表
 * Theory, practice, and challenge units for each sub-skill
 */
export const trainingUnitsV3 = pgTable("training_units", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'unit_1_1_1', 'unit_1_1_2'
  subSkillId: varchar("sub_skill_id", { length: 50 }).notNull().references(() => subSkillsV3.id, { onDelete: 'cascade' }),
  unitType: varchar("unit_type", { length: 20 }).notNull(), // 'theory', 'practice', 'challenge'
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content"), // JSONB: { text, images[], videos[], keyPoints[] }
  goalDescription: text("goal_description"),
  xpReward: integer("xp_reward").default(10),
  unitOrder: integer("unit_order").notNull(),
  estimatedMinutes: integer("estimated_minutes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Specialized Trainings Table - 专项训练主表
 * 8 specialized training categories
 */
export const specializedTrainingsV3 = pgTable("specialized_trainings", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'st_accuracy'
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 50 }),
  category: varchar("category", { length: 50 }),
  sortOrder: integer("sort_order"), // Display order (1-8)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Specialized Training Plans Table - 专项训练计划表
 * Detailed training plans for each specialized training
 */
export const specializedTrainingPlansV3 = pgTable("specialized_training_plans", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'plan_1_1'
  trainingId: varchar("training_id", { length: 50 }).notNull().references(() => specializedTrainingsV3.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  difficulty: varchar("difficulty", { length: 20 }), // 'easy', 'medium', 'hard'
  estimatedTimeMinutes: integer("estimated_time_minutes"),
  content: jsonb("content"),
  xpReward: integer("xp_reward").default(20),

  // Training record configuration metadata
  metadata: jsonb("metadata").default({}), // { trainingType, primarySkill, recordConfig: { metrics: [...], scoringMethod, targetSuccessRate } }

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Plan Unit Mappings Table - 专项计划与训练单元的多对多关联
 */
export const planUnitMappings = pgTable("plan_unit_mappings", {
  id: serial("id").primaryKey(),
  planId: varchar("plan_id", { length: 50 }).notNull().references(() => specializedTrainingPlansV3.id, { onDelete: 'cascade' }),
  unitId: varchar("unit_id", { length: 50 }).notNull().references(() => trainingUnitsV3.id, { onDelete: 'cascade' }),
  unitOrder: integer("unit_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("plan_unit_mappings_unique").on(table.planId, table.unitId),
]);

/**
 * Curriculum Day Units Table - 90天课程与训练单元的多对多关联
 */
export const curriculumDayUnits = pgTable("curriculum_day_units", {
  id: serial("id").primaryKey(),
  dayNumber: integer("day_number").notNull(), // References ninety_day_curriculum.day_number
  unitId: varchar("unit_id", { length: 50 }).notNull().references(() => trainingUnitsV3.id, { onDelete: 'cascade' }),
  unitOrder: integer("unit_order").notNull(),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("curriculum_day_units_unique").on(table.dayNumber, table.unitId),
]);

/**
 * User Skill Progress Table - 用户十大招学习进度
 */
export const userSkillProgressV3 = pgTable("user_skill_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: varchar("skill_id", { length: 50 }).notNull().references(() => skillsV3.id, { onDelete: 'cascade' }),
  completedSubSkills: integer("completed_sub_skills").default(0),
  totalSubSkills: integer("total_sub_skills").default(0),
  progressPercentage: integer("progress_percentage").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_skill_progress_v3_unique").on(table.userId, table.skillId),
]);

/**
 * User Unit Completions Table - 用户训练单元完成记录
 */
export const userUnitCompletions = pgTable("user_unit_completions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  unitId: varchar("unit_id", { length: 50 }).notNull().references(() => trainingUnitsV3.id, { onDelete: 'cascade' }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  score: integer("score"),
  notes: text("notes"),
  xpEarned: integer("xp_earned"),
}, (table) => [
  uniqueIndex("user_unit_completions_unique").on(table.userId, table.unitId),
]);

/**
 * Specialized Training Sessions Table - 专项训练会话记录
 * Tracks individual training sessions for specialized training plans
 */
export const specializedTrainingSessions = pgTable("specialized_training_sessions", {
  id: varchar("id", { length: 50 }).primaryKey(), // e.g., 'session_xxxxx'
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainingPlanId: varchar("training_plan_id", { length: 50 }).notNull().references(() => specializedTrainingPlansV3.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duration in minutes
  rating: integer("rating"), // 1-5 star rating
  notes: text("notes"),
  xpEarned: integer("xp_earned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * User Specialized Progress Table - 用户专项训练进度
 * Tracks user progress across all specialized training categories
 */
export const userSpecializedProgress = pgTable("user_specialized_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainingId: varchar("training_id", { length: 50 }).notNull().references(() => specializedTrainingsV3.id, { onDelete: 'cascade' }),
  completedPlans: jsonb("completed_plans").$type<Record<string, boolean>>().default({}), // { "plan_basic_1": true, ... }
  totalSessions: integer("total_sessions").default(0),
  totalMinutes: integer("total_minutes").default(0),
  totalXpEarned: integer("total_xp_earned").default(0),
  averageRating: integer("average_rating"), // Average rating * 10 to store as integer
  lastTrainingAt: timestamp("last_training_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_specialized_progress_unique").on(table.userId, table.trainingId),
]);

// ============================================================================
// Insert Schemas - Ten Core Skills V3
// ============================================================================

export const insertSkillV3Schema = createInsertSchema(skillsV3).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSubSkillV3Schema = createInsertSchema(subSkillsV3).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingUnitV3Schema = createInsertSchema(trainingUnitsV3).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSpecializedTrainingV3Schema = createInsertSchema(specializedTrainingsV3).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSpecializedTrainingPlanV3Schema = createInsertSchema(specializedTrainingPlansV3).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPlanUnitMappingSchema = createInsertSchema(planUnitMappings).omit({
  id: true,
  createdAt: true,
});

export const insertCurriculumDayUnitSchema = createInsertSchema(curriculumDayUnits).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillProgressV3Schema = createInsertSchema(userSkillProgressV3).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserUnitCompletionSchema = createInsertSchema(userUnitCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertSpecializedTrainingSessionSchema = createInsertSchema(specializedTrainingSessions).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSpecializedProgressSchema = createInsertSchema(userSpecializedProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// TypeScript Types - Ten Core Skills V3
// ============================================================================

export type SkillV3 = typeof skillsV3.$inferSelect;
export type InsertSkillV3 = z.infer<typeof insertSkillV3Schema>;

export type SubSkillV3 = typeof subSkillsV3.$inferSelect;
export type InsertSubSkillV3 = z.infer<typeof insertSubSkillV3Schema>;

export type TrainingUnitV3 = typeof trainingUnitsV3.$inferSelect;
export type InsertTrainingUnitV3 = z.infer<typeof insertTrainingUnitV3Schema>;

export type SpecializedTrainingV3 = typeof specializedTrainingsV3.$inferSelect;
export type InsertSpecializedTrainingV3 = z.infer<typeof insertSpecializedTrainingV3Schema>;

export type SpecializedTrainingPlanV3 = typeof specializedTrainingPlansV3.$inferSelect;
export type InsertSpecializedTrainingPlanV3 = z.infer<typeof insertSpecializedTrainingPlanV3Schema>;

export type PlanUnitMapping = typeof planUnitMappings.$inferSelect;
export type InsertPlanUnitMapping = z.infer<typeof insertPlanUnitMappingSchema>;

export type CurriculumDayUnit = typeof curriculumDayUnits.$inferSelect;
export type InsertCurriculumDayUnit = z.infer<typeof insertCurriculumDayUnitSchema>;

export type UserSkillProgressV3 = typeof userSkillProgressV3.$inferSelect;
export type InsertUserSkillProgressV3 = z.infer<typeof insertUserSkillProgressV3Schema>;

export type UserUnitCompletion = typeof userUnitCompletions.$inferSelect;
export type InsertUserUnitCompletion = z.infer<typeof insertUserUnitCompletionSchema>;

export type SpecializedTrainingSession = typeof specializedTrainingSessions.$inferSelect;
export type InsertSpecializedTrainingSession = z.infer<typeof insertSpecializedTrainingSessionSchema>;

export type UserSpecializedProgress = typeof userSpecializedProgress.$inferSelect;
export type InsertUserSpecializedProgress = z.infer<typeof insertUserSpecializedProgressSchema>;

// ============================================================================
// Relations - Ten Core Skills V3
// ============================================================================

export const skillsV3Relations = relations(skillsV3, ({ many }) => ({
  subSkills: many(subSkillsV3),
  userProgress: many(userSkillProgressV3),
}));

export const subSkillsV3Relations = relations(subSkillsV3, ({ one, many }) => ({
  skill: one(skillsV3, {
    fields: [subSkillsV3.skillId],
    references: [skillsV3.id],
  }),
  trainingUnits: many(trainingUnitsV3),
}));

export const trainingUnitsV3Relations = relations(trainingUnitsV3, ({ one, many }) => ({
  subSkill: one(subSkillsV3, {
    fields: [trainingUnitsV3.subSkillId],
    references: [subSkillsV3.id],
  }),
  planMappings: many(planUnitMappings),
  curriculumMappings: many(curriculumDayUnits),
  userCompletions: many(userUnitCompletions),
}));

export const specializedTrainingsV3Relations = relations(specializedTrainingsV3, ({ many }) => ({
  plans: many(specializedTrainingPlansV3),
}));

export const specializedTrainingPlansV3Relations = relations(specializedTrainingPlansV3, ({ one, many }) => ({
  training: one(specializedTrainingsV3, {
    fields: [specializedTrainingPlansV3.trainingId],
    references: [specializedTrainingsV3.id],
  }),
  unitMappings: many(planUnitMappings),
}));

export const planUnitMappingsRelations = relations(planUnitMappings, ({ one }) => ({
  plan: one(specializedTrainingPlansV3, {
    fields: [planUnitMappings.planId],
    references: [specializedTrainingPlansV3.id],
  }),
  unit: one(trainingUnitsV3, {
    fields: [planUnitMappings.unitId],
    references: [trainingUnitsV3.id],
  }),
}));

export const curriculumDayUnitsRelations = relations(curriculumDayUnits, ({ one }) => ({
  unit: one(trainingUnitsV3, {
    fields: [curriculumDayUnits.unitId],
    references: [trainingUnitsV3.id],
  }),
}));

export const userSkillProgressV3Relations = relations(userSkillProgressV3, ({ one }) => ({
  user: one(users, {
    fields: [userSkillProgressV3.userId],
    references: [users.id],
  }),
  skill: one(skillsV3, {
    fields: [userSkillProgressV3.skillId],
    references: [skillsV3.id],
  }),
}));

export const userUnitCompletionsRelations = relations(userUnitCompletions, ({ one }) => ({
  user: one(users, {
    fields: [userUnitCompletions.userId],
    references: [users.id],
  }),
  unit: one(trainingUnitsV3, {
    fields: [userUnitCompletions.unitId],
    references: [trainingUnitsV3.id],
  }),
}));

export const specializedTrainingSessionsRelations = relations(specializedTrainingSessions, ({ one }) => ({
  user: one(users, {
    fields: [specializedTrainingSessions.userId],
    references: [users.id],
  }),
  trainingPlan: one(specializedTrainingPlansV3, {
    fields: [specializedTrainingSessions.trainingPlanId],
    references: [specializedTrainingPlansV3.id],
  }),
}));

export const userSpecializedProgressRelations = relations(userSpecializedProgress, ({ one }) => ({
  user: one(users, {
    fields: [userSpecializedProgress.userId],
    references: [users.id],
  }),
  training: one(specializedTrainingsV3, {
    fields: [userSpecializedProgress.trainingId],
    references: [specializedTrainingsV3.id],
  }),
}));
