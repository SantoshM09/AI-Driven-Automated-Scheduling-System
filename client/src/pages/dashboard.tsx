import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Book, PieChart, DoorOpen } from "lucide-react";
import RoomCard from "@/components/room-card";

interface DashboardStats {
  totalRooms: number;
  activeFaculty: number;
  weeklyClasses: number;
  avgUtilization: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/scheduler/stats"],
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery<string[]>({
    queryKey: ["/api/scheduler/rooms"],
  });

  const { data: roomSchedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/scheduler/rooms/all"],
    queryFn: async () => {
      if (!rooms || rooms.length === 0) return [];
      
      const schedulePromises = rooms.map(async (roomId) => {
        const response = await fetch(`/api/scheduler/rooms/${roomId}`);
        if (!response.ok) throw new Error(`Failed to fetch room ${roomId}`);
        return response.json();
      });

      return Promise.all(schedulePromises);
    },
    enabled: !!rooms && rooms.length > 0,
  });

  if (statsLoading || roomsLoading) {
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">AI-Driven Automated Scheduling System</h2>
        <p className="text-slate-600">Intelligent schedule generation with faculty constraints and room optimization</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Rooms</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalRooms || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DoorOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Faculty</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.activeFaculty || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Weekly Classes</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.weeklyClasses || 0}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <Book className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Utilization</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.avgUtilization ? `${Math.round(stats.avgUtilization)}%` : '0%'}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Room Overview</h3>
            {rooms && rooms.length === 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                No schedule data uploaded
              </Badge>
            )}
          </div>

          {rooms && rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((roomId) => {
                const roomSchedule = roomSchedules?.find((rs: any) => rs.roomId === roomId);
                return (
                  <RoomCard
                    key={roomId}
                    roomId={roomId}
                    utilization={roomSchedule?.utilization || 0}
                    conflicts={roomSchedule?.conflicts || 0}
                    status={roomSchedule?.utilization > 80 ? 'occupied' : 'available'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Schedule Data</h3>
              <p className="text-slate-600 mb-4">Upload a schedule configuration to view room information.</p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Schedule
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
