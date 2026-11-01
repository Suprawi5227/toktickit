import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { StaffDashboard } from "../../src/components/StaffDashboard.js";

describe("Lab 4 Staff Dashboard UI Component", () => {
  const sampleData = {
    metrics: {
      newCount: 4,
      openCount: 12,
      inProgressCount: 8,
      waitingRequesterCount: 5,
      myAssignedCount: 7,
      unassignedCount: 6,
    },
    priorityBreakdown: {
      urgent: 2,
      high: 8,
      medium: 15,
      low: 7,
    },
    recentTickets: [
      {
        id: 101,
        ticketNo: "TXT-2025-001234",
        summary: "Laptop battery drains quickly",
        status: "IN_PROGRESS",
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        id: 102,
        ticketNo: "TXT-2025-001233",
        summary: "Cannot connect to VPN",
        status: "OPEN",
        updatedAt: "2026-11-01T09:30:00.000Z",
      },
    ],
  };

  it("UI-09: Renders 5 metric cards with Zen Green theme (Unassigned, Open, In Progress, Waiting for Requester, Assigned to Me) matching unassignedCount and status metrics (AC-11, FR-09)", () => {
    render(<StaffDashboard initialData={sampleData} />);

    // Card 1: Unassigned
    const unassignedCard = screen.getByTestId("metric-unassigned");
    expect(within(unassignedCard).getByText("Unassigned")).toBeInTheDocument();
    expect(within(unassignedCard).getByText("6")).toBeInTheDocument();

    // Card 2: Open
    const openCard = screen.getByTestId("metric-open");
    expect(within(openCard).getByText("Open")).toBeInTheDocument();
    expect(within(openCard).getByText("12")).toBeInTheDocument();

    // Card 3: In Progress
    const inProgressCard = screen.getByTestId("metric-in-progress");
    expect(within(inProgressCard).getByText("In Progress")).toBeInTheDocument();
    expect(within(inProgressCard).getByText("8")).toBeInTheDocument();

    // Card 4: Waiting for Requester
    const waitingCard = screen.getByTestId("metric-waiting-requester");
    expect(within(waitingCard).getByText("Waiting for Requester")).toBeInTheDocument();
    expect(within(waitingCard).getByText("5")).toBeInTheDocument();

    // Card 5: Assigned to Me
    const assignedCard = screen.getByTestId("metric-assigned-to-me");
    expect(within(assignedCard).getByText("Assigned to Me")).toBeInTheDocument();
    expect(within(assignedCard).getByText("7")).toBeInTheDocument();
  });

  it("UI-10: Supports interactive drill-down navigation clicking metric cards to filter Ticket Queue (AC-14)", () => {
    const handleDrillDown = vi.fn();
    render(<StaffDashboard initialData={sampleData} onDrillDown={handleDrillDown} />);

    // Click Unassigned card
    const unassignedCard = screen.getByLabelText(/Filter queue by Unassigned/i);
    fireEvent.click(unassignedCard);
    expect(handleDrillDown).toHaveBeenCalledWith({ unassigned: true });

    // Keyboard navigation (Enter / Space per ui-spec.md Section 5)
    fireEvent.keyDown(unassignedCard, { key: "Enter", code: "Enter" });
    expect(handleDrillDown).toHaveBeenCalledWith({ unassigned: true });

    // Click In Progress card
    const inProgressCard = screen.getByLabelText(/Filter queue by In Progress/i);
    fireEvent.click(inProgressCard);
    expect(handleDrillDown).toHaveBeenCalledWith({ status: "IN_PROGRESS" });

    // Click Assigned to Me card
    const assignedCard = screen.getByLabelText(/Filter queue by Assigned to Me/i);
    fireEvent.click(assignedCard);
    expect(handleDrillDown).toHaveBeenCalledWith({ assignment: "ME" });

    // Keyboard navigation with Space
    fireEvent.keyDown(assignedCard, { key: " ", code: "Space" });
    expect(handleDrillDown).toHaveBeenCalledWith({ assignment: "ME" });
  });

  it("UI-11: Renders My Recent Tickets list with quick action buttons (FR-09)", () => {
    const handleSelect = vi.fn();
    const handleCreate = vi.fn();
    render(
      <StaffDashboard
        initialData={sampleData}
        onSelectTicket={handleSelect}
        onCreateTicket={handleCreate}
      />
    );

    // Recent Tickets
    expect(screen.getByText("My Recent Tickets")).toBeInTheDocument();
    expect(screen.getByText("TXT-2025-001234")).toBeInTheDocument();
    expect(screen.getByText("Laptop battery drains quickly")).toBeInTheDocument();

    // Click recent ticket
    fireEvent.click(screen.getByText("TXT-2025-001234"));
    expect(handleSelect).toHaveBeenCalledWith(101);

    // Quick Actions
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Ticket/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search Tickets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /My Queue/i })).toBeInTheDocument();

    // Click Create Ticket button
    fireEvent.click(screen.getByRole("button", { name: /Create Ticket/i }));
    expect(handleCreate).toHaveBeenCalled();
  });

  it("FR-11: Renders User Account Summary panel when userSummary data is provided for Admin", () => {
    const adminData = {
      ...sampleData,
      userSummary: {
        totalUsers: 15,
        activeUsers: 14,
        requesters: 10,
        staff: 4,
        admins: 1,
      },
    };

    render(<StaffDashboard initialData={adminData} />);

    expect(screen.getByTestId("user-summary-card")).toBeInTheDocument();
    expect(screen.getByText("User Account Summary")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Admin View")).toBeInTheDocument();
  });
});
