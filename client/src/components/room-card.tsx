import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

interface RoomCardProps {
  roomId: string;
  utilization: number;
  conflicts: number;
  status: 'available' | 'occupied' | 'break';
  capacity?: number;
  nextClass?: string;
}

export default function RoomCard({ 
  roomId, 
  utilization, 
  conflicts, 
  status, 
  capacity = 40,
  nextClass = "N/A"
}: RoomCardProps) {
  const [, setLocation] = useLocation();

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Occupied</Badge>;
      case 'break':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Break</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUtilizationColor = () => {
    if (utilization >= 80) return "text-green-600";
    if (utilization >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (utilization >= 80) return "bg-green-500";
    if (utilization >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleClick = () => {
    setLocation(`/rooms/${roomId}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:border-blue-500 transition-all duration-200 hover:shadow-md"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900">Room {roomId}</h4>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Capacity:</span>
            <span className="font-medium">{capacity} students</span>
          </div>
          <div className="flex justify-between">
            <span>Utilization:</span>
            <span className={`font-medium ${getUtilizationColor()}`}>
              {Math.round(utilization)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Next Class:</span>
            <span className="font-medium">{nextClass}</span>
          </div>
          {conflicts > 0 && (
            <div className="flex justify-between">
              <span>Conflicts:</span>
              <span className="font-medium text-red-600">{conflicts}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <Progress 
            value={utilization} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
