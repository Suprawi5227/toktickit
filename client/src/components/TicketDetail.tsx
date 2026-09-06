import React, { useEffect, useState } from "react";
import { getTicket, deleteAttachment, Ticket } from "../api.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface TicketDetailProps {
  ticketId: number;
  requesterId: number;
  onBack: () => void;
}

export function TicketDetail({ ticketId, requesterId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
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
    fetchTicket();
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return "badge bg-danger";
      case "HIGH": return "badge bg-warning text-dark";
      case "MEDIUM": return "badge bg-primary";
      default: return "badge bg-secondary";
    }
  };

  if (loading) return <div className="text-center py-5">Loading ticket details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="tab-content-enter">
      <div className="card shadow-sm border-0 mt-3">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 text-success fw-bold">Ticket: {ticket.ticketNumber || ticket.ticketNo}</h4>
          <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>&larr; Back to List</button>
        </div>
        
        <div className="card-body px-4 pb-4">
        <div className="row mb-4">
          <div className="col-md-8">
            <h5>{ticket.summary}</h5>
            <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-light rounded border-0 shadow-sm h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">Details</h6>
              <div className="mb-2"><strong>Status:</strong> <span className="badge bg-secondary ms-2">{ticket.status}</span></div>
              <div className="mb-3"><strong>Priority:</strong> <span className={`ms-2 ${getPriorityBadge(ticket.requestedPriority)}`}>{ticket.requestedPriority}</span></div>
              <hr className="text-black-50" />
              <div className="small mb-1"><strong>Category:</strong> {ticket.category?.name}</div>
              <div className="small mb-1"><strong>System:</strong> {ticket.relatedSystem?.name}</div>
              <div className="small mb-1"><strong>Requester:</strong> {ticket.requester?.name}</div>
              <div className="small"><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <hr />
        
        <h5 className="mb-3 border-bottom pb-2">Attachments</h5>
        {(!ticket.attachments || ticket.attachments.length === 0) ? (
          <p className="text-muted small"><i className="bi bi-info-circle me-1"></i> No attachments available.</p>
        ) : (
          <div className="row g-2">
            {ticket.attachments.map(att => (
              <div key={att.id} className="col-md-6 col-lg-4">
                <div className="attachment-item p-3 d-flex flex-column h-100">
                  <div className="d-flex align-items-start mb-2">
                    <i className="bi bi-file-earmark-text fs-4 text-success me-2"></i>
                    <div className="text-truncate" title={att.originalName}>
                      <span className="fw-medium">{att.originalName}</span>
                      <br/>
                      <small className="text-muted">{(att.size / 1024).toFixed(2)} KB</small>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-top d-flex justify-content-end gap-2">
                    <a 
                      href={`${API_URL}/api/attachments/${att.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-sm btn-light border"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
