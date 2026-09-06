import React, { useEffect, useState } from "react";
import { getTicket, deleteAttachment, Ticket } from "../api.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface TicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTicket(ticketId);
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
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    
    try {
      await deleteAttachment(id);
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
              <strong>Status:</strong> <span className="badge bg-secondary ms-2">{ticket.status}</span><br/>
              <strong>Priority:</strong> <span className={`ms-2 ${getPriorityBadge(ticket.requestedPriority)}`}>{ticket.requestedPriority}</span><br/>
              <hr/>
              <strong>Category:</strong> {ticket.category?.name}<br/>
              <strong>Related System:</strong> {ticket.relatedSystem?.name}<br/>
              <strong>Requester:</strong> {ticket.requester?.name} ({ticket.requester?.email})<br/>
              <strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}
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
      </div>
    </div>
  );
}
