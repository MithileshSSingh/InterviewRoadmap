import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackWidget from "@/components/FeedbackWidget";

// Mock fetch
global.fetch = vi.fn();
const mockedFetch = vi.mocked(global.fetch);

describe("FeedbackWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the floating feedback button", () => {
    render(
      <FeedbackWidget>
        <div>App content</div>
      </FeedbackWidget>,
    );

    const fab = screen.getByTestId("feedback-fab");
    expect(fab).toBeInTheDocument();
  });

  it("opens the modal when fab is clicked", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackWidget>
        <div>App content</div>
      </FeedbackWidget>,
    );

    await user.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Send Feedback" })).toBeInTheDocument();
  });

  it("closes the modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackWidget>
        <div>App content</div>
      </FeedbackWidget>,
    );

    await user.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByText("✕"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits feedback and shows success message", async () => {
    mockedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, feedbackId: "fb_123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const user = userEvent.setup();
    render(
      <FeedbackWidget>
        <div>App content</div>
      </FeedbackWidget>,
    );

    // Open modal
    await user.click(screen.getByTestId("feedback-fab"));

    // Fill message (must be >= 10 chars)
    const textarea = screen.getByPlaceholderText(/describe your feedback/i);
    await user.type(textarea, "This is a test feedback message with enough characters.");

    // Find submit button inside the form
    const submitBtn = screen.getByText("Send Feedback", { selector: "button" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/thanks for your feedback/i)).toBeInTheDocument();
    });

    expect(mockedFetch).toHaveBeenCalledOnce();
    const fetchCall = mockedFetch.mock.calls[0];
    expect(fetchCall[0]).toBe("/api/feedback");
  });
});
