import { describe, expect, it } from "vitest";
import { getAllRoadmaps, getRoadmapMeta } from "@/data/roadmaps";

describe("roadmaps metadata", () => {
  it("returns all roadmaps with the expected count and required fields", () => {
    const roadmaps = getAllRoadmaps();

    expect(roadmaps).toHaveLength(11);

    for (const roadmap of roadmaps) {
      expect(roadmap).toHaveProperty("slug");
      expect(roadmap).toHaveProperty("title");
      expect(roadmap).toHaveProperty("emoji");
      expect(roadmap).toHaveProperty("color");
      expect(roadmap).toHaveProperty("description");
      expect(roadmap).toHaveProperty("tags");

      expect(typeof roadmap.slug).toBe("string");
      expect(typeof roadmap.title).toBe("string");
      expect(typeof roadmap.emoji).toBe("string");
      expect(typeof roadmap.color).toBe("string");
      expect(typeof roadmap.description).toBe("string");
      expect(Array.isArray(roadmap.tags)).toBe(true);
    }
  });

  it("returns the matching roadmap by slug", () => {
    const roadmap = getRoadmapMeta("javascript");

    expect(roadmap).toBeDefined();
    expect(roadmap).toMatchObject({
      slug: "javascript",
      title: "JavaScript",
    });
  });
});
