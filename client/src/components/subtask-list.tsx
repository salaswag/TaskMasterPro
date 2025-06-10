import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSubtasks, useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  parentId: number;
}

export function SubtaskList({ parentId }: SubtaskListProps) {
  const { toast } = useToast();
  const { data: subtasks = [], isLoading } = useSubtasks(parentId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      await createTask.mutateAsync({
        title: newSubtaskTitle,
        parentId,
        priority: 1,
        scheduledFor: "today",
        completed: false,
        position: subtasks.length,
      });
      
      setNewSubtaskTitle("");
      setShowAddForm(false);
      
      toast({
        title: "Subtask added",
        description: "Your subtask has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subtask.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSubtask = async (subtaskId: number, completed: boolean) => {
    try {
      await updateTask.mutateAsync({ id: subtaskId, completed });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subtask.",
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

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading subtasks...</div>;
  }

  if (subtasks.length === 0 && !showAddForm) {
    return (
      <div className="mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="text-xs text-primary hover:underline h-auto p-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add subtask
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center space-x-2 text-sm">
          <Checkbox
            checked={subtask.completed}
            onCheckedChange={(checked) => handleToggleSubtask(subtask.id, !!checked)}
            className="w-3 h-3"
          />
          <span className={cn(
            "text-muted-foreground flex-1",
            subtask.completed && "line-through"
          )}>
            {subtask.title}
          </span>
          {subtask.estimatedTime && (
            <span className="text-xs text-muted-foreground ml-auto">
              {formatTime(subtask.estimatedTime)}
            </span>
          )}
        </div>
      ))}
      
      {showAddForm ? (
        <div className="flex items-center space-x-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask..."
            className="text-sm h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") {
                setShowAddForm(false);
                setNewSubtaskTitle("");
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || createTask.isPending}
            className="h-8"
          >
            Add
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="text-xs text-primary hover:underline h-auto p-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add subtask
        </Button>
      )}
    </div>
  );
}
