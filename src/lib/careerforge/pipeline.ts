import { ChatOpenAI } from "@langchain/openai";
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { prisma } from "@/lib/db";
import { CareerRoadmapSchema } from "./schema";
import type {
  CareerRoadmap,
  CareerForgeSSEEvent,
  RoleIntel,
  InterviewProcess,
  SalaryIntel,
  PeopleIntel,
  Phase,
} from "./types";

// ─── LLM + Search Factories ──────────────────────────────────────────────────

function createLLM(temperature = 0.3) {
  return new ChatOpenAI({
    model: process.env.CAREER_MODEL ?? "google/gemini-2.0-flash-001",
    apiKey: process.env.OPENROUTER_API_KEY!,
    temperature,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Strip markdown code fences and parse JSON from LLM output */
function parseJsonFromLLM<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/im, "")
      .replace(/\s*```\s*$/im, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to find a JSON object/array within the text
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

/** Direct Tavily REST API call */
async function tavilySearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey === "tvly-YOUR_KEY_HERE") {
    console.warn("[Tavily] API key not configured — skipping web search");
    return "";
  }
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json() as { answer?: string; results?: { content?: string }[] };
    const answer = data.answer ?? "";
    const snippets = (data.results ?? []).map((r) => r.content ?? "").join("\n\n");
    return answer ? `${answer}\n\n${snippets}` : snippets;
  } catch (err) {
    console.warn("[Tavily] Search failed:", err);
    return "";
  }
}

// ─── LangGraph State ──────────────────────────────────────────────────────────

const CareerForgeAnnotation = Annotation.Root({
  role: Annotation<string>(),
  company: Annotation<string>(),
  experienceLevel: Annotation<string>(),
  roadmapId: Annotation<string>(),
  sessionId: Annotation<string>(),
  roleIntel: Annotation<RoleIntel | undefined>(),
  interviewProcess: Annotation<InterviewProcess | undefined>(),
  salaryIntel: Annotation<SalaryIntel | undefined>(),
  peopleIntel: Annotation<PeopleIntel | undefined>(),
  skillTree: Annotation<{ phases: Phase[] } | undefined>(),
  enrichedPhases: Annotation<Phase[] | undefined>(),
  roadmap: Annotation<CareerRoadmap | undefined>(),
  errors: Annotation<string[]>({
    reducer: (existing, incoming) => [...(existing || []), ...(incoming || [])],
    default: () => [],
  }),
});

type CareerForgeState = typeof CareerForgeAnnotation.State;
type Emitter = (event: CareerForgeSSEEvent) => void;

// ─── Node: Orchestrator ───────────────────────────────────────────────────────

const orchestratorNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "orchestrator", message: "Starting career analysis..." });

  try {
    await prisma.roadmap.update({
      where: { id: state.roadmapId },
      data: { status: "running" },
    });
  } catch (err) {
    console.warn("[Orchestrator] DB update failed:", err);
  }

  emitter?.({ type: "progress", agent: "orchestrator", percent: 5 });
  return {};
};

// ─── Node: Job Intel Agent ────────────────────────────────────────────────────

const jobIntelNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "jobIntel", message: "Searching for job intel..." });

  try {
    const [searchResult1, searchResult2] = await Promise.all([
      tavilySearch(`${state.role} ${state.company} interview process rounds timeline 2024 2025`),
      tavilySearch(`${state.role} ${state.company} job description responsibilities required skills`),
    ]);

    const llm = createLLM(0.2);
    const prompt = `You are a career intelligence agent. Based on the search results below, extract structured data about the job role and interview process at ${state.company} for a ${state.role} position.

Search Result 1 (Interview Process):
${searchResult1 || "No results found. Use your knowledge."}

Search Result 2 (Job Description):
${searchResult2 || "No results found. Use your knowledge."}

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "roleIntel": {
    "title": "${state.role}",
    "experienceRequired": "3-5 years",
    "description": "Brief role description",
    "keyResponsibilities": ["responsibility 1", "responsibility 2"],
    "requiredSkills": ["skill 1", "skill 2"],
    "niceToHave": ["nice to have 1"]
  },
  "interviewProcess": {
    "totalRounds": 5,
    "timeline": "4-6 weeks",
    "rounds": [
      { "round": 1, "type": "Phone Screen", "duration": "30 minutes", "focus": "Background and motivation" },
      { "round": 2, "type": "Technical", "duration": "45 minutes", "focus": "Data structures and algorithms" }
    ],
    "sources": ["levels.fyi", "glassdoor"]
  }
}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === "string" ? response.content : "";

    const defaultRoleIntel: RoleIntel = {
      title: state.role,
      experienceRequired: "3+ years",
      description: `Senior ${state.role} role at ${state.company}`,
      keyResponsibilities: ["System design", "Code reviews", "Feature development"],
      requiredSkills: ["Problem solving", "Algorithms", "System design"],
      niceToHave: [],
    };
    const defaultInterviewProcess: InterviewProcess = {
      totalRounds: 5,
      timeline: "4-6 weeks",
      rounds: [
        { round: 1, type: "Phone Screen", duration: "30 min", focus: "Background check" },
        { round: 2, type: "Technical", duration: "45 min", focus: "Coding" },
        { round: 3, type: "System Design", duration: "45 min", focus: "Architecture" },
        { round: 4, type: "Behavioral", duration: "45 min", focus: "Culture fit" },
        { round: 5, type: "Hiring Manager", duration: "30 min", focus: "Final decision" },
      ],
      sources: [],
    };

    const parsed = parseJsonFromLLM<{ roleIntel: RoleIntel; interviewProcess: InterviewProcess }>(
      content,
      { roleIntel: defaultRoleIntel, interviewProcess: defaultInterviewProcess }
    );

    emitter?.({ type: "partial", section: "interviewProcess", data: parsed.interviewProcess });
    emitter?.({ type: "progress", agent: "jobIntel", percent: 20 });

    return {
      roleIntel: parsed.roleIntel ?? defaultRoleIntel,
      interviewProcess: parsed.interviewProcess ?? defaultInterviewProcess,
    };
  } catch (err) {
    console.error("[Job Intel Agent] Error:", err);
    emitter?.({ type: "status", agent: "jobIntel", message: "Using LLM fallback for job intel..." });
    return {
      errors: [`jobIntel: ${String(err)}`],
      roleIntel: {
        title: state.role,
        experienceRequired: "3+ years",
        description: `${state.role} at ${state.company}`,
        keyResponsibilities: [],
        requiredSkills: [],
        niceToHave: [],
      } as RoleIntel,
      interviewProcess: {
        totalRounds: 5,
        timeline: "4-6 weeks",
        rounds: [],
        sources: [],
      } as InterviewProcess,
    };
  }
};

