const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
// Issue 2 + Issue 4 — call the backend.
// Steps: fetch `${API_URL}/api/health`; if not ok, throw.
//        then fetch `${API_URL}/api/categories`; if not ok, throw.
//        return { online: true, categories }.
// Throwing on failure lets the UI show a single Offline/error state.
export async function checkSystem() {
    const healthRes = await fetch(`${API_URL}/api/health`);
    if (!healthRes.ok) {
        throw new Error("Backend is offline");
    }
    const categoriesRes = await fetch(`${API_URL}/api/categories`);
    if (!categoriesRes.ok) {
        throw new Error("Unable to fetch categories");
    }
    const categories = await categoriesRes.json();
    return { online: true, categories };
}
export async function getRequesters() {
    const res = await fetch(`${API_URL}/api/requesters`);
    if (!res.ok) {
        throw new Error("Unable to fetch requesters");
    }
    return res.json();
}
export async function getRelatedSystems() {
    const res = await fetch(`${API_URL}/api/related-systems`);
    if (!res.ok) {
        throw new Error("Unable to fetch related systems");
    }
    return res.json();
}
export async function createTicket(data) {
    const res = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create ticket");
    }
    return res.json();
}
export async function uploadAttachment(ticketId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload attachment");
    }
    return res.json();
}
