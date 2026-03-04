# Testing Guide (Vitest) for This Project

Date: 2026-03-04  
Project: `interivew-roadmaps`

## Testing Framework Used

This project uses **Vitest** as the test runner.

Tooling in use:

- `vitest`: test runner and assertions
- `@vitejs/plugin-react`: React/JSX transform support in tests
- `jsdom`: browser-like DOM environment for component testing
- `@testing-library/react`: render/query React components
- `@testing-library/user-event`: simulate user interactions (click, type, etc.)
- `@testing-library/jest-dom`: DOM assertions (`toBeInTheDocument`, etc.)
- `@vitest/coverage-v8`: coverage provider for `vitest --coverage`

Project-specific configuration:

- Alias `@` resolves to `src/`
- Test file pattern is `src/**/*.test.{ts,tsx,js,jsx}`
- Global test setup file is `src/test/setup.ts`
- `esbuild` is configured to parse JSX in `.js` files because this codebase contains JSX in files like `src/components/Accordion.js`

## Steps to Run Test Cases

Install dependencies first:

```bash
bun install
```

Run all tests once:

```bash
bun run test
```

Run in watch mode:

```bash
bun run test:watch
```

Run with coverage:

```bash
bun run test:coverage
```

Run one specific test file:

```bash
bunx vitest run src/components/__tests__/Accordion.test.jsx
```

Run tests matching a name:

```bash
bunx vitest run -t "expands an item on click"
```

Important:

- Use `bun run test`, not `bun test`
- `bun test` runs Bun's own test runner and will not use this Vitest setup

## Files Written with Test Cases

Current test files added:

1. `src/data/__tests__/roadmaps.test.js`
Purpose:
   Validates roadmap metadata helpers:
   `getAllRoadmaps()` count and required fields, and `getRoadmapMeta(slug)` lookup.

2. `src/lib/careerforge/__tests__/schema.test.ts`
Purpose:
   Validates `CareerRoadmapSchema` for:
   valid payload acceptance, default value application, and invalid payload rejection.

3. `src/components/__tests__/Accordion.test.jsx`
Purpose:
   Validates Accordion UI behavior:
   render headers, expand on click, collapse on second click.

## How to Create Test Cases for New Files (Future)

Use these conventions for every new feature/file:

1. Place test files close to the source domain in `__tests__` folders.
Example:
   for `src/lib/foo/bar.ts` add `src/lib/foo/__tests__/bar.test.ts`

2. Follow naming:
   `<source-name>.test.ts`, `<source-name>.test.js`, `<source-name>.test.tsx`, or `<source-name>.test.jsx`

3. Import source via alias:
   `import x from "@/lib/foo/bar"`

4. Cover minimum scenarios for each new file:
   - happy path behavior
   - one edge case
   - one invalid/failure case (if applicable)

5. For utility and data functions:
   - assert exact outputs
   - assert invalid input handling
   - avoid relying on runtime side effects

6. For Zod/schema files:
   - test `parse` with valid data
   - test `safeParse` with invalid data
   - assert defaults and required fields

7. For React component files:
   - render with realistic props
   - assert visible UI output
   - simulate at least one interaction using `user-event`
   - assert post-interaction DOM state

8. Keep tests deterministic:
   - avoid network calls
   - avoid time-dependent behavior unless mocked
   - mock external dependencies when needed

## Starter Templates for New Tests

Utility/schema test template:

```ts
import { describe, expect, it } from "vitest";
import { myFn } from "@/lib/example/myFn";

describe("myFn", () => {
  it("returns expected result for valid input", () => {
    expect(myFn("input")).toBe("expected");
  });

  it("handles invalid input", () => {
    expect(() => myFn(null as never)).toThrow();
  });
});
```

Component test template:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText(/title/i)).toBeInTheDocument();
  });

  it("updates UI on user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText(/expanded content/i)).toBeInTheDocument();
  });
});
```

## Testing Commands Configured in `package.json`

- `test`: `vitest run`
- `test:watch`: `vitest`
- `test:coverage`: `vitest run --coverage`

## Source of Testing Setup

Configuration and setup files:

- `vitest.config.ts`
- `src/test/setup.ts`
- `package.json` (scripts)
