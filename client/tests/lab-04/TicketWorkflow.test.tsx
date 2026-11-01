import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffTicketDetail } from "../../src/components/StaffTicketDetail.js";
import { TicketDetail } from "../../src/components/TicketDetail.js";
import { AuthContext } from "../../src/contexts/AuthContext.js";
import * as api from "../../src/api.js";

// Mock API functions
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    getTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    indicateTicketResolved: vi.fn(),
    getPublicComments: vi.fn().mockResolvedValue([]),
    getInternalNotes: vi.fn().mockResolvedValue([]),
    getAdminUsers: vi.fn().mockResolvedValue({ data: [] }),
    deleteAttachment: vi.fn(),
  };
});

describe("Lab 4 Ticket Workflow UI Component (TDD Scaffolding)", () => {
  const mockStaffUser = {
    id: 2,
    username: "alice_it",
    name: "Alice Smith",
    email: "alice@toktickit.com",
    role: "IT_STAFF" as const,
    token: "staff-token",
  };

  const renderStaffTicketDetail = (ticket: any) => {
    return render(
      <AuthContext.Provider
        value={{
          user: mockStaffUser,
          loading: false,
          login: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
        }}
      >
        <StaffTicketDetail ticketId={ticket.id} onBack={vi.fn()} initialTicket={ticket} />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-05: Status transition selector displays only permitted transitions per BR-07 (AC-08, FR-06)", () => {
    // 1. Ticket in NEW status
    const newTicket: any = {
      id: 101,
      ticketNumber: "TXT-2025-001",
      summary: "New Printer Issue",
      description: "Testing status transitions",
      status: "NEW",
      ownerId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { unmount } = renderStaffTicketDetail(newTicket);

    const select = screen.getByTestId("status-select") as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((opt) => opt.value);

    // Permitted for NEW: NEW, OPEN, IN_PROGRESS, CANCELLED
    expect(optionValues).toContain("NEW");
    expect(optionValues).toContain("OPEN");
    expect(optionValues).toContain("IN_PROGRESS");
    expect(optionValues).toContain("CANCELLED");

    // Illegal transitions for NEW must NOT be in options
    expect(optionValues).not.toContain("RESOLVED");
    expect(optionValues).not.toContain("CLOSED");
    expect(optionValues).not.toContain("REOPENED");

    unmount();

    // 2. Ticket in RESOLVED status
    const resolvedTicket: any = {
      id: 102,
      ticketNumber: "TXT-2025-002",
      summary: "Resolved Laptop Issue",
      description: "Testing resolved transitions",
      status: "RESOLVED",
      ownerId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    renderStaffTicketDetail(resolvedTicket);

    const resolvedSelect = screen.getByTestId("status-select") as HTMLSelectElement;
    const resolvedOptions = Array.from(resolvedSelect.options).map((opt) => opt.value);

    // Permitted for RESOLVED: RESOLVED, CLOSED, REOPENED
    expect(resolvedOptions).toContain("RESOLVED");
    expect(resolvedOptions).toContain("CLOSED");
    expect(resolvedOptions).toContain("REOPENED");

    // Illegal transitions for RESOLVED must NOT be in options
    expect(resolvedOptions).not.toContain("OPEN");
    expect(resolvedOptions).not.toContain("IN_PROGRESS");
    expect(resolvedOptions).not.toContain("WAITING_FOR_REQUESTER");
  });

  it("UI-06: Requester sees 'Problem Appears Resolved' button; IT Staff sees Advisory Banner when indicated (AC-07, BR-09)", async () => {
    // 1. Requester View: Ticket active and not indicated
    const requesterTicket: any = {
      id: 201,
      ticketNumber: "TXT-2025-003",
      summary: "Requester Monitor Glitch",
      description: "Monitor flickers",
      status: "IN_PROGRESS",
      requestedPriority: "MEDIUM",
      requesterResolvedInd: false,
      requester: { id: 10, name: "Bob", email: "bob@example.com" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(window, "prompt").mockReturnValue("Monitor is fixed, thank you");
    vi.mocked(api.indicateTicketResolved).mockResolvedValueOnce({
      ...requesterTicket,
      requesterResolvedInd: true,
    });

    const { unmount } = render(
      <TicketDetail ticketId={201} requesterId={10} onBack={vi.fn()} initialTicket={requesterTicket} />
    );

    const indicateBtn = screen.getByTestId("indicate-resolved-btn");
    expect(indicateBtn).toBeInTheDocument();
    expect(indicateBtn).toHaveTextContent("Problem Appears Resolved");

    fireEvent.click(indicateBtn);

    await waitFor(() => {
      expect(api.indicateTicketResolved).toHaveBeenCalledWith(201, "Monitor is fixed, thank you");
    });

    unmount();

    // 2. IT Staff View: Ticket with requesterResolvedInd = true
    const staffTicketWithAdvisory: any = {
      id: 201,
      ticketNumber: "TXT-2025-003",
      summary: "Requester Monitor Glitch",
      description: "Monitor flickers",
      status: "IN_PROGRESS",
      ownerId: 2,
      requesterResolvedInd: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    renderStaffTicketDetail(staffTicketWithAdvisory);

    const advisoryBanner = screen.getByTestId("advisory-banner");
    expect(advisoryBanner).toBeInTheDocument();
    expect(advisoryBanner).toHaveTextContent(/The requester indicated that this problem appears resolved/i);
    expect(screen.getByRole("button", { name: /Formally Resolve Ticket/i })).toBeInTheDocument();
  });

  it("UI-07: Reopened status displays Teal badge (#20C997) (Section 1)", () => {
    // 1. Check in StaffTicketDetail
    const reopenedStaffTicket: any = {
      id: 301,
      ticketNumber: "TXT-2025-004",
      summary: "Reopened Ticket",
      description: "Issue reoccurred",
      status: "REOPENED",
      ownerId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { unmount } = renderStaffTicketDetail(reopenedStaffTicket);
    const staffBadge = screen.getByTestId("ticket-status-badge");
    expect(staffBadge).toHaveTextContent("REOPENED");
    expect(staffBadge).toHaveStyle({ backgroundColor: "#20C997" });

    unmount();

    // 2. Check in TicketDetail (Requester View)
    const reopenedReqTicket: any = {
      id: 302,
      ticketNumber: "TXT-2025-005",
      summary: "Reopened Ticket for Requester",
      description: "Issue reoccurred",
      status: "REOPENED",
      requestedPriority: "HIGH",
      requester: { id: 10, name: "Bob", email: "bob@example.com" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TicketDetail ticketId={302} requesterId={10} onBack={vi.fn()} initialTicket={reopenedReqTicket} />
    );

    const reqBadge = screen.getByTestId("status-badge-reopened");
    expect(reqBadge).toHaveTextContent("REOPENED");
    expect(reqBadge).toHaveStyle({ backgroundColor: "#20C997" });
  });

  it("UI-08: Displays prominent alert banner prompting refresh when HTTP 409 Conflict occurs (AC-10, FR-08)", async () => {
    const activeTicket: any = {
      id: 401,
      ticketNumber: "TXT-2025-006",
      summary: "Concurrent edit ticket",
      description: "Testing 409 conflict detection",
      status: "OPEN",
      ownerId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: "2026-11-01T10:00:00.000Z",
    };

    const conflictError: any = new Error("This ticket was recently updated by another user");
    conflictError.status = 409;
    vi.mocked(api.updateTicketStatus).mockRejectedValueOnce(conflictError);

    renderStaffTicketDetail(activeTicket);

    const select = screen.getByTestId("status-select");
    fireEvent.change(select, { target: { value: "IN_PROGRESS" } });

    await waitFor(() => {
      const conflictAlert = screen.getByTestId("conflict-alert");
      expect(conflictAlert).toBeInTheDocument();
      expect(conflictAlert).toHaveTextContent(
        /This ticket was recently updated by another user\. Please refresh the page to view the latest status before making changes\./i
      );
      expect(screen.getByRole("button", { name: /Refresh Ticket/i })).toBeInTheDocument();
    });
  });
});
