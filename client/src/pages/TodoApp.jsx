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
                      Your Score
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Score Display */}
                      <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {stats.completedPriority || 0}
                        </div>
                        <div className="text-sm font-semibold text-muted-foreground">
                          Priority Points Earned
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {stats.remainingPriority || 0} points remaining
                        </div>
                      </div>

                      {/* Progress Breakdown */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Tasks</span>
                            <span>{stats.completed}/{stats.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Priority Score</span>
                            <span>{stats.completedPriority || 0}/{stats.totalPriority || 0}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${stats.totalPriority > 0 ? (stats.completedPriority / stats.totalPriority) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Time Efficiency</span>
                            <span>{Math.floor((stats.actualTime || 0) / 60)}h {(stats.actualTime || 0) % 60}m</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.estimatedTime ? `Estimated: ${Math.floor(stats.estimatedTime / 60)}h ${stats.estimatedTime % 60}m` : 'No estimates'}
                          </div>
                        </div>
                      </div>

                      {/* Achievement Badges */}
                      {stats.completedPriority >= 50 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600 dark:text-yellow-400 text-lg">🏆</span>
                            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">High Achiever!</span>
                          </div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            50+ priority points earned
                          </p>
                        </div>
                      )}

                      {stats.completed >= 10 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 dark:text-green-400 text-lg">💪</span>
                            <span className="text-sm font-semibold text-green-800 dark:text-green-200">Task Master!</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            10+ tasks completed
                          </p>
                        </div>
                      )}
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