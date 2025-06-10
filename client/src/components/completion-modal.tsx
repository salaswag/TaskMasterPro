import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";

interface CompletionModalProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionModal({ taskId, isOpen, onClose }: CompletionModalProps) {
  const { toast } = useToast();
  const completeTask = useCompleteTask();
  
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const handleComplete = async (withTime: boolean = true) => {
    if (!taskId) return;
    
    let actualTime: number | undefined;
    
    if (withTime) {
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      actualTime = h * 60 + m;
      
      if (actualTime <= 0) {
        toast({
          title: "Invalid time",
          description: "Please enter a valid time.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      await completeTask.mutateAsync({ id: taskId, actualTime });
      
      toast({
        title: "Task completed! 🎉",
        description: withTime ? "Time tracked successfully." : "Task marked as complete.",
      });
      
      setHours("");
      setMinutes("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Completed! 🎉</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            How long did this task actually take?
          </p>
          
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0"
            />
            <Input
              type="number"
              placeholder="Minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              min="0"
              max="59"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => handleComplete(false)}
              disabled={completeTask.isPending}
            >
              Skip
            </Button>
            <Button
              onClick={() => handleComplete(true)}
              disabled={completeTask.isPending}
            >
              Save Time
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
