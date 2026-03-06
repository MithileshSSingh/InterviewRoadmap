import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FeedbackWidget from "@/components/FeedbackWidget";

describe("FeedbackWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens modal and submits successfully", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, feedbackId: "fb_1" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<FeedbackWidget />);

    await user.click(screen.getByRole("button", { name: /Feedback/i }));
    expect(screen.getByRole("dialog", { name: /Submit feedback/i })).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: /Message/i }),
      "The roadmap UI is clear and easy to follow.",
    );

    await user.click(screen.getByRole("button", { name: /Submit feedback/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Thanks for the feedback/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /Submit feedback/i }),
      ).not.toBeInTheDocument();
    });
  });
});
