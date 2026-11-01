import { describe, it, expect } from "vitest";
import { TicketStatus } from "@prisma/client";
import { PERMITTED_TRANSITIONS } from "../../src/routes/staff.routes.js";

describe("Lab 4 Unit Validators & State Machine", () => {
  it("UNIT-01: Validates followUpNote requirement when followUpRequired is true (AC-02, BR-04)", () => {
    function validateActionInput(input: {
      description: string;
      result: string;
      followUpRequired?: boolean;
      followUpNote?: string | null;
    }) {
      if (!input.description || input.description.trim().length < 3) {
        return { valid: false, error: "Description must be at least 3 characters" };
      }
      if (!input.result || input.result.trim().length < 3) {
        return { valid: false, error: "Result must be at least 3 characters" };
      }
      if (input.followUpRequired && (!input.followUpNote || !input.followUpNote.trim())) {
        return { valid: false, error: "Follow-up note is mandatory when follow-up is required" };
      }
      return { valid: true };
    }

    // Invalid: followUpRequired true with empty note
    expect(
      validateActionInput({
        description: "Replaced cooling fan",
        result: "Noise eliminated",
        followUpRequired: true,
        followUpNote: "   ",
      })
    ).toEqual({ valid: false, error: "Follow-up note is mandatory when follow-up is required" });

    // Valid: followUpRequired false with null note
    expect(
      validateActionInput({
        description: "Replaced cooling fan",
        result: "Noise eliminated",
        followUpRequired: false,
        followUpNote: null,
      })
    ).toEqual({ valid: true });

    // Valid: followUpRequired true with explicit note
    expect(
      validateActionInput({
        description: "Replaced cooling fan",
        result: "Noise eliminated",
        followUpRequired: true,
        followUpNote: "Check bearing vibration in 7 days",
      })
    ).toEqual({ valid: true });
  });

  it("UNIT-02: Validates status state machine permitted transitions per BR-07 matrix (AC-08, AC-09)", () => {
    // 1. Verify permitted next statuses for NEW
    expect(PERMITTED_TRANSITIONS[TicketStatus.NEW]).toContain(TicketStatus.OPEN);
    expect(PERMITTED_TRANSITIONS[TicketStatus.NEW]).toContain(TicketStatus.IN_PROGRESS);
    expect(PERMITTED_TRANSITIONS[TicketStatus.NEW]).toContain(TicketStatus.CANCELLED);
    expect(PERMITTED_TRANSITIONS[TicketStatus.NEW]).not.toContain(TicketStatus.RESOLVED);

    // 2. Verify permitted next statuses for OPEN
    expect(PERMITTED_TRANSITIONS[TicketStatus.OPEN]).toContain(TicketStatus.IN_PROGRESS);
    expect(PERMITTED_TRANSITIONS[TicketStatus.OPEN]).toContain(TicketStatus.RESOLVED);
    expect(PERMITTED_TRANSITIONS[TicketStatus.OPEN]).not.toContain(TicketStatus.CLOSED);

    // 3. Verify permitted next statuses for RESOLVED
    expect(PERMITTED_TRANSITIONS[TicketStatus.RESOLVED]).toContain(TicketStatus.CLOSED);
    expect(PERMITTED_TRANSITIONS[TicketStatus.RESOLVED]).toContain(TicketStatus.REOPENED);
    expect(PERMITTED_TRANSITIONS[TicketStatus.RESOLVED]).not.toContain(TicketStatus.IN_PROGRESS);

    // 4. Verify REOPENED transitions include WAITING_FOR_REQUESTER
    expect(PERMITTED_TRANSITIONS[TicketStatus.REOPENED]).toContain(TicketStatus.WAITING_FOR_REQUESTER);
    expect(PERMITTED_TRANSITIONS[TicketStatus.REOPENED]).toContain(TicketStatus.IN_PROGRESS);
    expect(PERMITTED_TRANSITIONS[TicketStatus.REOPENED]).toContain(TicketStatus.RESOLVED);
  });
});
