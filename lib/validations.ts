import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  instituteCode: z
    .string()
    .min(3, 'Institute code must be at least 3 characters')
    .max(20, 'Institute code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Institute code can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  instituteCode: z
    .string()
    .min(3, 'Institute code must be at least 3 characters')
    .max(20, 'Institute code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Institute code can only contain letters, numbers, underscores, and hyphens'),
  role: z.enum(['TEACHER', 'STUDENT', 'PARENT'], {
    required_error: 'Please select a role'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Institute schemas
export const instituteSchema = z.object({
  name: z
    .string()
    .min(2, 'Institute name must be at least 2 characters')
    .max(100, 'Institute name must be less than 100 characters'),
  code: z
    .string()
    .min(3, 'Institute code must be at least 3 characters')
    .max(20, 'Institute code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Institute code can only contain letters, numbers, underscores, and hyphens'),
  domain: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Domain can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  logo: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional(),
});

// AI Homework Generation schema
export const aiHomeworkSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(50, 'Subject must be less than 50 characters'),
  topic: z
    .string()
    .min(1, 'Topic is required')
    .max(100, 'Topic must be less than 100 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: 'Please select a difficulty level'
  }),
  numQuestions: z
    .number()
    .min(1, 'Must have at least 1 question')
    .max(20, 'Cannot have more than 20 questions'),
  questionTypes: z
    .array(z.enum(['mcq', 'short-answer', 'essay']))
    .min(1, 'Please select at least one question type'),
});

// Class schemas
export const classSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(50, 'Subject must be less than 50 characters'),
  grade: z
    .string()
    .min(1, 'Grade is required')
    .max(20, 'Grade must be less than 20 characters'),
  maxStudents: z
    .number()
    .min(1, 'Maximum students must be at least 1')
    .max(200, 'Maximum students cannot exceed 200')
    .optional(),
});

// Student schemas
export const studentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  rollNumber: z
    .string()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number must be less than 20 characters'),
  grade: z
    .string()
    .min(1, 'Grade is required')
    .max(20, 'Grade must be less than 20 characters'),
  parentEmail: z
    .string()
    .email('Please enter a valid parent email address')
    .optional(),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
});

// Attendance schemas
export const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  status: z.enum(['present', 'absent', 'late'], {
    required_error: 'Attendance status is required'
  }),
  date: z.string().min(1, 'Date is required'),
  notes: z
    .string()
    .max(200, 'Notes must be less than 200 characters')
    .optional(),
});

// Homework schemas
export const homeworkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  classId: z.string().min(1, 'Class is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  instructions: z
    .string()
    .max(2000, 'Instructions must be less than 2000 characters')
    .optional(),
  attachments: z
    .array(z.string().url('Please enter valid URLs'))
    .optional(),
});

// User profile schemas
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
  bio: z
    .string()
    .max(300, 'Bio must be less than 300 characters')
    .optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InstituteInput = z.infer<typeof instituteSchema>;
export type AiHomeworkInput = z.infer<typeof aiHomeworkSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type HomeworkInput = z.infer<typeof homeworkSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;