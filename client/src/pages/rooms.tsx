import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Download, AlertTriangle } from "lucide-react";
import TimetableGrid from "@/components/timetable-grid";
import { useState } from "react";

interface RoomSchedule {
  roomId: string;
  schedule: any;
  utilization: number;
  conflicts: number;
}

export default function Rooms() {
  const [, params] = useRoute("/rooms/:id");
  const [selectedRoom, setSelectedRoom] = useState(params?.id || "");

  const { data: rooms } = useQuery<string[]>({
    queryKey: ["/api/scheduler/rooms"],
  });

  const { data: roomSchedule, isLoading } = useQuery<RoomSchedule>({
    queryKey: ["/api/scheduler/rooms", selectedRoom],
    enabled: !!selectedRoom,
  });

  // Set default room if none selected
  if (!selectedRoom && rooms && rooms.length > 0) {
    setSelectedRoom(rooms[0]);
  }

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Exporting PDF for room:", selectedRoom);
  };

  if (!rooms || rooms.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <DoorOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Rooms Available</h3>
          <p className="text-slate-600 mb-4">Upload a schedule configuration to view room schedules.</p>
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Room Schedule</h2>
            <p className="text-slate-600">Weekly timetable for selected room</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedRoom} onValueChange={handleRoomChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((roomId) => (
                  <SelectItem key={roomId} value={roomId}>
                    Room {roomId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Room Details Card */}
      {roomSchedule && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <DoorOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Room {roomSchedule.roomId}</h3>
                  <p className="text-slate-600">Ground Floor • Projector Available</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{Math.round(roomSchedule.utilization)}%</p>
                  <p className="text-sm text-slate-600">Utilization</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{roomSchedule.conflicts}</p>
                  <p className="text-sm text-slate-600">Conflicts</p>
                </div>
                {roomSchedule.conflicts > 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Conflicts
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : roomSchedule ? (
            <TimetableGrid schedule={roomSchedule.schedule} />
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Select a room to view its schedule</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
