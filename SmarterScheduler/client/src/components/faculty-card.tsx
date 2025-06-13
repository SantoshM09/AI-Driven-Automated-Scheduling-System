import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Mail, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

interface FacultyCardProps {
  facultyId: string;
  name: string;
  department?: string;
  subjects: string[];
  teachingHours: number;
  maxHours?: number;
  conflicts?: number;
}

export default function FacultyCard({ 
  facultyId, 
  name, 
  department = "Computer Science Department",
  subjects, 
  teachingHours, 
  maxHours = 20,
  conflicts = 0
}: FacultyCardProps) {
  const [, setLocation] = useLocation();

  const utilizationPercentage = (teachingHours / maxHours) * 100;

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 90) return "text-green-600";
    if (utilizationPercentage >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const handleClick = () => {
    setLocation(`/faculty/${facultyId}`);
  };

  const getEmailFromName = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/^dr\.|^prof\./, '')
      + '@college.edu';
  };

  return (
    <Card 
      className="cursor-pointer hover:border-blue-500 transition-all duration-200 hover:shadow-md"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
            <p className="text-slate-600 text-sm">{department}</p>
            <p className="text-slate-500 text-xs flex items-center mt-1">
              <Mail className="h-3 w-3 mr-1" />
              {getEmailFromName(name)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Subjects Teaching</p>
            <div className="flex flex-wrap gap-2">
              {subjects.slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {subject}
                </Badge>
              ))}
              {subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Teaching Hours</span>
              <span className={`font-medium ${getUtilizationColor()}`}>
                {teachingHours}/{maxHours}
              </span>
            </div>
            <Progress 
              value={utilizationPercentage} 
              className="h-2"
            />
          </div>

          {conflicts > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Conflicts</span>
              <span className="font-medium text-red-600">{conflicts}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
