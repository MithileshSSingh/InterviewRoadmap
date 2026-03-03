---
name: Create Roadmap
description: Generate a complete learning/interview-preparation roadmap with phases, topics, exercises, and interview questions for any technology or role.
---

# Create Roadmap Skill

This skill generates a **complete, production-ready learning roadmap** for the InterviewRoadmap Next.js project. Given a technology or role, it creates all phase data files, registers them, and verifies the build.

---

## Prerequisites

- Project root: `/Users/zinka/AI_Projects/Learning/javascript-roadmap`
- Data directory: `src/data/`
- Registration files: `src/data/roadmaps.js` and `src/data/index.js`

---

## Step 1: Gather Requirements

Ask the user for the following information. If not provided, ask clarifying questions before proceeding.

| Field | Description | Example |
|-------|-------------|---------|
| **Topic / Role** | What the roadmap is about | "Salesforce Developer", "Rust Programming", "ML Engineer" |
| **Target Level** | Entry → Senior → Architect progression? | "Developer to Technical Architect" |
| **Depth** | Interview prep? Deep platform mastery? Quick overview? | "Enterprise-level, interview-focused" |
| **Special Focus** | Any areas to emphasize | "Integrations, system design, production debugging" |

---

## Step 2: Plan Phases

Design **10-15 phases** that progressively cover the roadmap topic from foundational to advanced. Each phase will become a separate `.js` file.

**Recommended phase structure pattern:**

```
Phase 1:  Role Expectations & Career Path
Phase 2:  Core Fundamentals (the platform/language basics)
Phase 3:  Primary Language / Tool (syntax, core features)
Phase 3b: Primary Language / Tool (advanced features) — optional split
Phase 4:  UI / Framework (if applicable)
Phase 5:  Integration / APIs
Phase 6:  Data Management / Security
Phase 7:  DevOps / Tooling
Phase 8:  Performance Optimization
Phase 9:  Design Patterns / Architecture
Phase 10: Debugging / Troubleshooting
Phase 11: Declarative/Config tools (if applicable)
Phase 12: Ecosystem / Products
Phase 13: Real-World Projects / Case Studies
Phase 14: Interview Preparation & Career Growth
```

Adjust phases to fit the specific technology. Not all topics need all 14 phases — some may need fewer (8-10), some more (15+).

> [!IMPORTANT]
> Create an implementation plan artifact (`implementation_plan.md`) listing all phases with brief descriptions and request user review before proceeding to file creation.

---

## Step 3: Naming Conventions

Derive a **short prefix** and **slug** from the roadmap topic:

| Roadmap | Prefix | Slug | Directory |
|---------|--------|------|-----------|
| JavaScript | _(none)_ | `javascript` | `src/data/javascript/` |
| TypeScript | `ts` | `typescript` | `src/data/typescript/` |
| DSA | `dsa` | `dsa` | `src/data/dsa/` |
| Android Senior | `android` | `android-senior` | `src/data/android/` |
| React Native Senior | `rn` | `react-native-senior` | `src/data/react-native/` |
| Salesforce Developer | `sf` | `salesforce-developer` | `src/data/salesforce/` |

**File naming:**
- With prefix: `{prefix}-phase{N}.js` (e.g., `sf-phase1.js`, `rn-phase3.js`)
- Without prefix (rare, only JS): `phase{N}.js` (e.g., `phase1.js`)
- For split phases: `{prefix}-phase{N}b.js` (e.g., `sf-phase3b.js`) or `phase{N}b.js` (e.g., `phase1b.js`)
- Directory: `src/data/{directory-name}/`

**Variable naming in files:**
- With prefix: `const {prefix}Phase{N} = { ... }` (e.g., `const sfPhase1 = { ... }`)
- Without prefix: `const phase{N} = { ... }` (e.g., `const phase1 = { ... }`)

---

## Step 4: Create Phase Data Files

### 4a. Regular Phase Files (Full Phase Object)

Regular phase files export a **complete phase object** with metadata and topics:

