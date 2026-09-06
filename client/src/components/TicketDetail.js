import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getTicket, deleteAttachment } from "../api.js";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export function TicketDetail({ ticketId, onBack }) {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchTicket = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTicket(ticketId);
            setTicket(data);
        }
        catch (err) {
            setError(err.message || "Failed to load ticket");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTicket();
    }, [ticketId]);
    const handleDeleteAttachment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attachment?"))
            return;
        try {
            await deleteAttachment(id);
            await fetchTicket(); // Refresh ticket to update attachment list
        }
        catch (err) {
            alert(err.message || "Failed to delete attachment");
        }
    };
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "URGENT": return "badge bg-danger";
            case "HIGH": return "badge bg-warning text-dark";
            case "MEDIUM": return "badge bg-primary";
            default: return "badge bg-secondary";
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center py-5", children: "Loading ticket details..." });
    if (error)
        return _jsx("div", { className: "alert alert-danger", children: error });
    if (!ticket)
        return null;
    return (_jsxs("div", { className: "card shadow-sm mt-4", children: [_jsxs("div", { className: "card-header bg-light d-flex justify-content-between align-items-center", children: [_jsxs("h4", { className: "mb-0", children: ["Ticket: ", ticket.ticketNumber || ticket.ticketNo] }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: onBack, children: "\u2190 Back to List" })] }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-8", children: [_jsx("h5", { children: ticket.summary }), _jsx("p", { className: "text-muted", style: { whiteSpace: "pre-wrap" }, children: ticket.description })] }), _jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3 bg-light rounded border", children: [_jsx("strong", { children: "Status:" }), " ", _jsx("span", { className: "badge bg-secondary ms-2", children: ticket.status }), _jsx("br", {}), _jsx("strong", { children: "Priority:" }), " ", _jsx("span", { className: `ms-2 ${getPriorityBadge(ticket.requestedPriority)}`, children: ticket.requestedPriority }), _jsx("br", {}), _jsx("hr", {}), _jsx("strong", { children: "Category:" }), " ", ticket.category?.name, _jsx("br", {}), _jsx("strong", { children: "Related System:" }), " ", ticket.relatedSystem?.name, _jsx("br", {}), _jsx("strong", { children: "Requester:" }), " ", ticket.requester?.name, " (", ticket.requester?.email, ")", _jsx("br", {}), _jsx("strong", { children: "Created At:" }), " ", new Date(ticket.createdAt).toLocaleString()] }) })] }), _jsx("hr", {}), _jsx("h5", { className: "mb-3", children: "Attachments" }), (!ticket.attachments || ticket.attachments.length === 0) ? (_jsx("p", { className: "text-muted", children: "No attachments available." })) : (_jsx("ul", { className: "list-group", children: ticket.attachments.map(att => (_jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("i", { className: "bi bi-paperclip me-2" }), att.originalName, " ", _jsxs("span", { className: "text-muted small", children: ["(", (att.size / 1024).toFixed(2), " KB)"] })] }), _jsxs("div", { className: "btn-group", children: [_jsx("a", { href: `${API_URL}/api/attachments/${att.id}`, target: "_blank", rel: "noreferrer", className: "btn btn-sm btn-outline-primary", children: "Download" }), _jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => handleDeleteAttachment(att.id), children: "Delete" })] })] }, att.id))) }))] })] }));
}
