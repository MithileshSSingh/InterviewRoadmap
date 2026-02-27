// Master index of all available roadmaps
const roadmaps = [
  {
    slug: "javascript",
    title: "JavaScript",
    emoji: "⚡",
    color: "#f7df1e",
    description: "Master JavaScript from variables to design patterns — the language of the web.",
    tags: ["Frontend", "Backend", "Web"],
  },
  {
    slug: "react",
    title: "React",
    emoji: "⚛️",
    color: "#61dafb",
    description: "Build modern UIs with components, hooks, state management, and the React ecosystem.",
    tags: ["Frontend", "UI", "Web"],
    comingSoon: true,
  },
  {
    slug: "nodejs",
    title: "Node.js",
    emoji: "🟩",
    color: "#68a063",
    description: "Server-side JavaScript — APIs, Express, databases, authentication, and deployment.",
    tags: ["Backend", "API", "Server"],
    comingSoon: true,
  },
  {
    slug: "typescript",
    title: "TypeScript",
    emoji: "🔷",
    color: "#3178c6",
    description: "Add type safety to JavaScript — interfaces, generics, utility types, and best practices.",
    tags: ["Frontend", "Backend", "Types"],
    comingSoon: true,
  },
  {
    slug: "python",
    title: "Python",
    emoji: "🐍",
    color: "#3776ab",
    description: "From basics to advanced Python — data structures, OOP, decorators, and real-world projects.",
    tags: ["Backend", "Data Science", "AI"],
    comingSoon: true,
  },
  {
    slug: "css",
    title: "CSS",
    emoji: "🎨",
    color: "#264de4",
    description: "Master modern CSS — flexbox, grid, animations, responsive design, and advanced selectors.",
    tags: ["Frontend", "Design", "Web"],
    comingSoon: true,
  },
];

export function getAllRoadmaps() {
  return roadmaps;
}

export function getRoadmapMeta(slug) {
  return roadmaps.find((r) => r.slug === slug);
}

export default roadmaps;
