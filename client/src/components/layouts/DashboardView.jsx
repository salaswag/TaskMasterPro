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
  
  const formatTime = (minutes) => {
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
            <div className="text-2xl font-bold">{formatTime(stats.timeSaved || 0)}</div>
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
            <div className="text-2xl font-bold">{stats.completedPriority || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.remainingPriority || 0} points remaining
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
                  {stats.todayCompleted || 0}/{stats.todayTotal || 0}
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
                <span className="font-medium">{stats.completedPriority || 0}</span>
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
                  <span className="font-medium">{formatTime(stats.estimatedTime || 0)}</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-medium">{formatTime(stats.actualTime || 0)}</span>
                </div>
                <Progress 
                  value={Math.min(timeAccuracy, 100)} 
                  className="h-2"
                />
              </div>
            </div>
            
            {(stats.timeSaved || 0) > 0 && (
              <div className="pt-2 text-sm text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                You saved {formatTime(stats.timeSaved)} by efficient planning!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}