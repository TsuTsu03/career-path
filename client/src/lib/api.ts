export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const viteEnv = (
  import.meta as ImportMeta & {
    env?: {
      VITE_API_URL?: string;
    };
  }
).env;

export const API = viteEnv?.VITE_API_URL ?? "http://localhost:9007";

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access");

  const headers = new Headers(opts.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const data: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed with status ${res.status}`;

    throw new ApiError(res.status, message, data);
  }

  return data as T;
}
