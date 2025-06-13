import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  return time;
}

export function calculateUtilization(occupied: number, total: number): number {
  return total > 0 ? (occupied / total) * 100 : 0;
}

export function getUtilizationStatus(utilization: number): 'low' | 'medium' | 'high' {
  if (utilization < 50) return 'low';
  if (utilization < 80) return 'medium';
  return 'high';
}

export function getUtilizationColor(utilization: number): string {
  const status = getUtilizationStatus(utilization);
  switch (status) {
    case 'low':
      return 'text-red-600';
    case 'medium':
      return 'text-amber-600';
    case 'high':
      return 'text-green-600';
    default:
      return 'text-slate-600';
  }
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeMinutes = parseTimeToMinutes(time);
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number): Array<{startTime: string, endTime: string}> {
  const slots = [];
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  for (let current = start; current < end; current += duration) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration)
    });
  }

  return slots;
}

export function validateScheduleJSON(json: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  const requiredFields = ['college_time', 'break_', 'rooms', 'subjects'];
  for (const field of requiredFields) {
    if (!json[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate college_time
  if (json.college_time) {
    if (!json.college_time.startTime || !json.college_time.endTime) {
      errors.push('college_time must have startTime and endTime');
    }
  }

  // Validate subjects
  if (json.subjects && Array.isArray(json.subjects)) {
    json.subjects.forEach((subject: any, index: number) => {
      if (!subject.name) {
        errors.push(`Subject at index ${index} is missing name`);
      }
      if (!subject.duration) {
        errors.push(`Subject at index ${index} is missing duration`);
      }
      if (!subject.no_of_classes_per_week) {
        errors.push(`Subject at index ${index} is missing no_of_classes_per_week`);
      }
      if (!subject.faculty || !Array.isArray(subject.faculty) || subject.faculty.length === 0) {
        errors.push(`Subject at index ${index} is missing faculty`);
      }
    });
  } else if (json.subjects) {
    errors.push('subjects must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
