import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUpdateTask, useDeleteTask, useMoveToTomorrow } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Edit, Trash, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskTable({ tasks, onComplete }) {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const moveToTomorrow = useMoveToTomorrow();

  const getPriorityColor = (priority) => {
    if (priority >= 8) return "bg-red-500";
    if (priority >= 6) return "bg-orange-500";
    if (priority >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatTime = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  };

  const handleComplete = (taskId, checked) => {
    if (checked) {
      onComplete(taskId);
    } else {
      updateTask.mutate({ id: taskId, completed: false });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask.mutateAsync(taskId);
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

  const handleMoveToTomorrow = async (taskId) => {
    try {
      await moveToTomorrow.mutateAsync(taskId);
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

  return (
    <div className="bg-background border border-border rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-12">Priority</TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="w-32">Estimated Time</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id} 
              className={cn(
                "hover:bg-muted/50",
                task.completed && "opacity-60"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => handleComplete(task.id, checked)}
                />
              </TableCell>
              
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full",
                    getPriorityColor(task.priority)
                  )}
                >
                  {task.priority}
                </span>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <h3 className={cn(
                    "text-sm font-semibold text-foreground",
                    task.completed && "line-through"
                  )}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {task.completed && task.actualTime ? (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-green-500" />
                    <span className="text-sm font-bold text-green-600">
                      {formatTime(task.actualTime)}
                    </span>
                    <span className="text-xs text-muted-foreground">actual</span>
                  </div>
                ) : task.estimatedTime ? (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm font-bold">
                      {formatTime(task.estimatedTime)}
                    </span>
                    <span className="text-xs text-muted-foreground">est.</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No estimate</span>
                )}
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant={task.scheduledFor === "today" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {task.scheduledFor === "today" ? "Today" : 
                   task.scheduledFor === "tomorrow" ? "Tomorrow" : "Later"}
                </Badge>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {!task.completed && (
                      <DropdownMenuItem onClick={() => handleMoveToTomorrow(task.id)}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Move to Tomorrow
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}