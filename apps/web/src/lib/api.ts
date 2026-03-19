const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7777";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? `Request failed: ${res.status}`
    );
  }

  return res.json();
}

// ── Auth ──
export const auth = {
  me: () => request<{ authenticated: boolean; setupRequired?: boolean; user?: { type: string; name: string } }>("/api/auth/me"),
  setup: (password: string) => request("/api/auth/setup", { method: "POST", body: JSON.stringify({ password }) }),
  login: (password: string) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
};

// ── Notes ──
export const notes = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    request<{ notes: any[]; total: number }>("/api/notes", { params }),
  get: (id: string) => request<any>(`/api/notes/${id}`),
  create: (data: { title: string; content?: string; tags?: string[] }) =>
    request<any>("/api/notes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { title?: string; content?: string; tags?: string[]; isPinned?: boolean }) =>
    request<any>(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  archive: (id: string) => request<any>(`/api/notes/${id}/archive`, { method: "POST" }),
  unarchive: (id: string) => request<any>(`/api/notes/${id}/unarchive`, { method: "POST" }),
  delete: (id: string) => request(`/api/notes/${id}`, { method: "DELETE" }),
  search: (params: { q: string; limit?: number }) =>
    request<{ notes: any[]; total: number }>("/api/notes/search", { params }),
  versions: (id: string) => request<{ versions: any[] }>(`/api/notes/${id}/versions`),
};

// ── Todos ──
export const todos = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    request<{ todos: any[]; total: number }>("/api/todos", { params }),
  get: (id: string) => request<any>(`/api/todos/${id}`),
  create: (data: { title: string; priority?: string; dueDate?: string; noteId?: string }) =>
    request<any>("/api/todos", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<any>(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/todos/${id}`, { method: "DELETE" }),
};

// ── Tags ──
export const tags = {
  list: () => request<{ tags: any[] }>("/api/tags"),
  create: (data: { name: string; color?: string }) =>
    request<any>("/api/tags", { method: "POST", body: JSON.stringify(data) }),
};

// ── Agents ──
export const agents = {
  list: () => request<{ agents: any[] }>("/api/agents"),
  register: (data: { name: string; permissions?: string }) =>
    request<any>("/api/agents", { method: "POST", body: JSON.stringify(data) }),
  deactivate: (id: string) => request(`/api/agents/${id}/deactivate`, { method: "POST" }),
  reactivate: (id: string) => request(`/api/agents/${id}/reactivate`, { method: "POST" }),
  delete: (id: string) => request(`/api/agents/${id}`, { method: "DELETE" }),
};

// ── Activity ──
export const activity = {
  feed: (params?: Record<string, string | number | boolean | undefined>) =>
    request<{ activities: any[]; total: number }>("/api/activity", { params }),
};

// ── Calendar ──
export const calendar = {
  authUrl: () => request<{ url: string }>("/api/calendar/auth-url"),
  status: () => request<{ connected: boolean }>("/api/calendar/status"),
  sync: () => request<any>("/api/calendar/sync", { method: "POST" }),
  disconnect: () => request("/api/calendar/disconnect", { method: "POST" }),
};

// ── Settings ──
export const settings = {
  get: (key: string) => request<{ key: string; value: any }>(`/api/settings/${key}`),
  set: (key: string, value: any) => request(`/api/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
};
