import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import { RequesterProvider } from "../../src/contexts/RequesterContext.js";

// Stub browser globals
vi.stubGlobal("alert", vi.fn());
vi.stubGlobal("prompt", vi.fn());
vi.stubGlobal("confirm", vi.fn());

const mockCategories = [
  { id: 1, name: "Hardware", createdAt: "2023-01-01" },
  { id: 2, name: "Software", createdAt: "2023-01-01" },
];

const mockRequesters = [
  { id: 1, name: "Alice", email: "alice@example.com", isActive: true },
];

const mockTicket = {
  id: 1,
  ticketNo: "TK-0001",
  ticketNumber: "TK-0001",
  summary: "Test Ticket Summary",
  description: "Test Description",
  requestedPriority: "URGENT",
  status: "NEW",
  category: { name: "Hardware" },
  relatedSystem: { name: "System A" },
  requester: { name: "Alice", email: "alice@example.com" },
  createdAt: "2026-01-01T00:00:00.000Z",
  attachments: [
    {
      id: 1,
      originalName: "screenshot.png",
      size: 1024,
      mimeType: "image/png",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

/**
 * Helper: renders App, runs System Check (on the login page), then clicks
 * the Alice button to log in. After this, the main tabbed UI is visible.
 */
async function loginWithSystemCheck(user: ReturnType<typeof userEvent.setup>) {
  vi.spyOn(api, "getRequesters").mockResolvedValue(mockRequesters);
  vi.spyOn(api, "checkSystem").mockResolvedValue({
    online: true,
    categories: mockCategories,
  });

  render(
    <RequesterProvider>
      <App />
    </RequesterProvider>
  );

  // System Check button is on the login/landing page
  const checkBtn = await screen.findByRole("button", { name: /Check System/i });
  await user.click(checkBtn);

  // Verify system is online
  expect(await screen.findByText(/Online/i)).toBeInTheDocument();

  // Click Alice button to log in
  const aliceButton = await screen.findByText("Alice");
  await user.click(aliceButton);

  // Confirm we're in the main app (navbar shows Alice)
  expect(await screen.findByText(/My Tickets/i)).toBeInTheDocument();
}

describe("End-to-End User Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders TokTickIT heading and shows requester selection buttons", async () => {
    vi.spyOn(api, "getRequesters").mockResolvedValue(mockRequesters);
    vi.spyOn(api, "checkSystem").mockResolvedValue({
      online: true,
      categories: mockCategories,
    });

    render(
      <RequesterProvider>
        <App />
      </RequesterProvider>
    );

    expect(await screen.findByText(/TokTickIT/i)).toBeInTheDocument();
    // RequesterSelector renders a button per requester
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    // System check button is on the login page
    expect(screen.getByRole("button", { name: /Check System/i })).toBeInTheDocument();
  });

  it("runs System Check then selects a requester and shows main tabs", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getMyTickets").mockResolvedValue({
      success: true,
      data: [],
      meta: { totalItems: 0, limit: 10, page: 1, totalPages: 0 },
    });

    await loginWithSystemCheck(user);

    // Main tabs should now be visible
    expect(screen.getByRole("button", { name: /My Tickets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Ticket/i })).toBeInTheDocument();
  });

  it("shows ticket list after login and system check", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getMyTickets").mockResolvedValue({
      success: true,
      data: [mockTicket],
      meta: { totalItems: 1, limit: 10, page: 1, totalPages: 1 },
    });

    await loginWithSystemCheck(user);

    // Ticket should appear in the list
    expect(await screen.findByText("Test Ticket Summary")).toBeInTheDocument();
  });

  it("navigates to ticket detail view on clicking View", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getMyTickets").mockResolvedValue({
      success: true,
      data: [mockTicket],
      meta: { totalItems: 1, limit: 10, page: 1, totalPages: 1 },
    });
    const getTicketSpy = vi.spyOn(api, "getTicket").mockResolvedValue(mockTicket);

    await loginWithSystemCheck(user);

    // Click View button on the ticket row
    const viewButton = await screen.findByRole("button", { name: /View/i });
    await user.click(viewButton);

    // Should call getTicket(ticketId=1, requesterId=1)
    await waitFor(() => {
      expect(getTicketSpy).toHaveBeenCalledWith(1, 1);
    });

    // Ticket detail page should render all key info
    expect(await screen.findByText(/TK-0001/i)).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("screenshot.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to List/i })).toBeInTheDocument();
  });

  it("deletes an attachment from ticket detail with a reason prompt", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getMyTickets").mockResolvedValue({
      success: true,
      data: [mockTicket],
      meta: { totalItems: 1, limit: 10, page: 1, totalPages: 1 },
    });
    const getTicketSpy = vi.spyOn(api, "getTicket").mockResolvedValue(mockTicket);
    const deleteAttachmentSpy = vi.spyOn(api, "deleteAttachment").mockResolvedValue();
    vi.mocked(window.prompt).mockReturnValue("No longer needed");

    await loginWithSystemCheck(user);

    // Navigate to ticket detail
    const viewButton = await screen.findByRole("button", { name: /View/i });
    await user.click(viewButton);
    expect(await screen.findByText("screenshot.png")).toBeInTheDocument();

    // Delete attachment — should prompt for reason
    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalled();
      expect(deleteAttachmentSpy).toHaveBeenCalledWith(1, 1, "No longer needed");
      // Should re-fetch ticket details after deletion (called twice: initial load + after delete)
      expect(getTicketSpy).toHaveBeenCalledTimes(2);
    });
  });
});
