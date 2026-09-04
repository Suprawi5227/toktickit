import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { useRequester } from "./contexts/RequesterContext.js";
import RequesterSelector from "./components/RequesterSelector.js";

type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const { requester, setRequester } = useRequester();

  async function handleCheck() {
    setState("loading");
    try {
      const result = await checkSystem();
      setCategories(result.categories);
      setState("success");
    } catch (err) {
      setState("error");
    }
  }

  if (!requester) {
    return (
      <>
        <div className="container py-3" style={{ maxWidth: 640 }}>
          <h1 className="h3 mb-0 text-center">
            TokTickIT <span className="text-success">IT Service Desk</span>
          </h1>
        </div>
        
        <RequesterSelector />
        
        <div className="container mt-5" style={{ maxWidth: 640 }}>
          <hr />
          <h2 className="h6 text-muted mb-3">Lab 1: System Check</h2>
          <button className="btn btn-outline-secondary btn-sm mb-3" onClick={handleCheck} disabled={state === "loading"}>
            {state === "loading" ? "Loading…" : "Check System"}
          </button>
          
          {state === "success" && (
            <div className="alert alert-success py-2">
              <strong>Online</strong> - TokTickIT API is running.
              <ul className="mb-0 mt-1">
                {categories.map((cat) => (
                  <li key={cat.id}>{cat.name}</li>
                ))}
              </ul>
            </div>
          )}
          {state === "error" && (
            <div className="alert alert-danger py-2">
              <strong>Offline</strong> - Backend is currently unavailable.
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1">TokTickIT Service Desk</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              Hello, <strong>{requester.name}</strong>
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setRequester(null)}
            >
              Change Requester
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="alert alert-info">
          Welcome to the IT Service Desk. (Create Ticket and My Tickets UI will be implemented in upcoming issues.)
        </div>
      </div>
    </div>
  );
}
