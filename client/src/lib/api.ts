export const API = import.meta.env.VITE_API_URL || "http://localhost:9007";

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  } as Record<string, string>;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
