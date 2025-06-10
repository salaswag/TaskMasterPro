import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { useCreateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function TaskForm() {
  const { toast } = useToast();
  const createTask = useCreateTask();
  
  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: 5,
      estimatedTime: 30,
      scheduledFor: "today",
      completed: false,
      position: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      await createTask.mutateAsync(data);
      form.reset();
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg shadow-sm p-6 mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Add a new task..."
                    {...field}
                    className="w-full text-lg p-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-6 flex-wrap lg:flex-nowrap items-end">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="min-w-[200px]">
                  <FormLabel className="text-sm font-semibold">
                    Priority: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low (1)</span>
                    <span>High (10)</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => {
                const formatTime = (minutes) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
                };
                
                return (
                  <FormItem className="min-w-[200px]">
                    <FormLabel className="text-sm font-semibold">
                      Estimated Time: {formatTime(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={300}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5m</span>
                      <span>5h</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <Button type="submit" disabled={createTask.isPending} className="h-10">
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}