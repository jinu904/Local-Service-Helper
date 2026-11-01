const API_URL = "http://localhost:4000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("lsh_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Unable to complete that request.");
  return payload;
}

export const login = (email, password) => api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const register = (data) => api("/auth/register", { method: "POST", body: JSON.stringify(data) });
