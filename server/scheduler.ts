import { Schedule } from "@shared/schema";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  room: string;
  duration: number;
}

interface Constraint {
  facultyId: string;
  availableSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

export class AIScheduler {
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private isTimeSlotAvailable(
    schedule: TimeSlot[],
    day: string,
    startTime: string,
    endTime: string,
    room: string
  ): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return !schedule.some(slot => {
      if (slot.day !== day || slot.room !== room) return false;
      
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);
      
      return (startMinutes < slotEnd && endMinutes > slotStart);
    });
  }

  private isFacultyAvailable(
    schedule: TimeSlot[],
    facultyId: string,
    day: string,
    startTime: string,
    endTime: string
  ): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return !schedule.some(slot => {
      if (slot.day !== day || slot.faculty !== facultyId) return false;
      
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);
      
      return (startMinutes < slotEnd && endMinutes > slotStart);
    });
  }

  private isWithinFacultyAvailability(
    facultyAvailability: Array<{ day: string; startTime: string; endTime: string }>,
    day: string,
    startTime: string,
    endTime: string
  ): boolean {
    const availability = facultyAvailability.find(avail => avail.day === day);
    if (!availability) return false;

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const availStart = this.timeToMinutes(availability.startTime);
    const availEnd = this.timeToMinutes(availability.endTime);

    return startMinutes >= availStart && endMinutes <= availEnd;
  }

  private isBreakTime(
    breakPeriods: Array<{ day: string; startTime: string; endTime: string }>,
    day: string,
    startTime: string,
    endTime: string
  ): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return breakPeriods.some(breakPeriod => {
      if (breakPeriod.day !== 'ALL_DAYS' && breakPeriod.day !== day) return false;
      
      const breakStart = this.timeToMinutes(breakPeriod.startTime);
      const breakEnd = this.timeToMinutes(breakPeriod.endTime);
      
      return (startMinutes < breakEnd && endMinutes > breakStart);
    });
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number
  ): Array<{ startTime: string; endTime: string }> {
    const slots = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    for (let current = start; current + duration <= end; current += duration) {
      slots.push({
        startTime: this.minutesToTime(current),
        endTime: this.minutesToTime(current + duration)
      });
    }

    return slots;
  }

  public generateOptimalSchedule(scheduleData: any): { 
    success: boolean; 
    schedule?: any; 
    conflicts?: string[];
    message?: string;
  } {
    try {
      const { college_time, break_, rooms, subjects } = scheduleData;
      const schedule: TimeSlot[] = [];
      const conflicts: string[] = [];
      const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

      // Generate possible time slots
      const possibleSlots = this.generateTimeSlots(
        college_time.startTime,
        college_time.endTime,
        50 // minimum slot duration
      );

      // Process each subject
      for (const subject of subjects) {
        const classesScheduled = new Map();
        const targetClasses = subject.no_of_classes_per_week;
        
        for (const faculty of subject.faculty) {
          let scheduledForThisFaculty = 0;
          
          // Try to schedule classes for this faculty
          for (const day of days) {
            if (scheduledForThisFaculty >= targetClasses) break;
            
            // Check if faculty is available on this day
            const facultyAvailable = faculty.availability.some((avail: any) => avail.day === day);
            if (!facultyAvailable) continue;

            // Find available time slots for this day
            for (const slot of possibleSlots) {
              if (scheduledForThisFaculty >= targetClasses) break;
              
              const slotEndTime = this.minutesToTime(
                this.timeToMinutes(slot.startTime) + (subject.duration || subject.time || 50)
              );

              // Check all constraints
              const withinAvailability = this.isWithinFacultyAvailability(
                faculty.availability,
                day,
                slot.startTime,
                slotEndTime
              );

              const notBreakTime = !this.isBreakTime(
                break_,
                day,
                slot.startTime,
                slotEndTime
              );

              if (!withinAvailability || !notBreakTime) continue;

              // Try to find an available room
              let roomAssigned = false;
              for (const room of rooms) {
                const roomAvailable = this.isTimeSlotAvailable(
                  schedule,
                  day,
                  slot.startTime,
                  slotEndTime,
                  room
                );

                const facultyNotBusy = this.isFacultyAvailable(
                  schedule,
                  faculty.id,
                  day,
                  slot.startTime,
                  slotEndTime
                );

                if (roomAvailable && facultyNotBusy) {
                  schedule.push({
                    day,
                    startTime: slot.startTime,
                    endTime: slotEndTime,
                    subject: subject.name,
                    faculty: faculty.name,
                    room,
                    duration: subject.duration || subject.time || 50
                  });

                  scheduledForThisFaculty++;
                  roomAssigned = true;
                  break;
                }
              }

              if (!roomAssigned) {
                conflicts.push(
                  `Cannot schedule ${subject.name} with ${faculty.name} on ${day} at ${slot.startTime} - no available room`
                );
              }
            }
          }

          // Check if we scheduled enough classes
          if (scheduledForThisFaculty < targetClasses) {
            conflicts.push(
              `Only scheduled ${scheduledForThisFaculty}/${targetClasses} classes for ${subject.name} with ${faculty.name}`
            );
          }
        }
      }

      // Convert schedule to the expected format
      const formattedSchedule = this.formatScheduleOutput(schedule, days);

      return {
        success: true,
        schedule: formattedSchedule,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        message: conflicts.length > 0 
          ? `Schedule generated with ${conflicts.length} conflicts` 
          : 'Schedule generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: `Error generating schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private formatScheduleOutput(schedule: TimeSlot[], days: string[]) {
    const formatted: any = {};
    
    for (const day of days) {
      formatted[day] = schedule
        .filter(slot => slot.day === day)
        .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime))
        .map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          subject: slot.subject,
          faculty: slot.faculty,
          room: slot.room,
          duration: slot.duration
        }));
    }

    return formatted;
  }

  public calculateScheduleMetrics(schedule: any) {
    const totalSlots = Object.values(schedule).flat().length;
    const occupiedSlots = Object.values(schedule).flat().filter((slot: any) => slot.subject).length;
    const utilization = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    // Calculate room utilization
    const roomStats = new Map();
    Object.values(schedule).flat().forEach((slot: any) => {
      if (slot.room) {
        if (!roomStats.has(slot.room)) {
          roomStats.set(slot.room, { total: 0, occupied: 0 });
        }
        const stats = roomStats.get(slot.room);
        stats.total++;
        if (slot.subject) stats.occupied++;
      }
    });

    const roomUtilization = Array.from(roomStats.entries()).map(([room, stats]) => ({
      roomId: room,
      utilization: (stats.occupied / stats.total) * 100
    }));

    return {
      overallUtilization: utilization,
      roomUtilization,
      totalSlots,
      occupiedSlots
    };
  }
}