// ─── Node: Salary Intelligence Agent ─────────────────────────────────────────

const salaryIntelNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "salaryIntel", message: "Researching compensation data..." });

  try {
    const [result1, result2] = await Promise.all([
      tavilySearch(`${state.role} ${state.company} salary compensation total comp ${state.experienceLevel} 2024 2025`),
      tavilySearch(`site:levels.fyi ${state.company} ${state.role} salary OR site:glassdoor.com ${state.company} ${state.role} compensation`),
    ]);

    const llm = createLLM(0.1);
    const prompt = `You are a compensation intelligence agent. Based on the search results below, extract salary data for a ${state.role} at ${state.company}.

Search Result 1:
${result1 || "No results found. Use your knowledge."}

Search Result 2:
${result2 || "No results found. Use your knowledge."}

Respond ONLY with a valid JSON object (no markdown):
{
  "currency": "USD",
  "location": "United States",
  "levels": [
    { "level": "Junior", "base": "$90K-$120K", "totalComp": "$110K-$150K", "equity4yr": "$20K-$60K", "bonus": "$5K-$15K" },
    { "level": "Mid", "base": "$130K-$160K", "totalComp": "$170K-$230K", "equity4yr": "$80K-$150K", "bonus": "$15K-$30K" },
    { "level": "Senior", "base": "$170K-$210K", "totalComp": "$250K-$350K", "equity4yr": "$150K-$300K", "bonus": "$25K-$50K" },
    { "level": "Staff", "base": "$210K-$260K", "totalComp": "$380K-$550K", "equity4yr": "$300K-$600K", "bonus": "$40K-$80K" }
  ],
  "sources": ["levels.fyi", "glassdoor"],
  "lastUpdated": "2025"
}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === "string" ? response.content : "";

    const defaultSalary: SalaryIntel = {
      currency: "USD",
      location: "United States",
      levels: [
        { level: "Junior", base: "$90K-$120K", totalComp: "$110K-$150K", equity4yr: "N/A", bonus: "N/A" },
        { level: "Mid", base: "$130K-$160K", totalComp: "$170K-$230K", equity4yr: "N/A", bonus: "N/A" },
        { level: "Senior", base: "$170K-$210K", totalComp: "$250K-$350K", equity4yr: "N/A", bonus: "N/A" },
      ],
      sources: [],
      lastUpdated: "2025",
    };

    const parsed = parseJsonFromLLM<SalaryIntel>(content, defaultSalary);
    emitter?.({ type: "partial", section: "salaryIntel", data: parsed });
    emitter?.({ type: "progress", agent: "salaryIntel", percent: 20 });

    return { salaryIntel: parsed };
  } catch (err) {
    console.error("[Salary Intel Agent] Error:", err);
    emitter?.({ type: "status", agent: "salaryIntel", message: "Using estimated salary data..." });
    return {
      errors: [`salaryIntel: ${String(err)}`],
      salaryIntel: {
        currency: "USD",
        location: "United States",
        levels: [],
        sources: [],
        lastUpdated: "2025",
      } as SalaryIntel,
    };
  }
};

// ─── Node: LinkedIn Intelligence Agent ───────────────────────────────────────

const linkedInIntelNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "linkedinIntel", message: "Building LinkedIn search strategy..." });

  try {
    const llm = createLLM(0.4);
    const encodedCompany = encodeURIComponent(state.company);
    const encodedRole = encodeURIComponent(state.role);

    const prompt = `You are a networking intelligence agent. Generate LinkedIn search strategies for someone targeting a ${state.role} position at ${state.company}.

Generate realistic LinkedIn people search URLs using this format:
https://www.linkedin.com/search/results/people/?keywords=KEYWORDS&company=COMPANY&title=TITLE

Also generate 4-5 practical outreach tips.

Respond ONLY with valid JSON (no markdown):
{
  "strategy": "Brief 1-2 sentence networking strategy for ${state.company}",
  "referralSearches": [
    {
      "label": "Current ${state.role}s at ${state.company}",
      "url": "https://www.linkedin.com/search/results/people/?keywords=${encodedRole}&currentCompany=%5B%22${encodedCompany}%22%5D",
      "description": "Find people currently in this exact role"
    },
    {
      "label": "Hiring managers at ${state.company}",
      "url": "https://www.linkedin.com/search/results/people/?keywords=engineering+manager&currentCompany=%5B%22${encodedCompany}%22%5D",
      "description": "Connect with potential hiring managers"
    },
    {
      "label": "Recent ${state.company} joiners",
      "url": "https://www.linkedin.com/search/results/people/?keywords=${encodedRole}&currentCompany=%5B%22${encodedCompany}%22%5D&datePosted=%22past-month%22",
      "description": "People who joined in the last year — more likely to respond"
    }
  ],
  "tips": [
    "Personalize your connection request with a specific shared interest or project",
    "Ask for a 15-minute coffee chat, not a job — remove pressure",
    "Research their work before reaching out (GitHub, LinkedIn posts, talks)",
    "Follow up once after 1 week if no response",
    "Offer value first — share a resource, insight, or ask a genuine question"
  ],
  "scrapedProfiles": []
}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === "string" ? response.content : "";

    const defaultPeople: PeopleIntel = {
      strategy: `Focus on connecting with current ${state.role}s at ${state.company} who can provide referrals.`,
      referralSearches: [
        {
          label: `${state.role}s at ${state.company}`,
          url: `https://www.linkedin.com/search/results/people/?keywords=${encodedRole}&currentCompany=${encodedCompany}`,
          description: "Find current employees in this role",
        },
      ],
      tips: ["Personalize every message", "Ask for advice, not a job"],
      scrapedProfiles: [],
    };

    const parsed = parseJsonFromLLM<PeopleIntel>(content, defaultPeople);
    emitter?.({ type: "partial", section: "peopleIntel", data: parsed });
    emitter?.({ type: "progress", agent: "linkedinIntel", percent: 20 });

    return { peopleIntel: parsed };
  } catch (err) {
    console.error("[LinkedIn Intel Agent] Error:", err);
    return {
      errors: [`linkedinIntel: ${String(err)}`],
      peopleIntel: {
        strategy: "",
        referralSearches: [],
        tips: [],
        scrapedProfiles: [],
      } as PeopleIntel,
    };
  }
};

