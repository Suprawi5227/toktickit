import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { useRequester } from "./contexts/RequesterContext.js";
import RequesterSelector from "./components/RequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTickets } from "./components/MyTickets.js";

type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [tab, setTab] = useState<"list" | "create">("list");
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
        {state !== "success" ? (
          <div className="alert alert-warning">
            Please run the System Check on the login page to load categories before creating a ticket.
            <br />
            <button className="btn btn-warning btn-sm mt-2" onClick={() => setRequester(null)}>Go Back</button>
          </div>
        ) : (
          <>
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${tab === "list" ? "active fw-bold text-success" : "text-secondary"}`} 
                  onClick={() => setTab("list")}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  My Tickets
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${tab === "create" ? "active fw-bold text-success" : "text-secondary"}`} 
                  onClick={() => setTab("create")}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  Create Ticket
                </button>
              </li>
            </ul>

            {tab === "list" ? (
              <MyTickets requesterId={requester.id} />
            ) : (
              <CreateTicketForm
                requesterId={requester.id}
                categories={categories}
                onSuccess={(ticketNo) => {
                  alert(`Ticket Created! ID: ${ticketNo}`);
                  setTab("list");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
