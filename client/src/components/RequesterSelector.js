import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getRequesters } from "../api.js";
import { useRequester } from "../contexts/RequesterContext.js";
export default function RequesterSelector() {
    const [requesters, setRequesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setRequester } = useRequester();
    useEffect(() => {
        getRequesters()
            .then((data) => {
            setRequesters(data);
            setLoading(false);
        })
            .catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return (_jsx("div", { className: "text-center mt-5", children: _jsx("div", { className: "spinner-border text-success" }) }));
    }
    if (error) {
        return _jsxs("div", { className: "alert alert-danger mt-5", children: ["Error: ", error] });
    }
    return (_jsx("div", { className: "container py-5", style: { maxWidth: 640 }, children: _jsxs("div", { className: "card shadow-sm border-0", children: [_jsx("div", { className: "card-header bg-success text-white text-center py-3", children: _jsx("h2", { className: "h4 mb-0", children: "Select Development Requester" }) }), _jsxs("div", { className: "card-body p-4 text-center", children: [_jsx("p", { className: "text-muted mb-4", children: "Select an active requester identity to mock login and start managing tickets." }), _jsx("div", { className: "d-grid gap-3", children: requesters.map((req) => (_jsxs("button", { className: "btn btn-outline-success btn-lg", onClick: () => setRequester(req), children: [req.name, " ", _jsx("br", {}), _jsx("small", { style: { fontSize: "0.65em" }, children: req.email })] }, req.id))) })] })] }) }));
}
