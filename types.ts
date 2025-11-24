export interface ContactProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
}

export interface AnalysisResult {
  atsScore: number;
  contactProfile: ContactProfile;
  missingKeywords: string[];
  criticalIssues: string[];
  keyStrengths: string[];
  summary: string;
}

export enum GeneratorType {
  ATS_RESUME = 'ATS Resume',
  RESUME_SUGGESTIONS = 'Resume Suggestions',
  COVER_LETTER = 'Cover Letter',
  INTERVIEW_PREP = 'Interview Q&A',
  EMAIL_TEMPLATE = 'Cold Email',
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