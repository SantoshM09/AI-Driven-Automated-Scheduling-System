import { Schedule, InsertSchedule, RoomSchedule, FacultySchedule, ScheduleInsights } from "@shared/schema";
import { connectToDatabase, ScheduleModel } from "./database";

export interface IStorage {
  getSchedule(): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined>;
  getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined>;
  getInsights(): Promise<ScheduleInsights>;
  getAllRooms(): Promise<string[]>;
  getAllFaculty(): Promise<Array<{ id: string; name: string }>>;
}

export class MongoStorage implements IStorage {
  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    await connectToDatabase();
  }

  async getSchedule(): Promise<Schedule | undefined> {
    await connectToDatabase();
    const schedule = await ScheduleModel.findOne().sort({ created_at: -1 }).lean();
    if (!schedule) return undefined;
    
    return {
      _id: schedule._id.toString(),
      college_time: schedule.college_time || { startTime: '09:30', endTime: '16:30' },
      break_periods: schedule.break_periods || [],
      rooms: schedule.rooms || [],
      subjects: schedule.subjects || [],
      created_at: schedule.created_at?.toISOString(),
    };
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    await connectToDatabase();
    
    // Delete existing schedule and create new one
    await ScheduleModel.deleteMany({});
    
    const newSchedule = new ScheduleModel({
      ...insertSchedule,
      created_at: new Date(),
    });
    
    const savedSchedule = await newSchedule.save();
    
    return {
      _id: savedSchedule._id.toString(),
      college_time: savedSchedule.college_time || { startTime: '09:30', endTime: '16:30' },
      break_periods: savedSchedule.break_periods || [],
      rooms: savedSchedule.rooms || [],
      subjects: savedSchedule.subjects || [],
      created_at: savedSchedule.created_at?.toISOString(),
    };
  }

  async updateSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    await connectToDatabase();
    
    const existingSchedule = await ScheduleModel.findOne().sort({ created_at: -1 });
    if (!existingSchedule) {
      return this.createSchedule(insertSchedule);
    }
    
    const updatedSchedule = await ScheduleModel.findByIdAndUpdate(
      existingSchedule._id,
      { ...insertSchedule, created_at: new Date() },
      { new: true }
    );
    
    if (!updatedSchedule) {
      throw new Error('Failed to update schedule');
    }
    
    return {
      _id: updatedSchedule._id.toString(),
      college_time: updatedSchedule.college_time || { startTime: '09:30', endTime: '16:30' },
      break_periods: updatedSchedule.break_periods || [],
      rooms: updatedSchedule.rooms || [],
      subjects: updatedSchedule.subjects || [],
      created_at: updatedSchedule.created_at?.toISOString(),
    };
  }

  async getRoomSchedule(roomId: string): Promise<RoomSchedule | undefined> {
    const schedule = await this.getSchedule();
    if (!schedule) return undefined;

    const rooms = schedule.rooms;
    if (!rooms.includes(roomId)) return undefined;

    // Generate room schedule from schedule data
    const roomSchedule = this.generateRoomSchedule(roomId, schedule);
    return roomSchedule;
  }

  async getFacultySchedule(facultyId: string): Promise<FacultySchedule | undefined> {
    const schedule = await this.getSchedule();
    if (!schedule) return undefined;

    // Find faculty in subjects
    let facultyName = '';
    const subjects = schedule.subjects || [];
    
    for (const subject of subjects) {
      const faculty = subject.faculty?.find((f: any) => f.id === facultyId);
      if (faculty) {
        facultyName = faculty.name;
        break;
      }
    }

    if (!facultyName) return undefined;

    // Generate faculty schedule
    const facultySchedule = this.generateFacultySchedule(facultyId, facultyName, schedule);
    return facultySchedule;
  }

  async getInsights(): Promise<ScheduleInsights> {
    const schedule = await this.getSchedule();
    if (!schedule) {
      return {
        avgUtilization: 0,
        conflicts: 0,
        peakTime: 'N/A',
        activeFaculty: 0,
        roomUtilization: [],
        recommendations: []
      };
    }

    const rooms = schedule.rooms;
    const subjects = schedule.subjects || [];

    // Calculate insights
    const roomUtilization = await this.calculateRoomUtilization(rooms);
    const avgUtilization = roomUtilization.length > 0 
      ? roomUtilization.reduce((sum, room) => sum + room.utilization, 0) / roomUtilization.length 
      : 0;
    const conflicts = await this.detectConflicts();
    const activeFaculty = this.countActiveFaculty(subjects);
    const peakTime = this.calculatePeakTime(subjects);
    const recommendations = this.generateRecommendations(roomUtilization, subjects);

    return {
      avgUtilization: Math.round(avgUtilization * 100) / 100,
      conflicts,
      peakTime,
      activeFaculty,
      roomUtilization,
      recommendations
    };
  }

  async getAllRooms(): Promise<string[]> {
    const schedule = await this.getSchedule();
    if (!schedule) return [];
    return schedule.rooms;
  }

  async getAllFaculty(): Promise<Array<{ id: string; name: string }>> {
    const schedule = await this.getSchedule();
    if (!schedule) return [];
    
    const subjects = schedule.subjects || [];
    const faculty: Array<{ id: string; name: string }> = [];

    for (const subject of subjects) {
      if (subject.faculty) {
        for (const f of subject.faculty) {
          if (!faculty.find(existing => existing.id === f.id)) {
            faculty.push({ id: f.id, name: f.name });
          }
        }
      }
    }

    return faculty;
  }

  private generateRoomSchedule(roomId: string, scheduleData: any): RoomSchedule {
    const subjects = scheduleData.subjects || [];
    const collegeTime = scheduleData.college_time || { startTime: '09:30', endTime: '16:30' };
    const breakPeriods = scheduleData.break_ || [];

    const schedule: any = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: []
    };

    // Generate time slots based on college time
    const timeSlots = this.generateTimeSlots(collegeTime.startTime, collegeTime.endTime, 50);

    for (const day of Object.keys(schedule)) {
      schedule[day] = timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, breakPeriods)
      }));
    }

    // Assign subjects to time slots (simplified scheduling)
    for (const subject of subjects) {
      if (subject.faculty && subject.faculty.length > 0) {
        const faculty = subject.faculty[0];
        for (const availability of faculty.availability) {
          const day = availability.day;
          if (schedule[day]) {
            // Find suitable time slot
            const suitableSlot = schedule[day].find((slot: any) => 
              !slot.subject && !slot.isBreak && 
              this.isTimeInRange(slot.startTime, availability.startTime, availability.endTime)
            );
            
            if (suitableSlot) {
              suitableSlot.subject = subject.name;
              suitableSlot.faculty = faculty.name;
              suitableSlot.room = roomId;
            }
          }
        }
      }
    }

    const utilization = this.calculateUtilization(schedule);
    const conflicts = this.countConflicts(schedule);

    return {
      roomId,
      schedule,
      utilization,
      conflicts
    };
  }

  private generateFacultySchedule(facultyId: string, facultyName: string, scheduleData: any): FacultySchedule {
    const subjects = scheduleData.subjects || [];
    const collegeTime = scheduleData.college_time || { startTime: '09:30', endTime: '16:30' };
    const breakPeriods = scheduleData.break_ || [];

    const schedule: any = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: []
    };

    // Generate time slots
    const timeSlots = this.generateTimeSlots(collegeTime.startTime, collegeTime.endTime, 50);

    for (const day of Object.keys(schedule)) {
      schedule[day] = timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: this.isBreakTime(slot.startTime, slot.endTime, breakPeriods)
      }));
    }

    let teachingHours = 0;
    const facultySubjects: string[] = [];

    // Assign subjects taught by this faculty
    for (const subject of subjects) {
      if (subject.faculty) {
        const faculty = subject.faculty.find((f: any) => f.id === facultyId);
        if (faculty) {
          facultySubjects.push(subject.name);
          
          for (const availability of faculty.availability) {
            const day = availability.day;
            if (schedule[day]) {
              const suitableSlot = schedule[day].find((slot: any) => 
                !slot.subject && !slot.isBreak && 
                this.isTimeInRange(slot.startTime, availability.startTime, availability.endTime)
              );
              
              if (suitableSlot) {
                suitableSlot.subject = subject.name;
                suitableSlot.faculty = faculty.name;
                suitableSlot.room = 'TBD'; // Room assignment would be determined by scheduling algorithm
                teachingHours += subject.duration / 60; // Convert minutes to hours
              }
            }
          }
        }
      }
    }

    return {
      facultyId,
      name: facultyName,
      schedule,
      teachingHours: Math.round(teachingHours * 100) / 100,
      subjects: facultySubjects
    };
  }

  private generateTimeSlots(startTime: string, endTime: string, duration: number) {
    const slots = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    for (let current = start; current < end; current += duration) {
      slots.push({
        startTime: this.minutesToTime(current),
        endTime: this.minutesToTime(current + duration)
      });
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private isBreakTime(startTime: string, endTime: string, breakPeriods: any[]): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    return breakPeriods.some(breakPeriod => {
      const breakStart = this.timeToMinutes(breakPeriod.startTime);
      const breakEnd = this.timeToMinutes(breakPeriod.endTime);
      return start >= breakStart && end <= breakEnd;
    });
  }

  private isTimeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(rangeStart);
    const endMinutes = this.timeToMinutes(rangeEnd);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  private calculateUtilization(schedule: any): number {
    let totalSlots = 0;
    let occupiedSlots = 0;

    for (const day of Object.keys(schedule)) {
      for (const slot of schedule[day]) {
        if (!slot.isBreak) {
          totalSlots++;
          if (slot.subject) {
            occupiedSlots++;
          }
        }
      }
    }

    return totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
  }

  private countConflicts(schedule: any): number {
    // Simplified conflict detection
    return 0;
  }

  private async calculateRoomUtilization(rooms: string[]): Promise<Array<{ roomId: string; utilization: number }>> {
    const roomUtilization = [];
    
    for (const roomId of rooms) {
      const roomSchedule = await this.getRoomSchedule(roomId);
      roomUtilization.push({
        roomId,
        utilization: roomSchedule?.utilization || 0
      });
    }

    return roomUtilization;
  }

  private async detectConflicts(): Promise<number> {
    // Simplified conflict detection
    return 0;
  }

  private countActiveFaculty(subjects: any[]): number {
    const facultyIds = new Set();
    
    for (const subject of subjects) {
      if (subject.faculty) {
        for (const faculty of subject.faculty) {
          facultyIds.add(faculty.id);
        }
      }
    }

    return facultyIds.size;
  }

  private calculatePeakTime(subjects: any[]): string {
    // Simplified peak time calculation
    return '10:00-12:00';
  }

  private generateRecommendations(roomUtilization: any[], subjects: any[]): any[] {
    const recommendations = [];

    // Check for underutilized rooms
    const underutilizedRooms = roomUtilization.filter(room => room.utilization < 50);
    if (underutilizedRooms.length > 0) {
      recommendations.push({
        type: 'efficiency',
        title: 'Underutilized Rooms',
        description: `${underutilizedRooms.length} rooms have low utilization. Consider reassigning classes or reviewing schedule.`
      });
    }

    // Check for optimization opportunities
    const highUtilizationRooms = roomUtilization.filter(room => room.utilization > 90);
    if (highUtilizationRooms.length > 0) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Peak Hours',
        description: 'Some rooms are overutilized. Consider redistributing classes to balance load.'
      });
    }

    return recommendations;
  }
}

export const storage = new MongoStorage();
