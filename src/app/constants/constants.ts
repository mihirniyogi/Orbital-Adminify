// LOGIN
export const MAX_AGE = 60 * 60; // 60 minutes
export const JWT_TOKEN = "JWT_TOKEN";
export const STAFF_SECRET = "secret";

// PASSWORD RESET
export const RESET_TIMER_DURATION = 30000; // 30 seconds

// TICKETS
export const REASONS_ARRAY = [
  "Absence",
  "Exam clash",
  "Schedule change",
  "Academic",
  "Others",
] as const;

export const STATUS_ARRAY = ["Unassigned", "In review", "Closed"] as const;
export type Reason = (typeof REASONS_ARRAY)[number];
export type Status = (typeof STATUS_ARRAY)[number];
export const STATUS_COLOUR_MAP: Record<Status, string> = {
  Unassigned: "bg-blue-300",
  "In review": "bg-yellow-300",
  Closed: "bg-green-400",
};
export type Ticket = {
  "Ticket ID": string;
  Created: Date;
  Reason: Reason;
  Description: string;
  Status: Status;
  Course: string;
  Student: string;
  Assigned?: string;
  Reply: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
};

// Local storage keys
export const RESET_TIMER_KEY = "endTime";
export const STUDENT_COURSES_KEY = "studentCourses";
export const TA_COURSES_KEY = "taCourses";
export const PROF_COURSES_KEY = "profCourses";
export const TICKETS_KEY = "tickets";
export const TATICKETS_KEY = "tatickets";
