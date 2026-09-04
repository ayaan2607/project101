export type ResourceType = 'Notes' | 'Question Papers' | 'Assignments' | 'Lab Manuals' | 'Reference Material' | 'Books' | 'Video Lectures' | 'Other';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: ResourceType;
  subject_id: string;
  branch: string;
  semester: string;
  resource_url: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  views?: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  created_by: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';
