import React, { useEffect, useState } from "react";
import { getMyTickets, Ticket } from "../api.js";

interface MyTicketsProps {
  requesterId: number;
  onViewTicket: (id: number) => void;
}

export function MyTickets({ requesterId, onViewTicket }: MyTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    async function loadTickets() {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyTickets(requesterId, page, appliedSearch);
        setTickets(res.data);
        setTotalPages(res.meta.totalPages);
        
        // Safety check if we delete items and land on empty page
        if (page > res.meta.totalPages && res.meta.totalPages > 0) {
          setPage(res.meta.totalPages);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [requesterId, page, appliedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    setAppliedSearch(searchInput);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return "badge bg-danger";
      case "HIGH": return "badge bg-warning text-dark";
      case "MEDIUM": return "badge bg-primary";
      default: return "badge bg-secondary";
    }
  };

  return (
    <div className="tab-content-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 mb-0 text-secondary">My Recent Tickets</h3>
        
        <form onSubmit={handleSearch} className="d-flex" style={{ maxWidth: "300px" }}>
          <input 
            type="text" 
            className="form-control me-2" 
            placeholder="Search tickets..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-secondary">Search</button>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
            <tr>
              <th>Ticket No.</th>
              <th>Summary</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm me-2 text-success" role="status"></div>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                  {searchInput ? "No tickets match your search." : "You have no tickets yet."}
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td><strong>{ticket.ticketNumber}</strong></td>
                  <td>{ticket.summary}</td>
                  <td>{ticket.category?.name || "-"}</td>
                  <td><span className={getPriorityBadge(ticket.requestedPriority)}>{ticket.requestedPriority}</span></td>
                  <td><span className="badge bg-secondary">{ticket.status}</span></td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onViewTicket(ticket.id)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="text-muted">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <div className="btn-group">
          <button 
            className="btn btn-outline-secondary" 
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button 
            className="btn btn-outline-secondary" 
            disabled={page >= totalPages || loading}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
