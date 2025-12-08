// frontend/src/api.js

const API_BASE = "http://localhost:4000";

// Generic helper for HTTP requests
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || res.statusText || "Request failed");
  }

  return data;
}

// =============== AUTH API ===============

export async function registerUser({ email, password, displayName, userRole }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName, userRole }),
  });
}

export async function verifyUser({ userId, code }) {
  return request("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ userId, code }),
  });
}

export async function loginUser({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getBackendHealth() {
  return request("/health", { method: "GET" });
}
