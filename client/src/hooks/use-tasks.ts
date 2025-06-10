import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Task, InsertTask, UpdateTask } from "@shared/schema";

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
}

export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: ["/api/tasks", id],
  });
}

export function useSubtasks(parentId: number) {
  return useQuery<Task[]>({
    queryKey: ["/api/tasks", parentId, "subtasks"],
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ["/api/tasks/stats"],
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: UpdateTask) => {
      const response = await apiRequest("PUT", `/api/tasks/${task.id}`, task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, actualTime }: { id: number; actualTime?: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${id}/complete`, { actualTime });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useMoveToTomorrow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/tasks/${id}/move-to-tomorrow`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskIds: number[]) => {
      const response = await apiRequest("POST", "/api/tasks/reorder", { taskIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}
