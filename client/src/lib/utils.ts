import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
}

export function getPriorityColor(priority: number): string {
  if (priority >= 8) return "bg-red-500";
  if (priority >= 6) return "bg-orange-500";
  if (priority >= 4) return "bg-yellow-500";
  return "bg-green-500";
}

export function getScheduleBadgeColor(scheduledFor: string): string {
  switch (scheduledFor) {
    case "today":
      return "bg-blue-50 text-blue-700";
    case "tomorrow":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}
