const reactPhase11 = {
  id: "phase-11",
  title: "Phase 11: Testing React Apps",
  emoji: "🧪",
  description: "Ensure your code works as expected. Learn how to write unit, integration, and end-to-end tests for your React components.",
  topics: [
    {
      id: "react-testing-library",
      title: "React Testing Library & Vitest",
      explanation: `Testing in React has shifted from testing implementation details (like state or internal methods) to testing **User Behavior**. **React Testing Library (RTL)** is designed to help you test components as a user would.

**Vitest:**
The test runner (replacement for Jest). It is blazingly fast and shares the same configuration as Vite.

**The RTL Philosophy:**
Instead of checking \`wrapper.state('count')\`, you check \`screen.getByText(/count: 1/i)\`. If your test passes when you refactor the internal code but keep the UI behavior the same, you've written a good test.

**Common Queries:**
- \`getBy...\`: Fails if element not found. Use for things that *should* be there.
- \`queryBy...\`: Returns null if not found. Use for asserting something is *not* there.
- \`findBy...\`: Returns a promise. Use for async elements (like data from an API).`,
      codeExample: `// Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import Counter from './Counter';

test('increments counter when button is clicked', () => {
  // 1. Render the component
  render(<Counter />);

  // 2. Find elements (prefer user-centric queries)
  const button = screen.getByRole('button', { name: /increment/i });
  const countDisplay = screen.getByText(/current count: 0/i);

  // 3. Interact with the UI
  fireEvent.click(button);

  // 4. Assert the change
  expect(screen.getByText(/current count: 1/i)).toBeInTheDocument();
});

test('starts with a custom initial value', () => {
  render(<Counter initialValue={10} />);
  expect(screen.getByText(/current count: 10/i)).toBeInTheDocument();
});`,
      exercise: `1. Write tests for a 'LoginForm' component. Check that error messages appear when inputs are empty.
2. Build a 'Toggle' component and test that its label changes when clicked.
3. Use \`user-event\` instead of \`fireEvent\` to simulate more realistic user interactions (like typing).
4. Research 'Snapshots' and discuss why they are often considered a 'lazy' testing pattern.`,
      commonMistakes: [
        "Testing implementation details (like component state) instead of the UI.",
        "Using \`container.querySelector\` instead of RTL's built-in queries (which are more accessible).",
        "Not cleaning up tests (RTL does this automatically, but some setups might need manual cleanup).",
        "Writing tests that are too specific and break on every minor CSS change."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "What is the main philosophy of React Testing Library?",
          a: "The philosophy is to 'test your components as a user would'. This means interacting with the DOM nodes directly and asserting based on what the user sees, rather than checking the component's internal state or props."
        },
        {
          type: "conceptual",
          q: "When should you use findByRole instead of getByRole?",
          a: "You should use \`findByRole\` when the element you are looking for is rendered asynchronously (e.g., after an API call or a timeout), as it returns a promise that resolves when the element appears."
        }
      ]
    },
    {
      id: "react-mocking-msw",
      title: "Mocking APIs with MSW",
      explanation: `You shouldn't hit real APIs in your unit tests. It makes tests slow, flaky, and dependent on a network connection.

**Mock Service Worker (MSW)** is the modern gold standard for mocking. Instead of mocking the \`fetch\` function itself, MSW intercepts the network requests at the browser/node level and returns your mock data.

**Why MSW is better:**
1. **Realistic:** Your component makes a real network request.
2. **Reuse:** The same mocks can be used for development, unit tests, and E2E tests.
3. **Resilient:** If you switch from \`fetch\` to \`axios\`, your tests won't break because the network layer is what's being mocked.`,
      codeExample: `// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({ name: 'Test User' })
  }),
]

// UserProfile.test.tsx
import { render, screen } from '@testing-library/react'
import UserProfile from './UserProfile'

test('loads and displays user data', async () => {
  render(<UserProfile />)

  // Use findBy to wait for the async MSW response
  const userName = await screen.findByText('Test User')
  expect(userName).toBeInTheDocument()
})`,
      exercise: `1. Set up MSW in a project and mock a GET request.
2. Write a test for a 'Failure' scenario (e.g., the API returns a 500 error) and ensure your component shows an error message.
3. Mock a POST request (like a form submission) and verify that the correct payload was sent.
4. Integrate MSW with 'TanStack Query' and see how it simplifies testing data-heavy components.`,
      commonMistakes: [
        "Mocking at the component level (like mocking the hook) instead of the network level.",
        "Forgetting to call \`server.listen()\` and \`server.close()\` in your test setup.",
        "Hardcoding full URLs in mocks that change between environments."
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "Why is MSW preferred over simple fetch mocking?",
          a: "MSW intercepts requests at the network level, making the tests more realistic. It allows the component to use its actual data-fetching logic (fetch, axios, etc.) without modification. It also makes it easier to test complex scenarios like network errors or slow responses."
        }
      ]
    }
  ]
};

export default reactPhase11;
