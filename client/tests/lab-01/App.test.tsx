import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import { RequesterProvider } from "../../src/contexts/RequesterContext.js";

describe("App", () => {
  // WORKED EXAMPLE — provided for you.
  it("renders the TokTickIT heading", async () => {
    vi.spyOn(api, "getRequesters").mockResolvedValue([]);
    render(
      <RequesterProvider>
        <App />
      </RequesterProvider>
    );
    expect(await screen.findByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows Online and the seeded categories on success", async () => {
    vi.spyOn(api, "getRequesters").mockResolvedValue([]);
    vi.spyOn(api, "checkSystem").mockResolvedValue({
      online: true,
      categories: [
        { id: 1, name: "Hardware" },
        { id: 2, name: "Software" }
      ]
    });
    render(
      <RequesterProvider>
        <App />
      </RequesterProvider>
    );
    const button = screen.getByText("Check System");
    button.click();
    expect(await screen.findByText(/Online/i)).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
  });

  it("shows an Offline error message when the API is unavailable", async () => {
    vi.spyOn(api, "getRequesters").mockResolvedValue([]);
    vi.spyOn(api, "checkSystem").mockRejectedValue(new Error("Unable to connect"));
    render(
      <RequesterProvider>
        <App />
      </RequesterProvider>
    );
    const button = screen.getByText("Check System");
    button.click();
    expect(await screen.findByText(/Offline/i)).toBeInTheDocument();
  });
});