// ─── Node: Skills Mapper Agent ────────────────────────────────────────────────

const skillsMapperNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "skillsMapper", message: "Mapping skill tree..." });

  try {
    const llm = createLLM(0.3);
    const topicCount = state.experienceLevel.toLowerCase().includes("junior") ? 12 : 18;

    const prompt = `You are a career skills mapping agent. Create a structured skill tree for a ${state.experienceLevel} ${state.role} targeting ${state.company}.

Important: Tailor to ${state.company}'s known interview style (e.g., Google = heavy DS&A + system design, Amazon = leadership principles + coding, Meta = product sense + coding, Microsoft = coding + system design).

Create ${topicCount} topics spread across 4 phases. Each topic needs: id (snake_case), name, category (one of: dsa/system_design/behavioral/domain_specific), difficulty (easy/medium/hard), estimatedHours (2-20), subtopics (3-5 items), phase (1-4).

Respond ONLY with valid JSON (no markdown):
{
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Foundation",
      "durationWeeks": 3,
      "description": "Build the core fundamentals",
      "topics": [
        {
          "id": "arrays_strings",
          "name": "Arrays & Strings",
          "category": "dsa",
          "difficulty": "easy",
          "estimatedHours": 8,
          "subtopics": ["Two pointers", "Sliding window", "String manipulation"],
          "resources": [],
          "completed": false
        }
      ]
    },
    {
      "phaseNumber": 2,
      "title": "Intermediate",
      "durationWeeks": 4,
      "description": "Level up with intermediate concepts",
      "topics": []
    },
    {
      "phaseNumber": 3,
      "title": "Advanced",
      "durationWeeks": 4,
      "description": "Master advanced topics",
      "topics": []
    },
    {
      "phaseNumber": 4,
      "title": "Mock Prep",
      "durationWeeks": 2,
      "description": "Final preparation and mock interviews",
      "topics": []
    }
  ]
}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === "string" ? response.content : "";

    const parsed = parseJsonFromLLM<{ phases: Phase[] }>(content, { phases: [] });
    emitter?.({ type: "progress", agent: "skillsMapper", percent: 30 });

    return { skillTree: parsed };
  } catch (err) {
    console.error("[Skills Mapper Agent] Error:", err);
    return { errors: [`skillsMapper: ${String(err)}`], skillTree: { phases: [] } };
  }
};

// ─── Node: Resource Finder Agent ──────────────────────────────────────────────

const resourceFinderNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "resourceFinder", message: "Finding learning resources..." });

  try {
    const phases = state.skillTree?.phases ?? [];
    const llm = createLLM(0.2);

    // One Tavily search per phase (cost control) + LLM distributes resources
    const enrichedPhases = await Promise.all(
      phases.map(async (phase, idx) => {
        const topicNames = phase.topics.map((t) => t.name).join(", ");
        const searchResult = await tavilySearch(
          `best resources to learn ${topicNames} for software engineering interview 2024`
        );

        const prompt = `For each topic in this interview prep phase, suggest the best 2-3 learning resources.

Topics: ${topicNames}
Search Results: ${searchResult || "Use your knowledge of popular resources like LeetCode, NeetCode, Grokking, System Design Primer, etc."}

Respond ONLY with valid JSON array where each item has: topicName, resources array with {title, url, type (video/article/course/practice/book/repo), free (boolean)}

Only provide URLs you are confident are real and working. For practice resources like LeetCode, use the category URL not specific problem URLs.

Example:
[
  {
    "topicName": "Arrays & Strings",
    "resources": [
      { "title": "NeetCode Arrays", "url": "https://neetcode.io/roadmap", "type": "video", "free": true },
      { "title": "LeetCode Array Problems", "url": "https://leetcode.com/tag/array/", "type": "practice", "free": true }
    ]
  }
]`;

        const response = await llm.invoke([new HumanMessage(prompt)]);
        const content = typeof response.content === "string" ? response.content : "";
        const resourceMap = parseJsonFromLLM<{ topicName: string; resources: unknown[] }[]>(
          content,
          []
        );

        const enrichedTopics = phase.topics.map((topic) => {
          const match = resourceMap.find(
            (r) => r.topicName?.toLowerCase().includes(topic.name.toLowerCase()) ||
              topic.name.toLowerCase().includes(r.topicName?.toLowerCase() ?? "")
          );
          return { ...topic, resources: match?.resources ?? [] };
        });

        emitter?.({
          type: "progress",
          agent: "resourceFinder",
          percent: 40 + Math.floor((idx / phases.length) * 15),
        });

        return { ...phase, topics: enrichedTopics };
      })
    );

    emitter?.({ type: "progress", agent: "resourceFinder", percent: 55 });
    return { enrichedPhases };
  } catch (err) {
    console.error("[Resource Finder Agent] Error:", err);
    return {
      errors: [`resourceFinder: ${String(err)}`],
      enrichedPhases: state.skillTree?.phases ?? [],
    };
  }
};

// ─── Node: Roadmap Builder Agent ──────────────────────────────────────────────

const roadmapBuilderNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "roadmapBuilder", message: "Assembling your roadmap..." });

  try {
    const phases = state.enrichedPhases ?? state.skillTree?.phases ?? [];
    const totalWeeks = phases.reduce((sum, p) => sum + (p.durationWeeks || 2), 0);

    const llm = createLLM(0.4);
    const prompt = `You are generating system design and behavioral interview prep sections for a ${state.role} interview at ${state.company} (${state.experienceLevel} level).

Respond ONLY with valid JSON (no markdown):
{
  "systemDesign": {
    "topics": ["Design URL shortener", "Design Twitter feed", "Design distributed cache"],
    "keyConcepts": ["Load balancing", "Database sharding", "Caching strategies", "CAP theorem"],
    "resources": [
      { "title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "repo", "free": true },
      { "title": "Grokking System Design", "url": "https://www.educative.io/courses/grokking-the-system-design-interview", "type": "course", "free": false }
    ]
  },
  "behavioral": {
    "framework": "STAR",
    "companyValues": ["Innovation", "Customer focus", "Ownership"],
    "keyThemes": ["Leadership", "Conflict resolution", "Cross-team collaboration", "Failure stories"],
    "sampleQuestions": [
      "Tell me about a time you led a project under tight deadlines.",
      "Describe a situation where you disagreed with a team member. How did you resolve it?",
      "Give an example of a time you took ownership of a problem that wasn't yours."
    ]
  },
  "companyIntel": {
    "hiringTimeline": "Typically 4-6 weeks from application to offer",
    "tips": ["Apply directly on the company website", "Get a referral if possible — it significantly helps", "Prepare for company-specific values questions"]
  }
}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === "string" ? response.content : "";

    const extras = parseJsonFromLLM<{
      systemDesign: CareerRoadmap["systemDesign"];
      behavioral: CareerRoadmap["behavioral"];
      companyIntel: CareerRoadmap["companyIntel"];
    }>(content, {
      systemDesign: { topics: [], keyConcepts: [], resources: [] },
      behavioral: { framework: "STAR", companyValues: [], keyThemes: [], sampleQuestions: [] },
      companyIntel: { hiringTimeline: "4-6 weeks", tips: [] },
    });

    const roadmap: CareerRoadmap = {
      id: state.roadmapId,
      meta: {
        role: state.role,
        company: state.company,
        experienceLevel: state.experienceLevel,
        totalWeeks,
        generatedAt: new Date().toISOString(),
      },
      roleIntel: state.roleIntel ?? {
        title: state.role,
        experienceRequired: "3+ years",
        description: "",
        keyResponsibilities: [],
        requiredSkills: [],
        niceToHave: [],
      },
      interviewProcess: state.interviewProcess ?? {
        totalRounds: 5,
        timeline: "4-6 weeks",
        rounds: [],
        sources: [],
      },
      salaryIntel: state.salaryIntel ?? {
        currency: "USD",
        location: "United States",
        levels: [],
        sources: [],
        lastUpdated: "2025",
      },
      peopleIntel: state.peopleIntel ?? {
        strategy: "",
        referralSearches: [],
        tips: [],
        scrapedProfiles: [],
      },
      phases,
      systemDesign: extras.systemDesign,
      behavioral: extras.behavioral,
      companyIntel: extras.companyIntel,
    };

    emitter?.({ type: "progress", agent: "roadmapBuilder", percent: 80 });
    return { roadmap };
  } catch (err) {
    console.error("[Roadmap Builder Agent] Error:", err);
    return { errors: [`roadmapBuilder: ${String(err)}`] };
  }
};

