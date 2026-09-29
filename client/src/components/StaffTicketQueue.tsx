import { useState, useEffect } from "react";
import { Ticket, TicketsResponse, getStaffQueue } from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

interface StaffTicketQueueProps {
  onSelectTicket: (ticketId: number) => void;
}

export function StaffTicketQueue({ onSelectTicket }: StaffTicketQueueProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [itPriority, setItPriority] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadQueue(page: number = 1) {
    setLoading(true);
    setError(null);
    try {
      const res: TicketsResponse = await getStaffQueue({
        search,
        status,
        itPriority,
        owner: ownerFilter,
        page,
      });
      setTickets(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue(1);
  }, [status, itPriority, ownerFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadQueue(1);
  }

  function getStatusBadge(st: string) {
    switch (st) {
      case "NEW": return <span className="badge bg-info text-dark">New</span>;
      case "OPEN": return <span className="badge bg-primary">Open</span>;
      case "IN_PROGRESS": return <span className="badge bg-warning text-dark">In Progress</span>;
      case "WAITING_FOR_REQUESTER": return <span className="badge bg-secondary">Waiting for Requester</span>;
      case "RESOLVED": return <span className="badge bg-success">Resolved</span>;
      case "CLOSED": return <span className="badge bg-dark">Closed</span>;
      case "CANCELLED": return <span className="badge bg-danger">Cancelled</span>;
      default: return <span className="badge bg-secondary">{st}</span>;
    }
  }

  function getPriorityBadge(p?: string) {
    if (!p) return <span className="badge bg-light text-muted border">Unset</span>;
    switch (p) {
      case "URGENT": return <span className="badge bg-danger">Urgent</span>;
      case "HIGH": return <span className="badge bg-warning text-dark">High</span>;
      case "MEDIUM": return <span className="badge bg-info text-dark">Medium</span>;
      case "LOW": return <span className="badge bg-light text-dark border">Low</span>;
      default: return <span className="badge bg-secondary">{p}</span>;
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 fw-bold text-success" style={{ color: "#006B3C" }}>
            IT Staff Ticket Queue
          </h5>
          <span className="badge bg-light text-dark border px-3 py-2">
            Total Tickets: {meta.totalItems}
          </span>
        </div>
      </div>

      <div className="card-body p-3">
        {/* Filters Toolbar */}
        <form onSubmit={handleSearchSubmit} className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search ticket #, summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2 col-6">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="col-md-2 col-6">
            <select className="form-select" value={itPriority} onChange={(e) => setItPriority(e.target.value)}>
              <option value="ALL">All IT Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="col-md-2 col-6">
            <select className="form-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="all">All Owners</option>
              <option value="unassigned">Unassigned Only</option>
              <option value="mine">Assigned to Me</option>
            </select>
          </div>
          <div className="col-md-2 col-6 d-grid">
            <button type="submit" className="btn btn-outline-success fw-bold">
              Search
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <div className="text-center py-5 text-muted">Loading queue data...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 bg-light rounded border text-muted">
            <i className="bi bi-inbox display-4 d-block mb-2"></i>
            No tickets match your search filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ticket #</th>
                  <th>Requester</th>
                  <th>Summary</th>
                  <th>Req. Priority</th>
                  <th>IT Priority</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-bold text-success">{t.ticketNumber}</td>
                    <td>{t.requester?.name || "Unknown"}</td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 280 }}>
                        {t.summary}
                      </div>
                      <small className="text-muted">{t.category?.name} • {t.relatedSystem?.name}</small>
                    </td>
                    <td>{getPriorityBadge(t.requestedPriority)}</td>
                    <td>{getPriorityBadge(t.itPriority)}</td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>
                      {t.owner ? (
                        <span className="badge bg-light text-dark border">{t.owner.name}</span>
                      ) : (
                        <span className="text-muted fst-italic small">Unassigned</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => onSelectTicket(t.id)}
                      >
                        View Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-muted">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={meta.page <= 1}
                onClick={() => loadQueue(meta.page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={meta.page >= meta.totalPages}
                onClick={() => loadQueue(meta.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
