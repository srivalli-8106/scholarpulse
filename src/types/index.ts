export type AcademicLevel = 
  | 'High School'
  | 'College / Undergraduate'
  | 'Graduate / Advanced'
  | 'Foundations';

export type TutorTone = 
  | 'Balanced'
  | 'Socratic'
  | 'Concise & Exam Cram'
  | 'ELI5 (Simple Analogies)';

export type SolutionFormat = 
  | 'step-by-step'
  | 'deep-dive'
  | 'quick'
  | 'mcq';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  bgGlow: string;
  badgeColor: string;
  description: string;
  topics: string[];
  quickPrompts: string[];
  sampleProblems: {
    title: string;
    question: string;
    topic: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  subjectId: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface QuestionRecord {
  id: string;
  question: string;
  subjectId: string;
  level: AcademicLevel;
  format: SolutionFormat;
  solution: string;
  timestamp: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category: string;
  mastered: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelectedIndex?: number;
}

export type ActiveTab = 'dashboard' | 'chat' | 'solver' | 'quiz' | 'flashcards' | 'pomodoro';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';
