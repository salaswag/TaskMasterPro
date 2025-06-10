import { users, tasks, type User, type InsertUser, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number, actualTime?: number): Promise<Task | undefined>;
  getSubtasks(parentId: number): Promise<Task[]>;
  moveTaskToTomorrow(id: number): Promise<Task | undefined>;
  reorderTasks(taskIds: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => a.position - b.position);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description ?? null,
      priority: insertTask.priority,
      estimatedTime: insertTask.estimatedTime ?? null,
      actualTime: insertTask.actualTime ?? null,
      completed: insertTask.completed || false,
      scheduledFor: insertTask.scheduledFor,
      scheduledDate: insertTask.scheduledDate ?? null,
      parentId: insertTask.parentId ?? null,
      position: insertTask.position ?? Array.from(this.tasks.values()).length,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(updateTask.id);
    if (!existingTask) return undefined;

    const updatedTask = { ...existingTask, ...updateTask };
    this.tasks.set(updateTask.id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    // Delete task and all its subtasks
    const task = this.tasks.get(id);
    if (!task) return false;

    // Find and delete subtasks
    const subtasks = Array.from(this.tasks.values()).filter(t => t.parentId === id);
    subtasks.forEach(subtask => this.tasks.delete(subtask.id));

    return this.tasks.delete(id);
  }

  async completeTask(id: number, actualTime?: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      completed: true,
      actualTime: actualTime || task.actualTime,
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getSubtasks(parentId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.parentId === parentId)
      .sort((a, b) => a.position - b.position);
  }

  async moveTaskToTomorrow(id: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const updatedTask = {
      ...task,
      scheduledFor: "tomorrow" as const,
      scheduledDate: tomorrow.toISOString(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async reorderTasks(taskIds: number[]): Promise<void> {
    taskIds.forEach((id, index) => {
      const task = this.tasks.get(id);
      if (task) {
        this.tasks.set(id, { ...task, position: index });
      }
    });
  }
}

export const storage = new MemStorage();
