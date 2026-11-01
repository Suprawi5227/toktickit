import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RequesterDashboard } from "../../src/components/RequesterDashboard.js";

describe("Lab 4 Requester Dashboard UI Component", () => {
  const sampleData = {
    metrics: {
      totalOpen: 3,
      inProgressCount: 2,
      waitingOnMeCount: 1,
      resolvedCount: 5,
      closedCount: 12,
    },
    recentTickets: [
      {
        id: 201,
        ticketNo: "TXT-2025-001230",
        summary: "Intermittent Wi-Fi disconnects in Science building",
        status: "RESOLVED",
        createdAt: "2026-11-01T08:00:00.000Z",
      },
      {
        id: 202,
        ticketNo: "TXT-2025-001234",
        summary: "Laptop battery drains quickly",
        status: "IN_PROGRESS",
        createdAt: "2026-11-01T09:00:00.000Z",
      },
    ],
  };

  const zeroData = {
    metrics: {
      totalOpen: 0,
      inProgressCount: 0,
      waitingOnMeCount: 0,
      resolvedCount: 0,
      closedCount: 0,
    },
    recentTickets: [],
  };

  it("UI-12: Renders 4 requester metric cards (Open, Waiting on Me, Resolved, Closed) matching waitingOnMeCount and personal ticket metrics (AC-12, FR-10)", () => {
    render(<RequesterDashboard initialData={sampleData} />);

    // 4 metric cards
    const openCard = screen.getByTestId("metric-open");
    expect(within(openCard).getByText("Open")).toBeInTheDocument();
    expect(within(openCard).getByText("3")).toBeInTheDocument();

    const waitingCard = screen.getByTestId("metric-waiting-on-me");
    expect(within(waitingCard).getByText("Waiting on Me")).toBeInTheDocument();
    expect(within(waitingCard).getByText("1")).toBeInTheDocument();

    const resolvedCard = screen.getByTestId("metric-resolved");
    expect(within(resolvedCard).getByText("Resolved")).toBeInTheDocument();
    expect(within(resolvedCard).getByText("5")).toBeInTheDocument();

    const closedCard = screen.getByTestId("metric-closed");
    expect(within(closedCard).getByText("Closed")).toBeInTheDocument();
    expect(within(closedCard).getByText("12")).toBeInTheDocument();
  });

  it("UI-13: Handles zero-ticket counts gracefully rendering numeric 0 without breaking (AC-13, BR-13)", () => {
    render(<RequesterDashboard initialData={zeroData} />);

    // Renders numeric 0 for all metric cards
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThanOrEqual(4);

    // Empty state message renders cleanly
    expect(screen.getByText(/No recent tickets found/i)).toBeInTheDocument();
  });

  it("UI-14: Renders recent tickets table with direct link to Ticket Detail view (FR-10)", () => {
    const handleSelect = vi.fn();
    const handleCreate = vi.fn();
    const handleViewTickets = vi.fn();

    render(
      <RequesterDashboard
        initialData={sampleData}
        onSelectTicket={handleSelect}
        onCreateTicket={handleCreate}
        onViewMyTickets={handleViewTickets}
      />
    );

    // Recent Tickets table
    expect(screen.getByText("My Recent Tickets")).toBeInTheDocument();
    expect(screen.getByText("TXT-2025-001230")).toBeInTheDocument();
    expect(screen.getByText("Intermittent Wi-Fi disconnects in Science building")).toBeInTheDocument();
    expect(screen.getByText("TXT-2025-001234")).toBeInTheDocument();

    // Click "View" button for first ticket
    const viewButtons = screen.getAllByRole("button", { name: /^View$/i });
    expect(viewButtons.length).toBe(2);
    fireEvent.click(viewButtons[0]);
    expect(handleSelect).toHaveBeenCalledWith(201);

    // Quick Actions
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Ticket/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View My Tickets/i })).toBeInTheDocument();

    // Click quick action buttons
    fireEvent.click(screen.getByRole("button", { name: /Create Ticket/i }));
    expect(handleCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /View My Tickets/i }));
    expect(handleViewTickets).toHaveBeenCalled();
  });
});
