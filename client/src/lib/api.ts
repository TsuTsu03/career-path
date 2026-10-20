import { SESSION_EXPIRED_EVENT, clearSession, getToken } from "./session";

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

// A 401 from these means "wrong credentials", not "session expired".
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/admin/setup-password"
];

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();

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

    // The token expired or was rejected: sign out and let the app send the
    // user back to the login page.
    if (
      res.status === 401 &&
      token &&
      !PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p))
    ) {
      const role = localStorage.getItem("role") ?? undefined;
      clearSession();
      window.dispatchEvent(
        new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { role } })
      );
    }

    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

/** Turns any thrown value into a message that can be shown to the user. */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError || err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
}
