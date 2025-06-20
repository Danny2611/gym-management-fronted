export type AppointmentStatusType =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "missed"
  | "upcoming";

export interface ScheduleTime {
  endTime: string; // HH:MM format
  startTime: string; // HH:MM format
}
export interface Schedule {
  id: string;
  date: string;
  time?: ScheduleTime | null;
  location: string;
  package_name: string;
  notes?: string;
  status: AppointmentStatusType;
  trainer_name?: string | null;
  trainer_image?: string | null;
}

// Interface for combined upcoming schedule items for dashboard
export interface ScheduleItem {
  date: Date;
  timeStart: Date;
  timeEnd?: Date;
  location?: string;
  status: string;
  type: "workout" | "appointment";
  name?: string;
}
