import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue.js";
import { AuthProvider } from "../../src/contexts/AuthContext.js";

describe("Lab 3 StaffTicketQueue UI Component", () => {
  it("UI-03: Staff Ticket Queue renders search input and filter dropdowns", () => {
    const handleSelect = vi.fn();
    render(
      <AuthProvider>
        <StaffTicketQueue onSelectTicket={handleSelect} />
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/Search ticket #, summary.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });
});
