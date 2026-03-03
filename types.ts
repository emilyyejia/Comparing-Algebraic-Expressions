
import type React from 'react';

export enum LevelStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
}

export interface Level {
  id: string;
  name: string;
  description: string;
  component: React.FC<LevelComponentProps>;
  topic: string;
  questions?: QuizQuestion[];
  isGated?: boolean;
}

export interface Lesson {
  title: string;
  levels: Level[];
  isBonus?: boolean;
}

export type PlayerProgress = {
  [levelId: string]: number;
};

export interface LevelComponentProps {
  topic: string;
  onComplete: (stars: number) => void;
  onExit?: () => void;
  questions?: QuizQuestion[];
  isGated?: boolean;
  partialProgress?: any;
  onSavePartialProgress?: (state: any | null) => void;
  progress?: PlayerProgress;
  levelId?: string;
  onNext?: () => void;
  onProgressUpdate?: (current: number, total: number) => void;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswers: string[];
  type: 'single' | 'multi';
}

export interface StoryChunk {
  text: string;
  choices: string[];
}

export type Tool = 'help' | 'listen' | 'zoomIn' | 'zoomOut' | 'lineReader' | 'highContrast' | 'highlighter' | 'eraser' | 'notes' | 'calculator' | 'documents';
