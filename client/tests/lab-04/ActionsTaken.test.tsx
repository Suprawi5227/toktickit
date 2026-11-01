import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionsTaken } from "../../src/components/ActionsTaken.js";
import { ActionTaken } from "../../src/api.js";

describe("Lab 4 Actions Taken UI Component", () => {
  const sampleActions: ActionTaken[] = [
    {
      id: 101,
      ticketId: 1,
      actionDateTime: "2026-11-01T10:30:00.000Z",
      description: "Tested power supply and replaced faulty battery cell.",
      result: "Battery charging properly, diagnostic pass.",
      performedById: 2,
      performer: {
        id: 2,
        name: "Kevin Patel",
        email: "kevin.patel@toktickit.com",
        role: "IT_STAFF",
      },
      followUpRequired: true,
      followUpNote: "Re-check battery health in 7 days.",
      attachmentNotes: "battery-diag-report.png",
      createdAt: "2026-11-01T10:35:00.000Z",
      updatedAt: "2026-11-01T10:35:00.000Z",
    },
    {
      id: 102,
      ticketId: 1,
      actionDateTime: "2026-11-01T11:15:00.000Z",
      description: "Updated WiFi firmware and verified signal strength.",
      result: "Connected with full bars.",
      performedById: 3,
      performer: {
        id: 3,
        name: "Lisa Martinez",
        email: "lisa.martinez@toktickit.com",
        role: "IT_STAFF",
      },
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
      createdAt: "2026-11-01T11:20:00.000Z",
      updatedAt: "2026-11-01T11:20:00.000Z",
    },
  ];

  it("UI-01: Renders Actions Taken list with date/time, performer badge, description, and follow-up pill (AC-01, FR-01)", () => {
    render(<ActionsTaken ticketId={1} initialActions={sampleActions} canEdit={true} />);

    // Check header and count badge
    expect(screen.getByText("Actions Taken")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Verify Performer badges
    expect(screen.getByText("Kevin Patel")).toBeInTheDocument();
    expect(screen.getByText("Lisa Martinez")).toBeInTheDocument();

    // Verify Descriptions & Results
    expect(
      screen.getByText("Tested power supply and replaced faulty battery cell.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Battery charging properly, diagnostic pass.")
    ).toBeInTheDocument();

    // Verify Follow-up badge and note
    expect(screen.getByText("Follow-Up Required")).toBeInTheDocument();
    expect(screen.getByText("Re-check battery health in 7 days.")).toBeInTheDocument();

    // Verify None pill for action without follow-up
    expect(screen.getByText("None")).toBeInTheDocument();

    // Verify Attachment reference note
    expect(screen.getByText(/battery-diag-report.png/i)).toBeInTheDocument();
  });

  it("UI-02: Add Action modal form enforces followUpNote when followUpRequired is checked (AC-02, FR-03)", async () => {
    render(<ActionsTaken ticketId={1} initialActions={[]} canEdit={true} />);

    // Click "+ Add Action Taken" button to open modal
    const addBtn = screen.getByRole("button", { name: /\+ Add Action Taken/i });
    fireEvent.click(addBtn);

    // Modal should be visible
    expect(screen.getByText("Add Action Taken")).toBeInTheDocument();

    // Fill Description and Result
    const descInput = screen.getByLabelText(/Description/i);
    const resultInput = screen.getByLabelText(/Result/i);
    fireEvent.change(descInput, { target: { value: "Inspected network switch" } });
    fireEvent.change(resultInput, { target: { value: "Replaced port 4 patch cord" } });

    // Check "Follow-up Required" checkbox
    const followUpCheckbox = screen.getByLabelText(/Follow-up Required/i);
    fireEvent.click(followUpCheckbox);

    // Validation warning should appear and submit button should be disabled
    expect(
      screen.getByText(/Follow-up note is required when follow-up is requested/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Save Action/i });
    expect(submitBtn).toBeDisabled();

    // Enter note into follow-up note field
    const noteInput = screen.getByLabelText(/Follow-up Note/i);
    fireEvent.change(noteInput, { target: { value: "Verify link lights tomorrow" } });

    // Validation warning disappears and submit button becomes enabled
    expect(
      screen.queryByText(/Follow-up note is required when follow-up is requested/i)
    ).not.toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
  });

  it("UI-03: Requester view renders read-only timeline without Add/Edit buttons (AC-03, FR-04)", () => {
    render(<ActionsTaken ticketId={1} initialActions={sampleActions} canEdit={false} />);

    // Add button must NOT be present
    expect(
      screen.queryByRole("button", { name: /\+ Add Action Taken/i })
    ).not.toBeInTheDocument();

    // Edit buttons must NOT be present
    expect(screen.queryByRole("button", { name: /Edit/i })).not.toBeInTheDocument();

    // Data must still be rendered in read-only format
    expect(screen.getByText("Kevin Patel")).toBeInTheDocument();
    expect(
      screen.getByText("Tested power supply and replaced faulty battery cell.")
    ).toBeInTheDocument();
    expect(screen.getByText("Follow-Up Required")).toBeInTheDocument();
  });

  it("UI-04: Empty state renders cleanly when ticket has zero actions taken (AC-13)", () => {
    render(<ActionsTaken ticketId={1} initialActions={[]} canEdit={true} />);

    // Empty state placeholder should render cleanly
    expect(
      screen.getByText(/No actions taken recorded yet/i)
    ).toBeInTheDocument();

    // Count badge displays 0
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
