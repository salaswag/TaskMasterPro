import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTaskStats } from "@/hooks/use-tasks";
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Lightbulb
} from "lucide-react";

export function DashboardView() {
  const { data: stats, isLoading } = useTaskStats();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const todayCompletionRate = stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0;
  const timeAccuracy = stats.estimatedTime > 0 ? ((stats.actualTime / stats.estimatedTime) * 100) : 0;
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.remaining} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.timeSaved)}</div>
            <p className="text-xs text-muted-foreground">
              vs. estimated time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPriority}</div>
            <p className="text-xs text-muted-foreground">
              {stats.remainingPriority} points remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Progress
            </CardTitle>
            <CardDescription>
              Your daily task completion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-medium">
                  {stats.todayCompleted}/{stats.todayTotal}
                </span>
              </div>
              <Progress value={todayCompletionRate} />
            </div>
            
            <div className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{todayCompletionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority Points Done</span>
                <span className="font-medium">{stats.completedPriority}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Time Analysis
            </CardTitle>
            <CardDescription>
              Estimated vs actual time tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated</span>
                  <span className="font-medium">{formatTime(stats.estimatedTime)}</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-medium">{formatTime(stats.actualTime)}</span>
                </div>
                <Progress 
                  value={Math.min(timeAccuracy, 100)} 
                  className="h-2"
                />
              </div>
            </div>
            
            {stats.timeSaved > 0 && (
              <div className="pt-2 text-sm text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                You saved {formatTime(stats.timeSaved)} by efficient planning!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completionRate >= 70 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Great Progress!</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  You've completed {completionRate.toFixed(0)}% of your tasks
                </p>
              </div>
            )}
            
            {timeAccuracy < 100 && stats.timeSaved > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Time Efficiency</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Your estimates are {(100 - timeAccuracy).toFixed(0)}% higher than actual time
                </p>
              </div>
            )}
            
            {stats.remainingPriority > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Priority Focus</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.remainingPriority} priority points remaining to complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasks Today</span>
              <span className="font-semibold">{stats.todayCompleted}/{stats.todayTotal}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Priority Points</span>
              <span className="font-semibold">{stats.completedPriority}/{stats.totalPriority}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Time Spent</span>
              <span className="font-semibold">{formatTime(stats.actualTime)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Task Priority</span>
              <span className="font-semibold">
                {stats.total > 0 ? (stats.totalPriority / stats.total).toFixed(1) : "0"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
