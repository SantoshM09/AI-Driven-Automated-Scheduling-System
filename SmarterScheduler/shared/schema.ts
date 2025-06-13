import { z } from "zod";

// MongoDB Schema Definitions
export const scheduleSchema = z.object({
  _id: z.string().optional(),
  college_time: z.object({
    startTime: z.string(),
    endTime: z.string(),
  }),
  break_periods: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  rooms: z.array(z.string()),
  subjects: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    time: z.number().optional(), // Additional time field
    no_of_classes_per_week: z.number(),
    faculty: z.array(z.object({
      id: z.string(),
      name: z.string(),
      availability: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })),
    })),
  })),
  created_at: z.string().optional(),
});

export const insertScheduleSchema = scheduleSchema.omit({
  _id: true,
  created_at: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;

// Detailed type definitions for the JSON structure
export interface CollegeTime {
  startTime: string;
  endTime: string;
}

export interface BreakPeriod {
  day: string;
  startTime: string;
  endTime: string;
}

export interface FacultyAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Faculty {
  id: string;
  name: string;
  availability: FacultyAvailability[];
}

export interface Subject {
  name: string;
  duration: number;
  no_of_classes_per_week: number;
  faculty: Faculty[];
}

export interface ScheduleData {
  college_time: CollegeTime;
  break_: BreakPeriod[];
  rooms: string[];
  subjects: Subject[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  subject?: string;
  faculty?: string;
  room?: string;
  isBreak?: boolean;
}

export interface DaySchedule {
  [day: string]: TimeSlot[];
}

export interface RoomSchedule {
  roomId: string;
  schedule: DaySchedule;
  utilization: number;
  conflicts: number;
}

export interface FacultySchedule {
  facultyId: string;
  name: string;
  schedule: DaySchedule;
  teachingHours: number;
  subjects: string[];
}

export interface ScheduleInsights {
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
