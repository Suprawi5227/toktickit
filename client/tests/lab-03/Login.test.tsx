import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginScreen } from "../../src/components/LoginScreen.js";
import { AuthProvider } from "../../src/contexts/AuthContext.js";

describe("Lab 3 Login UI Component", () => {
  it("UI-01: Login screen renders email and password fields and submit button", () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    expect(screen.getByText(/Sign in to TokTickIT/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });
});
