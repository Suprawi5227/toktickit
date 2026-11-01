import React, { useEffect, useState } from "react";
import { getTicket, deleteAttachment, indicateTicketResolved, Ticket } from "../api.js";
import { ActionsTaken } from "./ActionsTaken.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface TicketDetailProps {
  ticketId: number;
  requesterId: number;
  onBack: () => void;
  initialTicket?: Ticket;
}

export function TicketDetail({ ticketId, requesterId, onBack, initialTicket }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(initialTicket || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    if (initialTicket) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTicket(ticketId, requesterId);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTicket) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleDeleteAttachment = async (id: number) => {
    const reason = window.prompt("Please enter a reason for deletion:");
    if (!reason) return;
    
    try {
      await deleteAttachment(id, requesterId, reason);
      await fetchTicket(); // Refresh ticket to update attachment list
    } catch (err: any) {
      alert(err.message || "Failed to delete attachment");
    }
  };

  const handleIndicateResolved = async () => {
    const note = window.prompt("Optional resolution note (e.g. Printer is working properly now):") ?? undefined;
    try {
      setLoading(true);
      await indicateTicketResolved(ticketId, note);
      if (initialTicket) {
        setTicket((prev) => (prev ? { ...prev, requesterResolvedInd: true } : null));
      } else {
        await fetchTicket();
      }
    } catch (err: any) {
      alert(err.message || "Failed to indicate resolution");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return "badge bg-danger";
      case "HIGH": return "badge bg-warning text-dark";
      case "MEDIUM": return "badge bg-primary";
      default: return "badge bg-secondary";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="badge" style={{ backgroundColor: "#0D6EFD", color: "#FFFFFF" }}>NEW</span>;
      case "OPEN": return <span className="badge" style={{ backgroundColor: "#6F42C1", color: "#FFFFFF" }}>OPEN</span>;
      case "IN_PROGRESS": return <span className="badge" style={{ backgroundColor: "#FD7E14", color: "#FFFFFF" }}>IN_PROGRESS</span>;
      case "WAITING_FOR_REQUESTER": return <span className="badge bg-warning text-dark">WAITING_FOR_REQUESTER</span>;
      case "RESOLVED": return <span className="badge" style={{ backgroundColor: "#006B3C", color: "#FFFFFF" }}>RESOLVED</span>;
      case "CLOSED": return <span className="badge bg-secondary">CLOSED</span>;
      case "REOPENED": return <span className="badge" data-testid="status-badge-reopened" style={{ backgroundColor: "#20C997", color: "#FFFFFF" }}>REOPENED</span>;
      case "CANCELLED": return <span className="badge bg-danger">CANCELLED</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-5">Loading ticket details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!ticket) return null;

  const isActive = ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && ticket.status !== "CANCELLED";

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Ticket: {ticket.ticketNumber || ticket.ticketNo}</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>&larr; Back to List</button>
      </div>
      
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-8">
            <h5>{ticket.summary}</h5>
            <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-light rounded border">
              <strong>Status:</strong> <span className="ms-2">{getStatusBadge(ticket.status)}</span><br/>
              <strong>Priority:</strong> <span className={`ms-2 ${getPriorityBadge(ticket.requestedPriority)}`}>{ticket.requestedPriority}</span><br/>
              <hr/>
              <strong>Category:</strong> {ticket.category?.name}<br/>
              <strong>Related System:</strong> {ticket.relatedSystem?.name}<br/>
              <strong>Requester:</strong> {ticket.requester?.name} ({ticket.requester?.email})<br/>
              <strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}

              {isActive && (
                <div className="mt-3 pt-2 border-top">
                  {!ticket.requesterResolvedInd ? (
                    <button
                      className="btn btn-outline-success btn-sm w-100 fw-semibold"
                      data-testid="indicate-resolved-btn"
                      onClick={handleIndicateResolved}
                    >
                      Problem Appears Resolved
                    </button>
                  ) : (
                    <div className="alert alert-success py-2 px-3 mb-0 small" data-testid="requester-indicated-alert">
                      ✓ You indicated this problem appears resolved.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <hr />
        
        <h5 className="mb-3">Attachments</h5>
        {(!ticket.attachments || ticket.attachments.length === 0) ? (
          <p className="text-muted">No attachments available.</p>
        ) : (
          <ul className="list-group">
            {ticket.attachments.map(att => (
              <li key={att.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-paperclip me-2"></i>
                  {att.originalName} <span className="text-muted small">({(att.size / 1024).toFixed(2)} KB)</span>
                </div>
                <div className="btn-group">
                  <a 
                    href={`${API_URL}/api/attachments/${att.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Download
                  </a>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDeleteAttachment(att.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr className="my-4" />

        {/* Read-only Actions Taken list for Requester */}
        <ActionsTaken ticketId={ticketId} canEdit={false} />
      </div>
    </div>
  );
}
