export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  jobRole: string;
  status: 'in-progress' | 'completed' | 'paused';
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  transcript: TranscriptMessage[];
  audioUrl?: string;
  analysis?: SessionAnalysis;
  markedForReview: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptMessage {
  id: string;
  role: 'assistant' | 'coach' | 'user';
  content: string;
  timestamp: Date;
  markedForReview?: boolean;
}

export interface SessionAnalysis {
  overallScore: number;
  enthusiasm: number;
  communication: number;
  selfAwareness: number;
  technicalSkills: number;
  verdict: 'recommended' | 'not-recommended' | 'needs-improvement';
  breakdown: AnalysisBreakdown[];
  suggestions: string[];
  generatedAt: Date;
}

export interface AnalysisBreakdown {
  title: string;
  score: number;
  maxScore: number;
  points: string[];
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  jobDescription: string;
  ataScore: number;
  keywordScore: number;
  semanticScore: number;
  formattingScore: number;
  breakdown: {
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  };
  revisedSnippet?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachingTip {
  id: string;
  sessionId: string;
  content: string;
  timestamp: Date;
  type: 'positive' | 'warning' | 'suggestion';
}
