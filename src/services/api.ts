const API_URL = "/api";

export const api = {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async post(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async patch(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async delete(endpoint: string, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async upload(endpoint: string, formData: FormData, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
};
