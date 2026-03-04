import { describe, expect, it } from "vitest";
import { CareerRoadmapSchema } from "@/lib/careerforge/schema";

const validCareerRoadmap = {
  id: "roadmap_123",
  meta: {
    role: "Frontend Engineer",
    company: "Acme",
    experienceLevel: "Mid",
    generatedAt: "2026-03-04T10:00:00.000Z",
  },
  roleIntel: {
    title: "Frontend Engineer",
  },
  interviewProcess: {},
  salaryIntel: {},
  peopleIntel: {},
  phases: [
    {
      phaseNumber: 1,
      title: "Core Foundations",
      topics: [
        {
          id: "topic_1",
          name: "JavaScript Fundamentals",
        },
      ],
    },
  ],
  systemDesign: {},
  behavioral: {},
  companyIntel: {},
};

describe("CareerRoadmapSchema", () => {
  it("validates a valid CareerRoadmap object and applies defaults", () => {
    const result = CareerRoadmapSchema.parse(validCareerRoadmap);

    expect(result.id).toBe("roadmap_123");
    expect(result.meta.totalWeeks).toBe(12);
    expect(result.interviewProcess.totalRounds).toBe(4);
    expect(result.phases[0].topics[0].estimatedHours).toBe(4);
  });

  it("rejects objects with missing required fields", () => {
    const invalidMissingFields = {
      ...validCareerRoadmap,
      roleIntel: {},
    };

    const result = CareerRoadmapSchema.safeParse(invalidMissingFields);

    expect(result.success).toBe(false);
  });

  it("rejects objects with wrong field types", () => {
    const invalidTypes = {
      ...validCareerRoadmap,
      meta: {
        ...validCareerRoadmap.meta,
        totalWeeks: "twelve",
      },
    };

    const result = CareerRoadmapSchema.safeParse(invalidTypes);

    expect(result.success).toBe(false);
  });
});
