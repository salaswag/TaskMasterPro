import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema, completeTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Get a specific task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Update a task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = updateTaskSchema.parse({ ...req.body, id });
      const task = await storage.updateTask(taskData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Complete a task
  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { actualTime } = completeTaskSchema.parse({ ...req.body, id });
      const task = await storage.completeTask(id, actualTime);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid completion data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // Get subtasks for a task
  app.get("/api/tasks/:id/subtasks", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const subtasks = await storage.getSubtasks(parentId);
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subtasks" });
    }
  });

  // Move task to tomorrow
  app.post("/api/tasks/:id/move-to-tomorrow", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.moveTaskToTomorrow(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to move task" });
    }
  });

  // Reorder tasks
  app.post("/api/tasks/reorder", async (req, res) => {
    try {
      const { taskIds } = req.body;
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ error: "taskIds must be an array" });
      }
      await storage.reorderTasks(taskIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder tasks" });
    }
  });

  // Get task statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      const today = new Date().toDateString();
      
      const todayTasks = tasks.filter(task => {
        if (task.scheduledFor === "today") return true;
        if (task.scheduledDate) {
          return new Date(task.scheduledDate).toDateString() === today;
        }
        return false;
      });

      const completedTasks = tasks.filter(task => task.completed);
      const totalPriority = tasks.filter(task => !task.completed).reduce((sum, task) => sum + task.priority, 0);
      const completedPriority = completedTasks.reduce((sum, task) => sum + task.priority, 0);
      const estimatedTime = tasks.filter(task => !task.completed).reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const actualTime = completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);

      const stats = {
        total: tasks.length,
        completed: completedTasks.length,
        remaining: tasks.length - completedTasks.length,
        todayTotal: todayTasks.length,
        todayCompleted: todayTasks.filter(task => task.completed).length,
        totalPriority,
        completedPriority,
        remainingPriority: totalPriority - completedPriority,
        estimatedTime,
        actualTime,
        timeSaved: Math.max(0, estimatedTime - actualTime),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
