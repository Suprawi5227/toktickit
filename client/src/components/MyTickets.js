import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getMyTickets } from "../api.js";
export function MyTickets({ requesterId, onViewTicket }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err.message || "Failed to load tickets");
            }
            finally {
                setLoading(false);
            }
        }
        loadTickets();
    }, [requesterId, page, appliedSearch]);
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        setAppliedSearch(searchInput);
    };
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "URGENT": return "badge bg-danger";
            case "HIGH": return "badge bg-warning text-dark";
            case "MEDIUM": return "badge bg-primary";
            default: return "badge bg-secondary";
        }
    };
    return (_jsxs("div", { className: "card shadow-sm p-4 mt-4", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsx("h3", { children: "My Tickets" }), _jsxs("form", { onSubmit: handleSearch, className: "d-flex", style: { maxWidth: "300px" }, children: [_jsx("input", { type: "text", className: "form-control me-2", placeholder: "Search tickets...", value: searchInput, onChange: (e) => setSearchInput(e.target.value) }), _jsx("button", { type: "submit", className: "btn btn-outline-secondary", children: "Search" })] })] }), error && _jsx("div", { className: "alert alert-danger", children: error }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Ticket No." }), _jsx("th", { children: "Summary" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Priority" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Created At" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4", children: "Loading tickets..." }) })) : tickets.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-muted", children: "No tickets found." }) })) : (tickets.map((ticket) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: ticket.ticketNumber }) }), _jsx("td", { children: ticket.summary }), _jsx("td", { children: ticket.category?.name || "-" }), _jsx("td", { children: _jsx("span", { className: getPriorityBadge(ticket.requestedPriority), children: ticket.requestedPriority }) }), _jsx("td", { children: _jsx("span", { className: "badge bg-secondary", children: ticket.status }) }), _jsx("td", { children: new Date(ticket.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: () => onViewTicket(ticket.id), children: "View" }) })] }, ticket.id)))) })] }) }), _jsxs("div", { className: "d-flex justify-content-between align-items-center mt-3", children: [_jsxs("span", { className: "text-muted", children: ["Page ", page, " of ", Math.max(1, totalPages)] }), _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-outline-secondary", disabled: page <= 1 || loading, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx("button", { className: "btn btn-outline-secondary", disabled: page >= totalPages || loading, onClick: () => setPage(p => p + 1), children: "Next" })] })] })] }));
}
