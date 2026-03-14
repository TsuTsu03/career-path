type ApiErrorPayload = {
  success?: boolean;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  data?: ApiErrorPayload;

  constructor(status: number, message: string, data?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const API = import.meta.env.VITE_API_URL || "http://localhost:9007";

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API}${path}`, { ...opts, headers });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    if (typeof data === "object" && data !== null) {
      const payload = data as ApiErrorPayload;
      throw new ApiError(
        res.status,
        payload.message || "Request failed",
        payload
      );
    }

    throw new ApiError(
      res.status,
      typeof data === "string" ? data : "Request failed"
    );
  }

  return data as T;
}