```javascript
const {prefix}Phase{N} = {
  id: "phase-{N}",
  title: "Phase {N}: {Phase Title}",
  emoji: "{relevant emoji}",
  description: "{1-2 sentence description of what this phase covers}",
  topics: [
    {
      id: "{topic-kebab-id}",
      title: "{Topic Title}",
      explanation: `{DETAILED multi-paragraph explanation using markdown formatting.
        - Use **bold** for key terms
        - Use code blocks for examples
        - Include tables where useful
        - Minimum 200-400 words per explanation
        - Cover WHY, not just WHAT
        - Include enterprise/production context
        - Reference best practices and anti-patterns}`,
      codeExample: `{COMPLETE, runnable code example.
        - Production-quality code, not toy examples
        - Include comments explaining key decisions
        - Show both BAD and GOOD patterns where appropriate
        - 50-200 lines of code per example
        - Multiple related examples in one block}`,
      exercise: `{Practice exercises, numbered list.
        - Progressive difficulty (easy → hard)
        - Mix of building, debugging, and designing
        - Include specific deliverables
        - 4-10 exercises per topic}`,
      commonMistakes: [
        "{Mistake 1 — specific description with why it's wrong and what to do instead}",
        "{Mistake 2 — ...}",
        // 3-5 mistakes total
      ],
      interviewQuestions: [
        {
          type: "conceptual",  // or "tricky", "coding", "scenario", "behavioral"
          q: "{Interview question}",
          a: "{Detailed answer with structure, examples, and key points. Use **bold** for emphasis.}"
        },
        // 2-5 questions per topic, mixing different types
      ]
    },
    // ... 2-6 topics per phase
  ]
};

export default {prefix}Phase{N};
```

### 4b. Split Phase Files (Bare Topic Array)

> [!CAUTION]
> Split files (`phase{N}b.js`) export a **bare array of topic objects**, NOT a full phase object. This is critical — they will be merged with the main phase's topics array in `index.js`.

```javascript
const {prefix}Phase{N}b = [
  {
    id: "{topic-kebab-id}",
    title: "{Topic Title}",
    explanation: `...`,
    codeExample: `...`,
    exercise: `...`,
    commonMistakes: [...],
    interviewQuestions: [...]
  },
  // ... more topic objects
];

export default {prefix}Phase{N}b;
```

**When to split:** If a phase has 6+ topics, split into `phase{N}` (main, with metadata + first batch of topics) and `phase{N}b` (bare array of remaining topics).

### Topic ID Patterns

Topic IDs should be descriptive kebab-case. Use a prefix consistent with the roadmap:

| Roadmap | Topic ID Examples |
|---------|------------------|
| Salesforce | `sf-apex-basics`, `sf-triggers-deep-dive`, `sf-async-apex` |
| TypeScript | `ts-basic-types`, `ts-generics-advanced`, `ts-utility-types` |
| Android | `activity-lifecycle`, `broadcast-receivers`, `app-startup-optimization` |
| JavaScript | `variables`, `functions`, `closures` |
| DSA | `big-o-notation`, `mathematical-foundations`, `bit-manipulation-basics` |
| React Native | `staff-engineer-expectations`, `cross-platform-architecture` |

> [!NOTE]
> The prefix in topic IDs is **optional** — some roadmaps use it (Salesforce, TypeScript) and some don't (JavaScript, DSA, Android, React Native). Choose what feels natural for the technology. The only requirement is that IDs are globally unique and kebab-case.

### Content Quality Requirements

> [!CAUTION]
> DO NOT create shallow or generic content. Every topic must have:

- **Explanation:** Deep, opinionated, production-focused. Explain *why* not just *what*. Include comparison tables, decision frameworks, and enterprise context. *Minimum 200 words.* Use markdown formatting: `**bold**`, code blocks, bullet lists, tables, and emoji analogies (🏠 Real-world analogy).
- **Code Example:** Real, production-grade code. Show actual patterns someone would use in a professional project. Include comments. Show both BAD (❌) and GOOD (✅) patterns where appropriate. *Minimum 50 lines.*
- **Exercise:** Progressive exercises from basic implementation to enterprise-scale design. Include specific and measurable deliverables. *4-10 exercises per topic.*
- **Common Mistakes:** Specific, actionable mistakes with explanations. Not generic "don't do this" — explain *why* it fails in production. *3-5 mistakes per topic.*
- **Interview Questions:** Mix of types (`conceptual`, `tricky`, `coding`, `scenario`, `behavioral`). Answers should be comprehensive enough to pass a senior-level interview. Include code in answers where relevant (use markdown code blocks inside the string). *2-5 questions per topic.*

### Topics Per Phase

Each phase should contain **2-6 topics**. Aim for:
- Smaller phases (foundational): 3-6 topics
- Larger phases (advanced): 2-3 deep topics
- Total across all phases: **30-60 topics**

---

## Step 5: Register the Roadmap

After all phase files are created, update two files:

### 5a. Update `src/data/roadmaps.js`

Add a new entry to the `roadmaps` array (before the `comingSoon` entries):

