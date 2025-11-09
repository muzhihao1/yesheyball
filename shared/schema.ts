import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
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
  supabaseUserId: varchar("supabase_user_id"), // UUID linking to auth.users.id
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

// === Skill Tree System ===
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
