import { z } from "zod";

const TopicResourceSchema = z.object({
  title: z.string(),
  url: z.string().default(""),
  type: z.string().default("article"),
  free: z.boolean().default(true),
  problemCount: z.number().optional(),
});

const PhaseTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().default("domain_specific"),
  difficulty: z.string().default("medium"),
  estimatedHours: z.number().positive().default(4),
  subtopics: z.array(z.string()).default([]),
  resources: z.array(TopicResourceSchema).default([]),
  completed: z.boolean().default(false),
});

const PhaseSchema = z.object({
  phaseNumber: z.number().int().positive(),
  title: z.string(),
  durationWeeks: z.number().positive().default(2),
  description: z.string().default(""),
  topics: z.array(PhaseTopicSchema).default([]),
});

export const CareerRoadmapSchema = z.object({
  id: z.string(),
  meta: z.object({
    role: z.string(),
    company: z.string(),
    experienceLevel: z.string(),
    totalWeeks: z.number().default(12),
    generatedAt: z.string(),
  }),
  roleIntel: z.object({
    title: z.string(),
    experienceRequired: z.string().default(""),
    description: z.string().default(""),
    keyResponsibilities: z.array(z.string()).default([]),
    requiredSkills: z.array(z.string()).default([]),
    niceToHave: z.array(z.string()).default([]),
  }),
  interviewProcess: z.object({
    totalRounds: z.number().int().default(4),
    timeline: z.string().default("4-6 weeks"),
    rounds: z
      .array(
        z.object({
          round: z.number(),
          type: z.string(),
          duration: z.string().default("45-60 minutes"),
          focus: z.string().default(""),
        })
      )
      .default([]),
    sources: z.array(z.string()).default([]),
  }),
  salaryIntel: z.object({
    currency: z.string().default("USD"),
    location: z.string().default("United States"),
    levels: z
      .array(
        z.object({
          level: z.string(),
          base: z.string(),
          totalComp: z.string(),
          equity4yr: z.string().default("N/A"),
          bonus: z.string().default("N/A"),
        })
      )
      .default([]),
    sources: z.array(z.string()).default([]),
    lastUpdated: z.string().default("2025"),
  }),
  peopleIntel: z.object({
    strategy: z.string().default(""),
    referralSearches: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          description: z.string().default(""),
        })
      )
      .default([]),
    tips: z.array(z.string()).default([]),
    scrapedProfiles: z.array(z.unknown()).default([]),
  }),
  phases: z.array(PhaseSchema).default([]),
  systemDesign: z.object({
    topics: z.array(z.string()).default([]),
    keyConcepts: z.array(z.string()).default([]),
    resources: z.array(TopicResourceSchema).default([]),
  }),
  behavioral: z.object({
    framework: z.string().default("STAR"),
    companyValues: z.array(z.string()).default([]),
    keyThemes: z.array(z.string()).default([]),
    sampleQuestions: z.array(z.string()).default([]),
  }),
  companyIntel: z.object({
    hiringTimeline: z.string().default(""),
    tips: z.array(z.string()).default([]),
  }),
});

export type CareerRoadmapValidated = z.infer<typeof CareerRoadmapSchema>;
