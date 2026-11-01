import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { useRequester } from "./contexts/RequesterContext.js";
import { useAuth } from "./contexts/AuthContext.js";
import RequesterSelector from "./components/RequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { RequesterDashboard } from "./components/RequesterDashboard.js";
import { StaffDashboard } from "./components/StaffDashboard.js";
import { StaffTicketQueue } from "./components/StaffTicketQueue.js";
import { StaffTicketDetail } from "./components/StaffTicketDetail.js";
import { UserManagement } from "./components/UserManagement.js";

type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // Outside AuthProvider in test environments
  }
  const authUser = authContext?.user ?? null;
  const logout = authContext?.logout;

  const [state, setState] = useState<UiState>("idle");
  const [tab, setTab] = useState<"dashboard" | "list" | "create">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { requester, setRequester } = useRequester();

  // IT Staff & Admin navigation & drill-down state (AC-14 & Issue #62)
  const [staffTab, setStaffTab] = useState<"dashboard" | "queue" | "users">("dashboard");
  const [selectedStaffTicketId, setSelectedStaffTicketId] = useState<number | null>(null);
  const [queueFilter, setQueueFilter] = useState<{ status: string; owner: string }>({
    status: "ALL",
    owner: "all",
  });

  const handleStaffDrillDown = (filter: {
    status?: string;
    assignment?: string;
    unassigned?: boolean;
  }) => {
    setSelectedStaffTicketId(null);
    if (filter.unassigned) {
      setQueueFilter({ status: "ALL", owner: "unassigned" });
    } else if (filter.assignment === "ME") {
      setQueueFilter({ status: "ALL", owner: "mine" });
    } else if (filter.status) {
      setQueueFilter({ status: filter.status, owner: "all" });
    }
    setStaffTab("queue");
  };

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

  // 1. If logged in as IT Staff or Admin, render Staff Portal shell (Issue #62)
  if (authUser && (authUser.role === "IT_STAFF" || authUser.role === "ADMIN")) {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark mb-4 shadow-sm"
          style={{ backgroundColor: "#006B3C" }}
        >
          <div className="container-fluid px-4">
            <span className="navbar-brand fw-bold mb-0 h1">
              TokTickIT <span className="badge bg-light text-success ms-1 fs-6">Service Desk</span>
            </span>
            <div className="d-flex align-items-center gap-3">
              <span className="text-white">
                Hello, <strong>{authUser.name}</strong>{" "}
                <span className="badge bg-light text-dark ms-1">
                  {authUser.role === "ADMIN" ? "Admin" : "IT Staff"}
                </span>
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => logout?.()}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container-fluid px-4">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  staffTab === "dashboard" && selectedStaffTicketId === null
                    ? "active fw-bold text-success"
                    : "text-secondary"
                }`}
                onClick={() => {
                  setStaffTab("dashboard");
                  setSelectedStaffTicketId(null);
                }}
                style={{ cursor: "pointer", background: "none", border: "none" }}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  staffTab === "queue" || selectedStaffTicketId !== null
                    ? "active fw-bold text-success"
                    : "text-secondary"
                }`}
                onClick={() => {
                  setStaffTab("queue");
                  setSelectedStaffTicketId(null);
                }}
                style={{ cursor: "pointer", background: "none", border: "none" }}
              >
                Ticket Queue
              </button>
            </li>
            {authUser.role === "ADMIN" && (
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    staffTab === "users" ? "active fw-bold text-success" : "text-secondary"
                  }`}
                  onClick={() => {
                    setStaffTab("users");
                    setSelectedStaffTicketId(null);
                  }}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  User Management
                </button>
              </li>
            )}
          </ul>

          {staffTab === "dashboard" && selectedStaffTicketId === null ? (
            <StaffDashboard
              onDrillDown={handleStaffDrillDown}
              onSelectTicket={(id) => {
                setSelectedStaffTicketId(id);
                setStaffTab("queue");
              }}
              onMyQueue={() => {
                setQueueFilter({ status: "ALL", owner: "mine" });
                setStaffTab("queue");
                setSelectedStaffTicketId(null);
              }}
            />
          ) : staffTab === "users" && authUser.role === "ADMIN" ? (
            <UserManagement />
          ) : selectedStaffTicketId !== null ? (
            <StaffTicketDetail
              ticketId={selectedStaffTicketId}
              onBack={() => setSelectedStaffTicketId(null)}
            />
          ) : (
            <StaffTicketQueue
              onSelectTicket={(id) => setSelectedStaffTicketId(id)}
              initialStatus={queueFilter.status}
              initialOwner={queueFilter.owner}
            />
          )}
        </div>
      </div>
    );
  }

  // 2. Requester / Development Requester Shell
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
                  className={`nav-link ${tab === "dashboard" && selectedTicketId === null ? "active fw-bold text-success" : "text-secondary"}`} 
                  onClick={() => { setTab("dashboard"); setSelectedTicketId(null); }}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${tab === "list" && selectedTicketId === null ? "active fw-bold text-success" : "text-secondary"}`} 
                  onClick={() => { setTab("list"); setSelectedTicketId(null); }}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  My Tickets
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${tab === "create" ? "active fw-bold text-success" : "text-secondary"}`} 
                  onClick={() => { setTab("create"); setSelectedTicketId(null); }}
                  style={{ cursor: "pointer", background: "none", border: "none" }}
                >
                  Create Ticket
                </button>
              </li>
            </ul>

            {selectedTicketId !== null ? (
              <TicketDetail ticketId={selectedTicketId} requesterId={requester.id} onBack={() => setSelectedTicketId(null)} />
            ) : tab === "dashboard" ? (
              <RequesterDashboard
                onSelectTicket={(id) => setSelectedTicketId(id)}
                onCreateTicket={() => setTab("create")}
                onViewMyTickets={() => setTab("list")}
              />
            ) : tab === "list" ? (
              <MyTickets requesterId={requester.id} onViewTicket={(id) => setSelectedTicketId(id)} />
            ) : (
              <CreateTicketForm
                requesterId={requester.id}
                categories={categories}
                onSuccess={(ticketNo) => {
                  alert(`Ticket Created! ID: ${ticketNo}`);
                  setTab("list");
                  setSelectedTicketId(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
