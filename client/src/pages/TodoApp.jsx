import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/forms/TaskForm";
import { TaskTable } from "@/components/tables/TaskTable";
import { CompletionModal } from "@/components/modals/CompletionModal";
import { DashboardView } from "@/components/layouts/DashboardView";
import { useTheme } from "@/components/layouts/ThemeProvider";
import { useTasks, useTaskStats } from "@/hooks/use-tasks";
import { 
  CheckSquare, 
  BarChart3, 
  List,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodoApp() {
  const { theme, toggleTheme } = useTheme();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: stats } = useTaskStats();
  
  const [viewMode, setViewMode] = useState("list");
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [completionEstimatedTime, setCompletionEstimatedTime] = useState(null);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => !task.parentId) // Only main tasks, not subtasks
      .sort((a, b) => b.priority - a.priority); // Sort by priority descending
  }, [tasks]);

  const handleTaskComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setCompletionTaskId(taskId);
    setCompletionEstimatedTime(task?.estimatedTime || null);
  };

  const closeCompletionModal = () => {
    setCompletionTaskId(null);
    setCompletionEstimatedTime(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                <CheckSquare className="inline w-6 h-6 mr-2 text-primary" />
                Todo Basic App
              </h1>
              
              {/* View Toggle */}
              <div className="hidden md:flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3 py-1.5 text-sm"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("dashboard")}
                  className="px-3 py-1.5 text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {viewMode === "list" ? (
          <>
            <TaskForm />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Task List */}
              <div className="xl:col-span-3 space-y-4">
                {filteredTasks.length > 0 ? (
                  <TaskTable
                    tasks={filteredTasks}
                    onComplete={handleTaskComplete}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks found</p>
                    <p className="text-sm">Add a new task to get started!</p>
                  </div>
                )}
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {stats && (
                  <div className="bg-background border border-border rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      <BarChart3 className="inline w-5 h-5 mr-2 text-primary" />
                      Advanced Stats
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Todos</span>
                          <div className="space-x-4">
                            <span className="font-semibold">Total</span>
                            <span className="font-semibold">Completed</span>
                            <span className="font-semibold">Remaining</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span></span>
                          <div className="space-x-8">
                            <span>{stats.total}</span>
                            <span className="ml-6">{stats.completed}</span>
                            <span className="ml-6">{stats.remaining}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Priority</span>
                          <div className="space-x-4">
                            <span>{stats.totalPriority || 0}</span>
                            <span className="ml-6">{stats.completedPriority || 0}</span>
                            <span className="ml-6">{stats.remainingPriority || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated</span>
                          <div className="space-x-4">
                            <span>{Math.floor((stats.estimatedTime + stats.actualTime) / 60) || 0}h</span>
                            <span className="ml-2">0m</span>
                            <span className="ml-4">{Math.floor(stats.estimatedTime / 60) || 0}h</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual</span>
                          <div className="space-x-4">
                            <span>{Math.floor(stats.actualTime / 60) || 0}h</span>
                            <span className="ml-8">0m</span>
                            <span className="ml-8">0m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <DashboardView />
        )}
      </div>

      <CompletionModal
        taskId={completionTaskId}
        estimatedTime={completionEstimatedTime}
        isOpen={!!completionTaskId}
        onClose={closeCompletionModal}
      />
    </div>
  );
}