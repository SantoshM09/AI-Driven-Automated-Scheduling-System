import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Users, 
  Lightbulb,
  Watch,
  CheckCircle,
  CircleAlert,
  BarChart3
} from "lucide-react";
import InsightsCard from "@/components/insights-card";

interface ScheduleInsights {
  avgUtilization: number;
  conflicts: number;
  peakTime: string;
  activeFaculty: number;
  roomUtilization: Array<{
    roomId: string;
    utilization: number;
  }>;
  recommendations: Array<{
    type: 'optimization' | 'workload' | 'efficiency' | 'conflict';
    title: string;
    description: string;
  }>;
}

export default function Insights() {
  const { data: insights, isLoading } = useQuery<ScheduleInsights>({
    queryKey: ["/api/scheduler/insights"],
  });

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
              <div className="h-12 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!insights) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Insights Available</h3>
          <p className="text-slate-600 mb-4">Upload a schedule configuration to view analytics and insights.</p>
          <a
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Schedule
          </a>
        </div>
      </main>
    );
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-green-600";
    if (utilization >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 80) return "bg-green-500";
    if (utilization >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'workload':
        return <Watch className="h-4 w-4 text-amber-600" />;
      case 'efficiency':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'conflict':
        return <CircleAlert className="h-4 w-4 text-red-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRecommendationBgColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return "bg-blue-50 border-blue-500";
      case 'workload':
        return "bg-amber-50 border-amber-500";
      case 'efficiency':
        return "bg-green-50 border-green-500";
      case 'conflict':
        return "bg-red-50 border-red-500";
      default:
        return "bg-blue-50 border-blue-500";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Insights & Analytics</h2>
        <p className="text-slate-600">Intelligent analysis of scheduling patterns and recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                +5.2%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {insights.avgUtilization.toFixed(1)}%
            </h3>
            <p className="text-sm text-slate-600">Average Room Utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <Badge variant="outline" className="text-red-600 border-red-600">
                {insights.conflicts > 0 ? '+' : ''}
                {insights.conflicts}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{insights.conflicts}</h3>
            <p className="text-sm text-slate-600">Schedule Conflicts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Peak Time
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{insights.peakTime}</h3>
            <p className="text-sm text-slate-600">Highest Usage Period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                Active
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{insights.activeFaculty}</h3>
            <p className="text-sm text-slate-600">Faculty Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Room Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Room Utilization Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.roomUtilization.map((room) => (
                <div key={room.roomId} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getUtilizationBgColor(room.utilization)}`}></div>
                    <span className="font-medium text-slate-700">Room {room.roomId}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUtilizationBgColor(room.utilization)}`}
                        style={{ width: `${room.utilization}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium w-12 ${getUtilizationColor(room.utilization)}`}>
                      {Math.round(room.utilization)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, index) => (
                  <Alert key={index} className={`border-l-4 ${getRecommendationBgColor(rec.type)}`}>
                    <div className="flex items-start">
                      {getRecommendationIcon(rec.type)}
                      <div className="ml-3">
                        <h4 className="font-medium text-slate-900">{rec.title}</h4>
                        <AlertDescription className="mt-1">
                          {rec.description}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-slate-600">No immediate recommendations. Your schedule is well optimized!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              // Mock data for daily patterns
              const classCount = Math.floor(Math.random() * 10) + 15;
              const utilization = Math.floor(Math.random() * 40) + 60;
              
              return (
                <div key={day} className="text-center">
                  <h4 className="font-medium text-slate-700 mb-2">{day}</h4>
                  <div className="bg-slate-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{classCount}</div>
                    <div className="text-xs text-slate-600 mb-2">Classes</div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${getUtilizationBgColor(utilization)}`}
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
