import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").notNull().default(1), // 1-10 scale
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  completed: boolean("completed").notNull().default(false),
  scheduledFor: text("scheduled_for").notNull().default("today"), // today, tomorrow, future
  scheduledDate: text("scheduled_date"), // ISO date string for future tasks
  parentId: integer("parent_id"), // for subtasks
  position: integer("position").notNull().default(0), // for ordering
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  priority: z.number().min(1).max(10),
  estimatedTime: z.number().min(1).optional(),
  actualTime: z.number().min(1).optional(),
  scheduledFor: z.enum(["today", "tomorrow", "future"]),
  scheduledDate: z.string().optional(),
  parentId: z.number().optional(),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.number(),
});

export const completeTaskSchema = z.object({
  id: z.number(),
  actualTime: z.number().min(1).optional(),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type CompleteTask = z.infer<typeof completeTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
