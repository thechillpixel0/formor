export interface Form {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'survey';
  timer?: number;
  shuffle: boolean;
  requireAll: boolean;
  showResults: boolean; // Show correct answers after completion
  allowRetake: boolean; // Allow multiple attempts
  passingScore?: number; // Minimum score to pass (percentage)
  certificateEnabled: boolean; // Enable certificate generation
  customEndPage?: CustomEndPage; // Custom post-submission page
  notificationSettings?: NotificationSettings; // Email/notification config
  conditionalLogic?: ConditionalRule[]; // Form logic rules
  status: 'draft' | 'published';
  createdBy: string; // Creator's name/id
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  formId: string;
  text: string;
  type: 'mcq' | 'dropdown' | 'rating' | 'short_text' | 'paragraph' | 'true_false' | 'file_upload';
  options: string[];
  correctAnswer?: string | number; // For quiz mode
  points: number; // Points for this question
  explanation?: string; // Explanation for the correct answer
  source: string;
  order: number;
  required: boolean;
  fileUploadConfig?: FileUploadConfig; // For file upload questions
}

export interface User {
  id: string;
  name: string;
  email: string;
  roll?: string;
}

export interface Response {
  id: string;
  formId: string;
  userId: string;
  answers: Record<string, string | number>;
  score?: number; // For quiz mode
  maxScore?: number; // Total possible points
  correctAnswers?: number; // Number of correct answers
  totalQuestions?: number; // Total number of questions
  passed?: boolean; // Whether user passed the quiz
  certificateGenerated?: boolean; // Whether certificate was generated
  uploadedFiles?: UploadedFile[]; // Files uploaded by user
  timeTaken: number;
  submittedAt: string;
}

export interface FormAttempt {
  id: string;
  formId: string;
  user: User;
  startedAt: string;
  answers: Record<string, string | number>;
  timeTaken: number;
  isComplete: boolean;
}

export type QuestionType = 'mcq' | 'dropdown' | 'rating' | 'short_text' | 'paragraph' | 'true_false';

export interface BulkQuestion {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
  source: string;
}

export interface ExportRequest {
  id: string;
  formId: string;
  type: 'csv' | 'pdf';
  filters?: {
    dateRange?: { start: string; end: string };
    timeRange?: { min: number; max: number };
    source?: string;
    answers?: Record<string, string>;
  };
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  createdBy: string;
  downloadUrl?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer' | 'reviewer' | 'manager' | 'custom';
  permissions?: Permission[]; // For custom roles
  formAccess: string[]; // Array of form IDs they can access
  invitedBy: string;
  invitedAt: string;
  lastActive?: string;
}

export interface BrandSettings {
  logoUrl?: string;
  brandName: string;
  primaryColor: string;
  showPoweredBy: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  formId?: string;
  details: string;
  timestamp: string;
}
// New Phase 3 Types

export interface Certificate {
  id: string;
  formId: string;
  template: CertificateTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage?: string;
  logoImage?: string;
  signatureImage?: string;
  layout: {
    title: { text: string; x: number; y: number; fontSize: number; color: string };
    recipientName: { x: number; y: number; fontSize: number; color: string };
    score: { x: number; y: number; fontSize: number; color: string; show: boolean };
    date: { x: number; y: number; fontSize: number; color: string };
    formTitle: { x: number; y: number; fontSize: number; color: string };
  };
}

export interface ConditionalRule {
  id: string;
  condition: {
    type: 'score' | 'question_answer' | 'completion';
    questionId?: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
  };
  action: {
    type: 'show_message' | 'redirect' | 'skip_question' | 'send_email';
    value: string;
    target?: string;
  };
}

export interface NotificationSettings {
  emailOnSubmission: boolean;
  emailSubject: string;
  emailBody: string;
  adminNotification: boolean;
  successBanner: {
    enabled: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  };
}

export interface CustomEndPage {
  enabled: boolean;
  heading: string;
  message: string;
  image?: string;
  ctaButtons: {
    text: string;
    url: string;
    type: 'primary' | 'secondary';
  }[];
  showScore: boolean;
  showCertificateDownload: boolean;
}

export interface FileUploadConfig {
  maxFileSize: number; // in MB
  allowedFormats: string[]; // e.g., ['.pdf', '.jpg', '.png']
  multiple: boolean;
}

export interface UploadedFile {
  id: string;
  questionId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  fileData: string; // base64 encoded file data
}

export interface Permission {
  action: 'view' | 'edit' | 'delete' | 'create' | 'export' | 'manage_users';
  resource: 'forms' | 'responses' | 'analytics' | 'settings' | 'certificates';
  granted: boolean;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  certificateEligible: boolean;
}

// Phase 4 Types

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>;
  questions: Omit<Question, 'id' | 'formId'>[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface FormVersion {
  id: string;
  formId: string;
  version: number;
  name: string;
  description?: string;
  formData: Form;
  questionsData: Question[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface AIInsight {
  id: string;
  formId: string;
  type: 'trend' | 'pattern' | 'anomaly' | 'summary';
  title: string;
  description: string;
  data: any;
  confidence: number;
  generatedAt: string;
}

export interface Recommendation {
  id: string;
  formId: string;
  type: 'follow_up_form' | 'improvement' | 'action' | 'certificate';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  type: 'form' | 'delay' | 'condition' | 'action';
  formId?: string;
  delay?: number; // in days
  condition?: ConditionalRule;
  action?: {
    type: 'email' | 'redirect' | 'certificate';
    config: any;
  };
  order: number;
  nextStepId?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  formIds: string[];
  accessLevel: 'public' | 'team' | 'private';
  allowedUsers: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseTag {
  id: string;
  responseId: string;
  tag: string;
  color: string;
  createdBy: string;
  createdAt: string;
}