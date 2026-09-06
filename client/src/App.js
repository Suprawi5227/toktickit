import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { checkSystem } from "./api.js";
import { useRequester } from "./contexts/RequesterContext.js";
import RequesterSelector from "./components/RequesterSelector.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";
export default function App() {
    const [state, setState] = useState("idle");
    const [tab, setTab] = useState("list");
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [categories, setCategories] = useState([]);
    const { requester, setRequester } = useRequester();
    async function handleCheck() {
        setState("loading");
        try {
            const result = await checkSystem();
            setCategories(result.categories);
            setState("success");
        }
        catch (err) {
            setState("error");
        }
    }
    if (!requester) {
        return (_jsxs(_Fragment, { children: [_jsx("div", { className: "container py-3", style: { maxWidth: 640 }, children: _jsxs("h1", { className: "h3 mb-0 text-center", children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "IT Service Desk" })] }) }), _jsx(RequesterSelector, {}), _jsxs("div", { className: "container mt-5", style: { maxWidth: 640 }, children: [_jsx("hr", {}), _jsx("h2", { className: "h6 text-muted mb-3", children: "Lab 1: System Check" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm mb-3", onClick: handleCheck, disabled: state === "loading", children: state === "loading" ? "Loading…" : "Check System" }), state === "success" && (_jsxs("div", { className: "alert alert-success py-2", children: [_jsx("strong", { children: "Online" }), " - TokTickIT API is running.", _jsx("ul", { className: "mb-0 mt-1", children: categories.map((cat) => (_jsx("li", { children: cat.name }, cat.id))) })] })), state === "error" && (_jsxs("div", { className: "alert alert-danger py-2", children: [_jsx("strong", { children: "Offline" }), " - Backend is currently unavailable."] }))] })] }));
    }
    return (_jsxs("div", { children: [_jsx("nav", { className: "navbar navbar-expand-lg navbar-dark bg-success mb-4", children: _jsxs("div", { className: "container", children: [_jsx("span", { className: "navbar-brand mb-0 h1", children: "TokTickIT Service Desk" }), _jsxs("div", { className: "d-flex align-items-center", children: [_jsxs("span", { className: "text-white me-3", children: ["Hello, ", _jsx("strong", { children: requester.name })] }), _jsx("button", { className: "btn btn-outline-light btn-sm", onClick: () => setRequester(null), children: "Change Requester" })] })] }) }), _jsx("div", { className: "container", children: state !== "success" ? (_jsxs("div", { className: "alert alert-warning", children: ["Please run the System Check on the login page to load categories before creating a ticket.", _jsx("br", {}), _jsx("button", { className: "btn btn-warning btn-sm mt-2", onClick: () => setRequester(null), children: "Go Back" })] })) : (_jsxs(_Fragment, { children: [_jsxs("ul", { className: "nav nav-tabs mb-4", children: [_jsx("li", { className: "nav-item", children: _jsx("button", { className: `nav-link ${tab === "list" && selectedTicketId === null ? "active fw-bold text-success" : "text-secondary"}`, onClick: () => { setTab("list"); setSelectedTicketId(null); }, style: { cursor: "pointer", background: "none", border: "none" }, children: "My Tickets" }) }), _jsx("li", { className: "nav-item", children: _jsx("button", { className: `nav-link ${tab === "create" ? "active fw-bold text-success" : "text-secondary"}`, onClick: () => { setTab("create"); setSelectedTicketId(null); }, style: { cursor: "pointer", background: "none", border: "none" }, children: "Create Ticket" }) })] }), selectedTicketId !== null ? (_jsx(TicketDetail, { ticketId: selectedTicketId, onBack: () => setSelectedTicketId(null) })) : tab === "list" ? (_jsx(MyTickets, { requesterId: requester.id, onViewTicket: (id) => setSelectedTicketId(id) })) : (_jsx(CreateTicketForm, { requesterId: requester.id, categories: categories, onSuccess: (ticketNo) => {
                                alert(`Ticket Created! ID: ${ticketNo}`);
                                setTab("list");
                                setSelectedTicketId(null);
                            } }))] })) })] }));
}
