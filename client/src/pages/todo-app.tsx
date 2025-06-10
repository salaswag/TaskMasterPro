import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskForm } from "@/components/task-form";
import { TaskItem } from "@/components/task-item";
import { DashboardView } from "@/components/dashboard-view";
import { CompletionModal } from "@/components/completion-modal";
import { useTheme } from "@/components/theme-provider";
import { useTasks, useTaskStats } from "@/hooks/use-tasks";
import { 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  List, 
  Filter,
  Clock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "dashboard" | "calendar";
type FilterMode = "all" | "today" | "tomorrow";
type SortMode = "priority" | "due-date" | "estimated-time";

export default function TodoApp() {
  const { theme, setTheme } = useTheme();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: stats } = useTaskStats();
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [completionTaskId, setCompletionTaskId] = useState<number | null>(null);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => !task.parentId); // Only main tasks, not subtasks
    
    // Apply filter
    if (filterMode === "today") {
      filtered = filtered.filter(task => task.scheduledFor === "today");
    } else if (filterMode === "tomorrow") {
      filtered = filtered.filter(task => task.scheduledFor === "tomorrow");
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortMode) {
        case "priority":
          return b.priority - a.priority; // Higher priority first
        case "due-date":
          if (a.scheduledFor !== b.scheduledFor) {
            const order = { today: 0, tomorrow: 1, future: 2 };
            return order[a.scheduledFor as keyof typeof order] - order[b.scheduledFor as keyof typeof order];
          }
          return 0;
        case "estimated-time":
          return (b.estimatedTime || 0) - (a.estimatedTime || 0);
        default:
          return a.position - b.position;
      }
    });
    
    return filtered;
  }, [tasks, filterMode, sortMode]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  };

  const handleTaskComplete = (taskId: number) => {
    setCompletionTaskId(taskId);
  };

  const themeColors = [
    { name: "default", color: "bg-white border-2 border-gray-800" },
    { name: "green", color: "bg-green-500" },
    { name: "orange", color: "bg-orange-500" },
    { name: "red", color: "bg-rose-500" },
  ];

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
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="px-3 py-1.5 text-sm"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                {themeColors.map((themeColor) => (
                  <button
                    key={themeColor.name}
                    onClick={() => setTheme(themeColor.name as any)}
                    className={cn(
                      "w-8 h-8 rounded shadow-sm transition-all hover:scale-105",
                      themeColor.color,
                      theme === themeColor.name && "ring-2 ring-offset-2 ring-primary"
                    )}
                    title={`${themeColor.name} Theme`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {viewMode === "list" && (
          <>
            <TaskForm />
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Task List */}
              <div className="xl:col-span-3 space-y-4">
                {/* Filter Controls */}
                <div className="bg-background border border-border rounded-lg shadow-sm p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex bg-muted rounded-lg p-1">
                        <Button
                          variant={filterMode === "all" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilterMode("all")}
                          className="px-3 py-1.5 text-sm"
                        >
                          All Tasks
                        </Button>
                        <Button
                          variant={filterMode === "today" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilterMode("today")}
                          className="px-3 py-1.5 text-sm"
                        >
                          Today
                        </Button>
                        <Button
                          variant={filterMode === "tomorrow" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilterMode("tomorrow")}
                          className="px-3 py-1.5 text-sm"
                        >
                          Tomorrow
                        </Button>
                      </div>
                      
                      <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="priority">Sort by Priority</SelectItem>
                          <SelectItem value="due-date">Sort by Due Date</SelectItem>
                          <SelectItem value="estimated-time">Sort by Est. Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {stats && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{stats.remaining} tasks left</span>
                        <span>•</span>
                        <span>Total Priority: {stats.remainingPriority}</span>
                        <span>•</span>
                        <span>Est. Total: {formatTime(stats.estimatedTime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Items */}
                <div className="space-y-4">
                  {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleTaskComplete}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks found</p>
                      <p className="text-sm">Add a new task to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
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
                            <span>{stats.totalPriority}</span>
                            <span className="ml-6">{stats.completedPriority}</span>
                            <span className="ml-6">{stats.remainingPriority}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated</span>
                          <div className="space-x-4">
                            <span>{formatTime(stats.estimatedTime + stats.actualTime)}</span>
                            <span className="ml-2">0m</span>
                            <span className="ml-4">{formatTime(stats.estimatedTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual</span>
                          <div className="space-x-4">
                            <span>0m</span>
                            <span className="ml-8">0m</span>
                            <span className="ml-8">0m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tomorrow's Tasks */}
                <div className="bg-background border border-border rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    <Calendar className="inline w-5 h-5 mr-2 text-primary" />
                    Tomorrow
                  </h3>
                  
                  <div className="space-y-3">
                    {tasks
                      .filter(task => task.scheduledFor === "tomorrow" && !task.parentId)
                      .map((task) => (
                        <div key={task.id} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full",
                            task.priority >= 8 ? "bg-red-500" :
                            task.priority >= 6 ? "bg-orange-500" :
                            task.priority >= 4 ? "bg-yellow-500" : "bg-green-500"
                          )}>
                            {task.priority}
                          </span>
                          <span className="text-sm flex-1">{task.title}</span>
                          {task.estimatedTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(task.estimatedTime)}
                            </span>
                          )}
                        </div>
                      ))}
                    
                    {tasks.filter(task => task.scheduledFor === "tomorrow" && !task.parentId).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tasks scheduled for tomorrow
                      </p>
                    )}
                  </div>
                </div>

                {/* Productivity Insights */}
                {stats && (
                  <div className="bg-background border border-border rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      <Star className="inline w-5 h-5 mr-2 text-primary" />
                      Insights
                    </h3>
                    
                    <div className="space-y-4">
                      {stats.completed > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckSquare className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Great Progress!</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            You've completed {((stats.completed / stats.total) * 100).toFixed(0)}% of your tasks
                          </p>
                        </div>
                      )}
                      
                      {stats.timeSaved > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Time Efficiency</span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            You saved {formatTime(stats.timeSaved)} through efficient work
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === "dashboard" && <DashboardView />}
        
        {viewMode === "calendar" && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Calendar view coming soon!</p>
          </div>
        )}
      </div>

      <CompletionModal
        taskId={completionTaskId}
        isOpen={completionTaskId !== null}
        onClose={() => setCompletionTaskId(null)}
      />
    </div>
  );
}