// ─── Node: Formatter Agent ────────────────────────────────────────────────────

const formatterNode = async (
  state: CareerForgeState,
  config: { configurable?: { emitter?: Emitter } }
) => {
  const emitter = config.configurable?.emitter;
  emitter?.({ type: "status", agent: "formatter", message: "Validating and saving roadmap..." });

  try {
    if (!state.roadmap) {
      throw new Error("No roadmap to format");
    }

    const validation = CareerRoadmapSchema.safeParse(state.roadmap);

    let finalRoadmap;
    if (validation.success) {
      finalRoadmap = validation.data;
    } else {
      // Try LLM repair once
      console.warn("[Formatter] Validation failed, attempting repair:", validation.error.message);
      const llm = createLLM(0.1);
      const prompt = `Fix this JSON to match the required schema. Validation errors:
${validation.error.message}

Original JSON:
${JSON.stringify(state.roadmap, null, 2)}

Return ONLY the fixed JSON with no explanation or markdown.`;

      const response = await llm.invoke([new HumanMessage(prompt)]);
      const content = typeof response.content === "string" ? response.content : "";
      const repaired = parseJsonFromLLM(content, state.roadmap);
      const retry = CareerRoadmapSchema.safeParse(repaired);
      finalRoadmap = retry.success ? retry.data : state.roadmap;
    }

    // Save to database
    await prisma.roadmap.update({
      where: { id: state.roadmapId },
      data: {
        status: "complete",
        result: JSON.stringify(finalRoadmap),
      },
    });

    // Log agent runs
    await prisma.agentRun.createMany({
      data: [
        "orchestrator",
        "jobIntel",
        "salaryIntel",
        "linkedinIntel",
        "skillsMapper",
        "resourceFinder",
        "roadmapBuilder",
        "formatter",
      ].map((agentName) => ({
        roadmapId: state.roadmapId,
        agentName,
        status: state.errors?.some((e) => e.startsWith(agentName)) ? "error" : "complete",
        completedAt: new Date(),
      })),
    });

    emitter?.({ type: "progress", agent: "formatter", percent: 100 });
    emitter?.({ type: "complete", roadmapId: state.roadmapId });

    return {};
  } catch (err) {
    console.error("[Formatter Agent] Error:", err);

    // Mark DB as error
    await prisma.roadmap.update({
      where: { id: state.roadmapId },
      data: { status: "error", errorMessage: String(err) },
    }).catch(() => {});

    emitter?.({ type: "error", message: "Failed to save roadmap. Please try again." });
    return { errors: [`formatter: ${String(err)}`] };
  }
};

