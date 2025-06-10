import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCompleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";

export function CompletionModal({ taskId, estimatedTime, isOpen, onClose }) {
  const { toast } = useToast();
  const completeTask = useCompleteTask();
  
  const [actualTime, setActualTime] = useState(estimatedTime || 30);

  const handleComplete = async (withTime = true) => {
    if (!taskId) return;
    
    const timeToSave = withTime ? actualTime : undefined;
    
    try {
      await completeTask.mutateAsync({ id: taskId, actualTime: timeToSave });
      
      toast({
        title: "Task completed! 🎉",
        description: withTime ? "Time tracked successfully." : "Task marked as complete.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Completed! 🎉</DialogTitle>
          <DialogDescription>
            How long did this task actually take?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(actualTime)}
              </div>
              <p className="text-sm text-muted-foreground">
                {estimatedTime ? `Estimated: ${formatTime(estimatedTime)}` : "No estimate"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Slider
                value={[actualTime]}
                onValueChange={(value) => setActualTime(value[0])}
                max={Math.max(300, (estimatedTime || 60) * 2)}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5m</span>
                <span>{Math.max(300, (estimatedTime || 60) * 2)}m</span>
              </div>
            </div>
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