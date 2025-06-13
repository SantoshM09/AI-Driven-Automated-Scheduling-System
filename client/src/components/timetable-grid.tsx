import { Badge } from "@/components/ui/badge";
import { Coffee, Clock } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
  subject?: string;
  faculty?: string;
  room?: string;
  isBreak?: boolean;
}

interface TimetableGridProps {
  schedule: Record<string, TimeSlot[]>;
  showRooms?: boolean;
}

export default function TimetableGrid({ schedule, showRooms = false }: TimetableGridProps) {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  // Get all unique time slots
  const allTimeSlots = Object.values(schedule).flat();
  const uniqueTimeSlots = Array.from(
    new Set(allTimeSlots.map(slot => `${slot.startTime}-${slot.endTime}`))
  ).map(timeStr => {
    const [startTime, endTime] = timeStr.split('-');
    return { startTime, endTime };
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-100 border-blue-500 text-blue-900',
      'bg-green-100 border-green-500 text-green-900',
      'bg-purple-100 border-purple-500 text-purple-900',
      'bg-orange-100 border-orange-500 text-orange-900',
      'bg-red-100 border-red-500 text-red-900',
      'bg-teal-100 border-teal-500 text-teal-900',
      'bg-indigo-100 border-indigo-500 text-indigo-900',
      'bg-pink-100 border-pink-500 text-pink-900',
    ];
    
    const hash = subject.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getSlotForTime = (day: string, timeSlot: { startTime: string; endTime: string }) => {
    const daySchedule = schedule[day] || [];
    return daySchedule.find(slot => 
      slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header */}
        <div className="grid grid-cols-8 border-b bg-slate-50">
          <div className="p-4 font-medium text-slate-700 border-r">Time</div>
          {days.map(day => (
            <div key={day} className="p-4 font-medium text-slate-700 border-r text-center last:border-r-0">
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </div>
          ))}
        </div>
        
        {/* Time Slots */}
        {uniqueTimeSlots.map((timeSlot, index) => (
          <div key={index} className="grid grid-cols-8 border-b min-h-[60px]">
            <div className="p-4 font-medium text-slate-600 border-r bg-slate-50 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-slate-400" />
              {timeSlot.startTime} - {timeSlot.endTime}
            </div>
            {days.map(day => {
              const slot = getSlotForTime(day, timeSlot);
              
              if (slot?.isBreak) {
                return (
                  <div key={day} className="p-2 border-r bg-amber-50 last:border-r-0 flex items-center justify-center">
                    <div className="flex items-center text-amber-700 font-medium text-sm">
                      <Coffee className="h-4 w-4 mr-2" />
                      Break
                    </div>
                  </div>
                );
              }
              
              if (slot?.subject) {
                return (
                  <div key={day} className="p-2 border-r last:border-r-0">
                    <div className={`border-l-4 rounded p-3 h-full flex flex-col justify-center transition-all duration-200 hover:shadow-sm ${getSubjectColor(slot.subject)}`}>
                      <p className="font-medium text-sm mb-1">{slot.subject}</p>
                      <p className="text-xs opacity-80">
                        {slot.faculty}
                      </p>
                      {showRooms && slot.room && (
                        <p className="text-xs opacity-80 mt-1">
                          {slot.room}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={day} className="p-2 border-r last:border-r-0">
                  <div className="h-full flex items-center justify-center text-slate-300">
                    <span className="text-xs">Free</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
