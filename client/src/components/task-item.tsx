import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useUpdateTask, useDeleteTask, useMoveToTomorrow } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { SubtaskList } from "./subtask-list";
import { CompletionModal } from "./completion-modal";
import type { Task } from "@shared/schema";
import { Edit, Trash, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
}

export function TaskItem({ task, onComplete }: TaskItemProps) {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const moveToTomorrow = useMoveToTomorrow();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-500";
    if (priority >= 6) return "bg-orange-500";
    if (priority >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getScheduleBadgeColor = (scheduledFor: string) => {
    switch (scheduledFor) {
      case "today":
        return "bg-blue-50 text-blue-700";
      case "tomorrow":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const handleComplete = (checked: boolean) => {
    if (checked && !task.completed) {
      onComplete(task.id);
    } else if (!checked && task.completed) {
      updateTask.mutate({ id: task.id, completed: false });
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        await updateTask.mutateAsync({ id: task.id, title: editTitle });
        setIsEditing(false);
        toast({
          title: "Task updated",
          description: "Your task has been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update task.",
          variant: "destructive",
        });
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleMoveToTomorrow = async () => {
    try {
      await moveToTomorrow.mutateAsync(task.id);
      toast({
        title: "Task moved",
        description: "Your task has been moved to tomorrow.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move task.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  };

  return (
    <div className={cn(
      "bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow",
      task.completed && "opacity-60"
    )}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full",
                    getPriorityColor(task.priority)
                  )}
                >
                  {task.priority}
                </span>
                
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-sm font-semibold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit();
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        setEditTitle(task.title);
                      }
                    }}
                  />
                ) : (
                  <h3 className={cn(
                    "text-sm font-semibold text-foreground",
                    task.completed && "line-through"
                  )}>
                    {task.title}
                  </h3>
                )}
                
                <Badge className={getScheduleBadgeColor(task.scheduledFor)}>
                  {task.scheduledFor === "today" ? "Today" : 
                   task.scheduledFor === "tomorrow" ? "Tomorrow" : "This Week"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                {task.completed && task.actualTime ? (
                  <span className="text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1 inline text-green-500" />
                    Actual: {formatTime(task.actualTime)}
                  </span>
                ) : task.estimatedTime ? (
                  <span className="text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1 inline" />
                    Est: {formatTime(task.estimatedTime)}
                  </span>
                ) : null}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                >
                  <Trash className="w-3 h-3" />
                </Button>
                
                {!task.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMoveToTomorrow}
                    className="h-8 w-8 p-0"
                    title="Move to tomorrow"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            )}
            
            <SubtaskList parentId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
