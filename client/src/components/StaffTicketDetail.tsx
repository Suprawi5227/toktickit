import { useState, useEffect } from "react";
import {
  Ticket,
  getTicket,
  claimTicket,
  reassignTicket,
  updateTicketStatus,
  updateITPriority,
  getPublicComments,
  postPublicComment,
  getInternalNotes,
  postInternalNote,
  getAdminUsers,
  User,
} from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

interface StaffTicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

export function StaffTicketDetail({ ticketId, onBack }: StaffTicketDetailProps) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const [activeTab, setActiveTab] = useState<"comments" | "notes" | "attachments">("comments");
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const tData = await getTicket(ticketId);
      setTicket(tData);

      const cData = await getPublicComments(ticketId);
      setComments(cData);

      if (user?.role === "IT_STAFF" || user?.role === "ADMIN") {
        try {
          const nData = await getInternalNotes(ticketId);
          setNotes(nData);
        } catch (e) {
          // ignore notes if forbidden
        }
      }

      if (user?.role === "ADMIN" || user?.role === "IT_STAFF") {
        try {
          const uRes = await getAdminUsers("", "IT_STAFF");
          setStaffUsers(uRes.data);
        } catch (e) {}
      }
    } catch (err: any) {
      setError(err.message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [ticketId]);

  async function handleClaim() {
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const updated = await claimTicket(ticketId);
      setTicket(updated);
      setSuccessMsg("Ticket claimed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to claim ticket");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const updated = await updateTicketStatus(ticketId, newStatus);
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : null));
      setSuccessMsg(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setError(err.message || "Status update failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePriorityChange(newPriority: string) {
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const updated = await updateITPriority(ticketId, newPriority);
      setTicket((prev) => (prev ? { ...prev, itPriority: updated.itPriority } : null));
      setSuccessMsg(`IT Priority updated to ${newPriority}`);
    } catch (err: any) {
      setError(err.message || "IT Priority update failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReassign(ownerIdStr: string) {
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const targetId = ownerIdStr === "unassigned" ? null : parseInt(ownerIdStr, 10);
      const updated = await reassignTicket(ticketId, targetId);
      setTicket((prev) => (prev ? { ...prev, owner: updated.owner, ownerId: updated.ownerId } : null));
      setSuccessMsg("Ticket owner reassigned successfully");
    } catch (err: any) {
      setError(err.message || "Reassign failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const posted = await postPublicComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, posted]);
      setNewComment("");
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePostNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const posted = await postInternalNote(ticketId, newNote.trim());
      setNotes((prev) => [...prev, posted]);
      setNewNote("");
    } catch (err: any) {
      setError(err.message || "Failed to post internal note");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-muted">Loading ticket details...</div>;
  }

  if (error && !ticket) {
    return (
      <div className="alert alert-danger my-4">
        {error}
        <br />
        <button className="btn btn-outline-danger btn-sm mt-2" onClick={onBack}>
          Back to Queue
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      {/* Header */}
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button className="btn btn-outline-secondary btn-sm fw-semibold" onClick={onBack}>
            ← Back to Queue
          </button>
          <span className="badge bg-light text-dark border px-3 py-1">
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h4 className="mb-1 text-success font-monospace fw-bold" style={{ color: "#006B3C" }}>
              {ticket.ticketNumber}
            </h4>
            <h5 className="mb-0 fw-bold">{ticket.summary}</h5>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {ticket.ownerId === null && (user?.role === "IT_STAFF" || user?.role === "ADMIN") && (
              <button
                className="btn btn-success btn-sm fw-bold"
                style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                onClick={handleClaim}
                disabled={actionLoading}
              >
                Claim Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-body p-4">
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        {successMsg && <div className="alert alert-success py-2 mb-3">{successMsg}</div>}

        {ticket.requesterResolvedInd && (
          <div className="alert alert-info py-2 mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill text-info"></i>
            <strong>Requester Feedback:</strong> The requester indicated that this problem appears resolved.
          </div>
        )}

        {/* Operational Fields Group */}
        <div className="row g-3 bg-light p-3 rounded mb-4 border">
          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Status</label>
            <select
              className="form-select form-select-sm"
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={actionLoading || (user?.role !== "IT_STAFF" && user?.role !== "ADMIN")}
            >
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_FOR_REQUESTER">WAITING_FOR_REQUESTER</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">IT Priority</label>
            <select
              className="form-select form-select-sm"
              value={ticket.itPriority || ticket.requestedPriority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={actionLoading || (user?.role !== "IT_STAFF" && user?.role !== "ADMIN")}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Owner / Assignee</label>
            <select
              className="form-select form-select-sm"
              value={ticket.ownerId ? ticket.ownerId.toString() : "unassigned"}
              onChange={(e) => handleReassign(e.target.value)}
              disabled={actionLoading || (user?.role !== "IT_STAFF" && user?.role !== "ADMIN")}
            >
              <option value="unassigned">Unassigned</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id.toString()}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted mb-1">Requester</label>
            <div className="form-control-plaintext form-control-sm fw-semibold">
              {ticket.requester?.name} ({ticket.requester?.email})
            </div>
          </div>
        </div>

        {/* Ticket Description */}
        <div className="mb-4">
          <h6 className="fw-bold text-secondary mb-2">Description</h6>
          <div className="p-3 bg-white rounded border text-wrap">{ticket.description}</div>
        </div>

        {/* Tabs for Comments, Internal Notes, Attachments */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "comments" ? "active fw-bold text-success" : "text-secondary"}`}
              onClick={() => setActiveTab("comments")}
            >
              Public Comments ({comments.length})
            </button>
          </li>
          {(user?.role === "IT_STAFF" || user?.role === "ADMIN") && (
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "notes" ? "active fw-bold text-amber" : "text-secondary"}`}
                onClick={() => setActiveTab("notes")}
                style={{ color: activeTab === "notes" ? "#D97706" : undefined }}
              >
                Internal Notes ({notes.length}) 🔒
              </button>
            </li>
          )}
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "attachments" ? "active fw-bold text-success" : "text-secondary"}`}
              onClick={() => setActiveTab("attachments")}
            >
              Attachments ({ticket.attachments?.length || 0})
            </button>
          </li>
        </ul>

        {/* Tab Content: Public Comments */}
        {activeTab === "comments" && (
          <div>
            <div className="vstack gap-3 mb-4">
              {comments.length === 0 ? (
                <div className="text-muted small italic p-3 bg-light rounded">No public comments yet.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="card border-success border-start border-3 shadow-none">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold small">
                          {c.author?.name} <span className="badge bg-light text-dark border ms-1">{c.author?.role}</span>
                        </span>
                        <span className="text-muted extra-small">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mb-0 text-dark small">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="mt-3">
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Write a public comment to the requester..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-sm btn-success fw-semibold"
                style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                disabled={actionLoading}
              >
                Post Public Comment
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: Internal Notes */}
        {activeTab === "notes" && (user?.role === "IT_STAFF" || user?.role === "ADMIN") && (
          <div>
            <div className="alert alert-warning py-2 small mb-3">
              <strong>Internal Notes:</strong> These notes are visible ONLY to IT Staff and Administrators. Requesters cannot see them.
            </div>

            <div className="vstack gap-3 mb-4">
              {notes.length === 0 ? (
                <div className="text-muted small italic p-3 bg-light rounded">No internal notes recorded yet.</div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="card border-warning border-start border-3 shadow-none" style={{ backgroundColor: "#FFF8E7" }}>
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold small text-dark">
                          {n.author?.name} <span className="badge bg-warning text-dark ms-1">IT Note</span>
                        </span>
                        <span className="text-muted extra-small">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mb-0 text-dark small">{n.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostNote} className="mt-3">
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Record private operational notes..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-sm btn-warning text-dark fw-bold" disabled={actionLoading}>
                Add Internal Note
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: Attachments */}
        {activeTab === "attachments" && (
          <div>
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <ul className="list-group list-group-flush">
                {ticket.attachments.map((att) => (
                  <li key={att.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="fw-semibold small">{att.originalName}</span>
                      <small className="text-muted ms-2">({(att.size / 1024).toFixed(1)} KB)</small>
                    </div>
                    <a
                      href={`http://localhost:3000/api/attachments/${att.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted small p-3 bg-light rounded">No attachments uploaded for this ticket.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
