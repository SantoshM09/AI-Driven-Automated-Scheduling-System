import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Search, Mail, BookOpen } from "lucide-react";
import TimetableGrid from "@/components/timetable-grid";
import FacultyCard from "@/components/faculty-card";

interface Faculty {
  id: string;
  name: string;
}

interface FacultySchedule {
  facultyId: string;
  name: string;
  schedule: any;
  teachingHours: number;
  subjects: string[];
}

export default function Faculty() {
  const [, params] = useRoute("/faculty/:id");
  const [selectedFaculty, setSelectedFaculty] = useState(params?.id || "");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: faculty } = useQuery<Faculty[]>({
    queryKey: ["/api/scheduler/faculty"],
  });

  const { data: facultySchedule, isLoading } = useQuery<FacultySchedule>({
    queryKey: ["/api/scheduler/faculty", selectedFaculty],
    enabled: !!selectedFaculty,
  });

  // Set default faculty if none selected
  if (!selectedFaculty && faculty && faculty.length > 0) {
    setSelectedFaculty(faculty[0].id);
  }

  const handleFacultyChange = (facultyId: string) => {
    setSelectedFaculty(facultyId);
  };

  const filteredFaculty = faculty?.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!faculty || faculty.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Faculty Data</h3>
          <p className="text-slate-600 mb-4">Upload a schedule configuration to view faculty schedules.</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Faculty Schedule</h2>
            <p className="text-slate-600">View individual faculty timetables and workload</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={selectedFaculty} onValueChange={handleFacultyChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {filteredFaculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Faculty Details */}
      {facultySchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{facultySchedule.name}</h3>
                    <p className="text-slate-600">Computer Science Department</p>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {facultySchedule.name.toLowerCase().replace(/\s+/g, '.').replace(/^dr\.|^prof\./, '')}@college.edu
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Subjects Teaching</p>
                    <div className="flex flex-wrap gap-2">
                      {facultySchedule.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Available Days</p>
                    <div className="flex flex-wrap gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Weekly Stats</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Teaching Hours</span>
                      <span className="font-medium">{facultySchedule.teachingHours}/20</span>
                    </div>
                    <Progress 
                      value={(facultySchedule.teachingHours / 20) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Subjects</span>
                      <span className="font-medium">{facultySchedule.subjects.length}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Conflicts</span>
                      <span className="font-medium text-red-600">0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Faculty Timetable */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Teaching Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : facultySchedule ? (
            <TimetableGrid schedule={facultySchedule.schedule} showRooms={true} />
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Select a faculty member to view their schedule</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
