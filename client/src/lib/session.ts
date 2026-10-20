// client/src/lib/session.ts
//
// The signed-in user lives in localStorage under these keys. Every page reads
// and writes the session through here instead of touching the keys directly.

export type Role = "student" | "admin";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string | null;
}

export const TOKEN_KEY = "access";

const SESSION_KEYS = [
  TOKEN_KEY,
  "role",
  "fullName",
  "email",
  "userId",
  "currentUser"
];

// Older builds stored the token under other names.
const LEGACY_TOKEN_KEYS = ["token", "accessToken", "authToken"];

export const SESSION_EXPIRED_EVENT = "carpath:session-expired";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, user: SessionUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("role", user.role);
  localStorage.setItem("fullName", user.fullName);
  localStorage.setItem("email", user.email);
  localStorage.setItem("userId", String(user.id));
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearSession(): void {
  for (const key of [...SESSION_KEYS, ...LEGACY_TOKEN_KEYS]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export function getSessionUser(): SessionUser | null {
  const role = localStorage.getItem("role");
  if (!getToken() || (role !== "student" && role !== "admin")) return null;

  return {
    id: localStorage.getItem("userId") ?? "",
    fullName: localStorage.getItem("fullName") ?? "User",
    email: localStorage.getItem("email") ?? "",
    role
  };
}

export function updateStoredName(fullName: string): void {
  localStorage.setItem("fullName", fullName);
}
