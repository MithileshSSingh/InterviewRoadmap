import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Accordion from "@/components/Accordion";

const items = [
  {
    type: "conceptual",
    q: "What is a closure in JavaScript?",
    a: "A closure lets a function keep access to lexical scope.",
  },
  {
    type: "coding",
    q: "Write a simple debounce function.",
    a: "Use setTimeout and clearTimeout to delay invocation.",
  },
];

describe("Accordion", () => {
  it("renders all item headers", () => {
    render(<Accordion items={items} />);

    expect(
      screen.getByRole("button", { name: /What is a closure in JavaScript\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Write a simple debounce function\./i }),
    ).toBeInTheDocument();
  });

  it("expands an item on click and collapses it on second click", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const firstHeader = screen.getByRole("button", {
      name: /What is a closure in JavaScript\?/i,
    });

    expect(
      screen.queryByText(/A closure lets a function keep access to lexical scope\./i),
    ).not.toBeInTheDocument();

    await user.click(firstHeader);

    expect(
      screen.getByText(/A closure lets a function keep access to lexical scope\./i),
    ).toBeInTheDocument();

    await user.click(firstHeader);

    expect(
      screen.queryByText(/A closure lets a function keep access to lexical scope\./i),
    ).not.toBeInTheDocument();
  });
});
