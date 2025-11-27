export interface ContactProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
}

export interface MarketAnalysis {
  salary: string;
  verdict: string;
  culture: string;
}

export interface AnalysisResult {
  atsScore: number; // Formatting & Compliance
  relevanceScore: number; // JD Skill Match
  roleFitAnalysis: string; // Brief explanation of fit
  contactProfile: ContactProfile;
  languages: string[]; // Spoken languages
  missingKeywords: string[];
  criticalIssues: string[];
  keyStrengths: string[];
  summary: string;
  marketAnalysis?: MarketAnalysis;
}

export enum GeneratorType {
  ATS_RESUME = 'ATS Resume',
  RESUME_SUGGESTIONS = 'Resume Suggestions',
  COVER_LETTER = 'Cover Letter',
  INTERVIEW_PREP = 'Interview Q&A',
  EMAIL_TEMPLATE = 'Cold Outreach',
  LEARNING_PATH = 'Learning Path',
  MARKET_INSIGHTS = 'Market Insights',
}

export interface GeneratedContent {
  type: GeneratorType;
  content: string;
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}