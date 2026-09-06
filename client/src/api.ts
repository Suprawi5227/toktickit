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

export async function getTicket(id: number, requesterId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    headers: {
      "x-requester-id": requesterId.toString()
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch ticket");
  }
  const result = await res.json();
  return result.data;
}

export async function deleteAttachment(id: number, requesterId: number, reason: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/attachments/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": requesterId.toString()
    },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete attachment");
  }
}
