export type UserRole = 'admin' | 'learner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  mustChangePassword?: boolean;
  temporaryPasswordActive?: boolean;
  accountActive: boolean;
  // Learning enrollment & duration
  assignedTrackIds: string[];
  enrolledCourseIds: string[];
  excludedCourseIds?: string[]; // Specific courses excluded from assigned tracks
  accessExpiresAt?: string; // ISO date string or undefined for unlimited
}

export interface LearningTrack {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  courseIds: string[];
  isPublished: boolean;
  isArchived: boolean;
  estimatedHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  updatedAt: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  type: 'doc' | 'github' | 'article' | 'video' | 'download';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoEmbedUrl?: string; // YouTube, Vimeo, or MP4 URL
  notesMarkdown: string;
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  resources: ResourceLink[];
  order: number;
}

export interface WeekModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  lessons: Lesson[];
  taskId?: string; // Associated assignment for this week
  unlockRequiresTaskApproval: boolean; // Next week locked until this week's task is approved!
}

export interface Course {
  id: string;
  trackId: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  instructorTitle: string;
  isPublished: boolean;
  isArchived: boolean;
  status: 'draft' | 'published' | 'archived';
  weeks: WeekModule[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  courseId: string;
  weekId: string;
  title: string;
  description: string;
  instructions: string;
  deadline?: string; // ISO date string, optional
  maxMarks: number;
  assignedToTrackId?: string;
  assignedToCourseId?: string;
  assignedInternIds?: string[]; // Empty means all enrolled
  allowLateSubmission?: boolean;
  createdAt: string;
}

export interface SubmissionAttempt {
  id: string;
  attemptNumber: number;
  submittedAt: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  documentationUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  marksAwarded?: number;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  courseId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  currentStatus: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  latestMarks?: number;
  latestFeedback?: string;
  attempts: SubmissionAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface LearnerProgress {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  currentLessonId?: string;
  lastAccessedAt: string;
  completedAt?: string;
}

export interface Certificate {
  id: string; // Unique public ID, e.g., PRB-2026-9821
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  courseOrTrackTitle: string;
  type: 'course' | 'track';
  issueDate: string;
  issuerName: string;
  issuerTitle: string;
  certificateFileUrl?: string; // Custom uploaded image/PDF or generated badge
  isRevoked: boolean;
  revokedAt?: string;
  revocationReason?: string;
  gradeOrMarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  targetType: 'all' | 'track' | 'learners';
  targetTrackId?: string;
  targetLearnerIds?: string[];
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  targetType: 'intern' | 'course' | 'track' | 'task' | 'submission' | 'certificate' | 'announcement';
  targetId?: string;
}

export interface UnlockOverride {
  id: string;
  learnerId: string;
  courseId: string;
  weekId: string;
  grantedBy: string;
  grantedAt: string;
  reason: string;
}