// ─── Build Graph ──────────────────────────────────────────────────────────────

const graph = new StateGraph(CareerForgeAnnotation)
  .addNode("orchestrator", orchestratorNode)
  .addNode("jobIntelAgent", jobIntelNode)
  .addNode("salaryIntelAgent", salaryIntelNode)
  .addNode("linkedInIntelAgent", linkedInIntelNode)
  .addNode("skillsMapperAgent", skillsMapperNode)
  .addNode("resourceFinderAgent", resourceFinderNode)
  .addNode("roadmapBuilderAgent", roadmapBuilderNode)
  .addNode("formatterAgent", formatterNode)
  .addEdge(START, "orchestrator")
  // Fan-out: orchestrator → 4 parallel agents
  .addEdge("orchestrator", "jobIntelAgent")
  .addEdge("orchestrator", "salaryIntelAgent")
  .addEdge("orchestrator", "linkedInIntelAgent")
  .addEdge("orchestrator", "skillsMapperAgent")
  // Skills mapper → resource finder (sequential dependency)
  .addEdge("skillsMapperAgent", "resourceFinderAgent")
  // Fan-in barrier: wait for all 4 before building roadmap
  .addEdge(
    ["jobIntelAgent", "salaryIntelAgent", "linkedInIntelAgent", "resourceFinderAgent"],
    "roadmapBuilderAgent"
  )
  .addEdge("roadmapBuilderAgent", "formatterAgent")
  .addEdge("formatterAgent", END)
  .compile();

// ─── Public API ───────────────────────────────────────────────────────────────

export interface PipelineInput {
  roadmapId: string;
  role: string;
  company: string;
  experienceLevel: string;
  sessionId: string;
  emitter: Emitter;
}

export async function runCareerForgePipeline(input: PipelineInput) {
  const initialState = {
    role: input.role,
    company: input.company,
    experienceLevel: input.experienceLevel,
    roadmapId: input.roadmapId,
    sessionId: input.sessionId,
    errors: [],
  };

  await graph.invoke(initialState, {
    configurable: { emitter: input.emitter },
  });
}
