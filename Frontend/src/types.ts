export interface ResumeData {
  id: string;
  filename: string;
  sizeKb: number;
  candidateName: string;
  title: string;
  summary: string;
  fullText: string;
  tokenCount: number;
  entityCount: number;
  latencyMs: number;
  pages?: number;
  wordsCount?: number;
  linesCount?: number;
  competencies: string[];
  suggestedInquiries: string[];
  rawContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  quote?: string;
  matchPercentage?: number;
  competencies?: string[];
  timestamp: string;
}

export type AppScreen = "empty" | "indexing" | "chat";

export interface IndexingProgress {
  step: number; // 1 to 4
  stepName: string;
  percentage: number;
  tokens: number;
  entities: number;
  latency: string;
}