```javascript
{
  slug: "{slug}",
  title: "{Roadmap Title}",
  emoji: "{emoji}",
  color: "{hex color}",  // e.g. "#F7DF1E" for JS-yellow, "#3178C6" for TS-blue
  description: "{1-2 sentence marketing-style description}",
  tags: ["{Tag1}", "{Tag2}", "{Tag3}"],
},
```

> [!TIP]
> Choose a `color` that matches the technology's brand color (e.g., `#F7DF1E` for JavaScript, `#3178C6` for TypeScript, `#00A1E0` for Salesforce). Check the existing entries in `roadmaps.js` for the format.

### 5b. Update `src/data/index.js`

1. **Add imports** at the top (grouped with blank line after last import group):

```javascript
// {Roadmap Name} phases
import {prefix}Phase1Data from "./{directory}/{prefix}-phase1";
import {prefix}Phase2Data from "./{directory}/{prefix}-phase2";
// ... all phases
// If split phases exist:
import {prefix}Phase3bData from "./{directory}/{prefix}-phase3b";
```

2. **Combine split phases** (if any `phase{N}b` files exist):

```javascript
// For split phases: merge the base phase object with additional topics from the "b" file
const {prefix}Phase3 = {
  ...{prefix}Phase3Data,
  topics: [...{prefix}Phase3Data.topics, ...{prefix}Phase3bData]
};
```

> [!IMPORTANT]
> The "b" file exports a **bare array** of topic objects. Spread it directly into the topics array alongside the base phase's topics: `[...phase3Data.topics, ...phase3bData]`.

3. **Export the phases array:**

```javascript
export const {name}Phases = [
  {prefix}Phase1Data, {prefix}Phase2Data, {prefix}Phase3, ...
];
```

Use the combined variable (e.g., `{prefix}Phase3`) for any phase that has a "b" file, and the raw import (e.g., `{prefix}Phase1Data`) for phases without splits.

4. **Register in roadmapData:**

```javascript
const roadmapData = {
  // ... existing entries
  '{slug}': {name}Phases,
};
```

---

## Step 6: Verify

Run these commands to verify the roadmap builds correctly:

```bash
# Build the project (must pass)
cd /Users/zinka/AI_Projects/Learning/javascript-roadmap && npm run build

# Verify file count
ls -la src/data/{directory}/
```

Expected: Build succeeds with no errors. All phase files exist in the directory.

---

## Step 7: Test in Browser

Start the dev server and verify the roadmap appears:

```bash
cd /Users/zinka/AI_Projects/Learning/javascript-roadmap && npm run dev
```

Navigate to `http://localhost:3000` and verify:
- [ ] Roadmap appears on the home page
- [ ] Clicking the roadmap shows all phases
- [ ] Clicking a phase shows all topics
- [ ] Clicking a topic shows the full content (explanation, code, exercises, etc.)

---

## Reference: Existing Roadmaps

| Slug | Phases | Files | Topics | Split Files |
|------|--------|-------|--------|-------------|
| `javascript` | 5 (+ 2 split) | 7 | ~25 | `phase1b.js`, `phase2b.js` |
| `typescript` | 4 | 4 | ~20 | _(none)_ |
| `dsa` | 5 (+ 4 split) | 9 | ~55 | `dsa-phase1b.js` through `dsa-phase4b.js` |
| `android-senior` | 12 (+ 1 split) | 13 | ~45 | `android-phase2b.js` |
| `react-native-senior` | 15 | 15 | ~50 | _(none)_ |
| `salesforce-developer` | 14 (+ 1 split) | 15 | ~40 | `sf-phase3b.js` |

---

## Execution Tips

1. **Batch creation:** Create 2-4 phase files per turn to maintain quality while making progress.
2. **ID uniqueness:** All topic IDs must be globally unique within the roadmap. Use descriptive kebab-case names.
3. **Phase IDs:** Always use `phase-{N}` format for the phase object's `id` field (e.g., `phase-1`, `phase-3b`).
4. **Code language:** Use the primary language of the roadmap topic for code examples. For non-coding roadmaps, use pseudocode or configuration examples.
5. **Split phases:** If a phase has 6+ topics, split into `phase{N}` (full object) and `phase{N}b` (bare array). Combine them in `index.js` using the spread pattern.
6. **Emojis:** Choose relevant emojis for each phase — they appear in the UI navigation.
7. **Consistency:** Reference existing roadmap files in `src/data/` for patterns when in doubt. The JavaScript roadmap is the oldest / simplest; the Salesforce roadmap is the most recent and most consistent.
