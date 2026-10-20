import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { SESSION_EXPIRED_EVENT, saveSession } from "../lib/session";
import ForgotPassword from "../pages/ForgotPassword";
import NotFound from "../pages/NotFound";
import { createJsonResponse } from "../test/testUtils";

let fetchMock: jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  localStorage.clear();
  fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  Object.defineProperty(globalThis, "fetch", {
    writable: true,
    value: fetchMock
  });
});

describe("api() session handling", () => {
  it("signs out and announces it when a signed-in request gets 401", async () => {
    saveSession("old-token", {
      id: "1",
      fullName: "Juan",
      email: "juan@example.com",
      role: "student"
    });
    fetchMock.mockResolvedValue(
      createJsonResponse({ message: "Invalid token" }, { status: 401 })
    );
    const onExpired = jest.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    await expect(api("/queries")).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem("access")).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("keeps the session when the login form itself gets 401", async () => {
    saveSession("token", {
      id: "1",
      fullName: "Juan",
      email: "juan@example.com",
      role: "student"
    });
    fetchMock.mockResolvedValue(
      createJsonResponse({ message: "Invalid email or password" }, { status: 401 })
    );

    await expect(
      api("/auth/login", { method: "POST", body: "{}" })
    ).rejects.toThrow("Invalid email or password");
    expect(localStorage.getItem("access")).toBe("token");
  });
});

describe("ForgotPassword page", () => {
  it("shows the server's generic confirmation after sending", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        message:
          "If that email belongs to an account, we sent a link to reset the password."
      })
    );

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "juan@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByText(/we sent a link to reset the password/i)
    ).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/forgot-password$/);
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "juan@example.com"
    });
  });
});

describe("NotFound page", () => {
  it("offers the login page to signed-out visitors", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
