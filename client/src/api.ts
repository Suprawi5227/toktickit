const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

// Issue 2 + Issue 4 — call the backend.
// Steps: fetch `${API_URL}/api/health`; if not ok, throw.
//        then fetch `${API_URL}/api/categories`; if not ok, throw.
//        return { online: true, categories }.
// Throwing on failure lets the UI show a single Offline/error state.
export async function checkSystem(): Promise<SystemStatus> {
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

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export async function getRequesters(): Promise<Requester[]> {
  const res = await fetch(`${API_URL}/api/requesters`);
  if (!res.ok) {
    throw new Error("Unable to fetch requesters");
  }
  return res.json();
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export async function getRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`);
  if (!res.ok) {
    throw new Error("Unable to fetch related systems");
  }
  return res.json();
}

export async function createTicket(data: any): Promise<any> {
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

export async function uploadAttachment(ticketId: number, file: File): Promise<any> {
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

export interface TicketMeta {
  totalItems: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface Ticket {
  id: number;
  ticketNo: string;
  ticketNumber: string;
  summary: string;
  requestedPriority: string;
  status: string;
  category: { name: string };
  relatedSystem: { name: string };
  createdAt: string;
  description?: string;
  requester?: { name: string; email: string };
  attachments?: {
    id: number;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
  }[];
}

export interface TicketsResponse {
  success: boolean;
  data: Ticket[];
  meta: TicketMeta;
}

export async function getMyTickets(requesterId: number, page: number = 1, search: string = ""): Promise<TicketsResponse> {
  const url = new URL(`${API_URL}/api/tickets`);
  url.searchParams.append("page", page.toString());
  if (search) {
    url.searchParams.append("search", search);
  }
  
  const res = await fetch(url.toString(), {
    headers: {
      "x-requester-id": requesterId.toString()
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch tickets");
  }
  return res.json();
}

export async function getTicket(id: number, requesterId?: number): Promise<Ticket> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (requesterId !== undefined) {
    headers["x-requester-id"] = requesterId.toString();
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch ticket");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function deleteAttachment(id: number, requesterId?: number, reason?: string): Promise<void> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (requesterId !== undefined) {
    headers["x-requester-id"] = requesterId.toString();
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/attachments/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
    body: JSON.stringify({ reason: reason || "User requested deletion" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete attachment");
  }
}

// ---------------------------------------------------------------------------
// Lab 3 & 4 Types & Helpers
// ---------------------------------------------------------------------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: "REQUESTER" | "IT_STAFF" | "ADMIN";
  isActive: boolean;
  requiresPasswordChange?: boolean;
}

export interface ActionTaken {
  id: number;
  ticketId: number;
  actionDateTime: string;
  description: string;
  result: string;
  performedById: number;
  performedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  performer?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  followUpRequired: boolean;
  followUpNote: string | null;
  attachmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  const data = await res.json();
  return data.user;
}

export async function loginUser(email: string, pass: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Invalid credentials");
  }
  const data = await res.json();
  if (data.token && typeof localStorage !== "undefined") {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("token");
  }
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  }).catch(() => {});
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to change password");
  }
}

// ---------------------------------------------------------------------------
// Lab 4 - Actions Taken API Calls
// ---------------------------------------------------------------------------
export async function getActionsTaken(ticketId: number): Promise<ActionTaken[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/actions-taken`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch actions taken");
  }
  const result = await res.json();
  return result.data ?? [];
}

export async function createActionTaken(
  ticketId: number,
  payload: {
    description: string;
    result: string;
    actionDateTime?: string;
    followUpRequired?: boolean;
    followUpNote?: string | null;
    attachmentNotes?: string | null;
  }
): Promise<ActionTaken> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/actions-taken`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create action taken");
  }
  const result = await res.json();
  return result.data;
}

export async function updateActionTaken(
  ticketId: number,
  actionId: number,
  payload: {
    description?: string;
    result?: string;
    actionDateTime?: string;
    followUpRequired?: boolean;
    followUpNote?: string | null;
    attachmentNotes?: string | null;
    lastUpdatedAt: string;
  }
): Promise<ActionTaken> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/actions-taken/${actionId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update action taken");
  }
  const result = await res.json();
  return result.data;
}

// ---------------------------------------------------------------------------
// Ticket Operations & Workflow
// ---------------------------------------------------------------------------
export async function claimTicket(ticketId: number): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/claim`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to claim ticket");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function reassignTicket(ticketId: number, newOwnerId: number): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/reassign`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ ownerId: newOwnerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to reassign ticket");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function updateTicketStatus(ticketId: number, status: string, lastUpdatedAt?: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ status, lastUpdatedAt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error: any = new Error(err.error || "Failed to update status");
    error.status = res.status;
    error.data = err.data;
    throw error;
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function updateITPriority(ticketId: number, itPriority: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/it-priority`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ itPriority }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update IT priority");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function indicateTicketResolved(ticketId: number, note?: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/indicate-resolved`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to indicate resolution");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function getPublicComments(ticketId: number): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) return [];
  const result = await res.json();
  return result.data ?? [];
}

export async function postPublicComment(ticketId: number, comment: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ content: comment, comment }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to post comment");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function getInternalNotes(ticketId: number): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/notes`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) return [];
  const result = await res.json();
  return result.data ?? [];
}

export async function postInternalNote(ticketId: number, note: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ content: note, note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to post note");
  }
  const result = await res.json();
  return result.data ?? result;
}

export async function getAdminUsers(search: string = "", role: string = "", page: number = 1): Promise<any> {
  const url = new URL(`${API_URL}/api/admin/users`);
  if (search) url.searchParams.append("search", search);
  if (role) url.searchParams.append("role", role);
  url.searchParams.append("page", page.toString());

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch users");
  }
  return res.json();
}

export async function createAdminUser(payload: any): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create user");
  }
  return res.json();
}

export async function updateAdminUser(userId: number, payload: any): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update user");
  }
  return res.json();
}

export async function resetAdminUserPassword(userId: number, initialPassword?: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ initialPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to reset password");
  }
  return res.json();
}

export async function getStaffDashboard(): Promise<any> {
  const res = await fetch(`${API_URL}/api/dashboards/staff`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch staff dashboard");
  }
  return res.json();
}

export async function getRequesterDashboard(): Promise<any> {
  const res = await fetch(`${API_URL}/api/dashboards/requester`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch requester dashboard");
  }
  return res.json();
}
