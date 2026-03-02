// Canonical JSON contract for Roadmap AI

export interface CareerRoadmapMeta {
  role: string;
  company: string;
  experienceLevel: string;
  totalWeeks: number;
  generatedAt: string;
}

export interface InterviewRound {
  round: number;
  type: string;
  duration: string;
  focus: string;
}

export interface InterviewProcess {
  totalRounds: number;
  timeline: string;
  rounds: InterviewRound[];
  sources: string[];
}

export interface RoleIntel {
  title: string;
  experienceRequired: string;
  description: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
}

export interface SalaryLevel {
  level: string;
  base: string;
  totalComp: string;
  equity4yr: string;
  bonus: string;
}

export interface SalaryIntel {
  currency: string;
  location: string;
  levels: SalaryLevel[];
  sources: string[];
  lastUpdated: string;
}

export interface ReferralSearch {
  label: string;
  url: string;
  description: string;
}

export interface PeopleIntel {
  strategy: string;
  referralSearches: ReferralSearch[];
  tips: string[];
  scrapedProfiles: unknown[];
}

export interface TopicResource {
  title: string;
  url: string;
  type: string; // "video" | "article" | "docs" | "course" | "practice" | "book" | "repo"
  free: boolean;
  problemCount?: number;
}

export interface PhaseTopic {
  id: string;
  name: string;
  category: string; // "dsa" | "system_design" | "behavioral" | "domain_specific"
  difficulty: string; // "easy" | "medium" | "hard"
  estimatedHours: number;
  subtopics: string[];
  resources: TopicResource[];
  completed: boolean;
}

export interface Phase {
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  description: string;
  topics: PhaseTopic[];
}

export interface SystemDesign {
  topics: string[];
  keyConcepts: string[];
  resources: TopicResource[];
}

export interface Behavioral {
  framework: string;
  companyValues: string[];
  keyThemes: string[];
  sampleQuestions: string[];
}

export interface CompanyIntel {
  hiringTimeline: string;
  tips: string[];
}

// Full canonical output
export interface CareerRoadmap {
  id: string;
  meta: CareerRoadmapMeta;
  roleIntel: RoleIntel;
  interviewProcess: InterviewProcess;
  salaryIntel: SalaryIntel;
  peopleIntel: PeopleIntel;
  phases: Phase[];
  systemDesign: SystemDesign;
  behavioral: Behavioral;
  companyIntel: CompanyIntel;
}

// SSE event types
export type CareerForgeSSEEvent =
  | { type: "status"; agent: string; message: string }
  | { type: "progress"; agent: string; percent: number }
  | { type: "partial"; section: string; data: unknown }
  | { type: "complete"; roadmapId: string }
  | { type: "error"; message: string };
