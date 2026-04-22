import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { createJsonResponse } from "../test/testUtils";

const mockedNavigate = jest.fn();
let fetchMock: jest.MockedFunction<typeof fetch>;

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual(
    "react-router-dom"
  ) as typeof import("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate
  };
});

describe("Login page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });
  });

  it("TI-03: renders login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /career path/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/student login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create an account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /admin login/i })
    ).toBeInTheDocument();
  });

  it("FT-03 / TI-06: logs in successfully and stores session data", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        token: "fake-token",
        user: {
          role: "student",
          fullName: "Juan Dela Cruz",
          email: "juan@example.com"
        }
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "Juan@Example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(localStorage.getItem("access")).toBe("fake-token");
    expect(localStorage.getItem("role")).toBe("student");
    expect(localStorage.getItem("fullName")).toBe("Juan Dela Cruz");
    expect(localStorage.getItem("email")).toBe("juan@example.com");
  });

  it("FT-04 / TI-04: shows error for invalid login credentials", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse(
        { message: "Invalid email or password" },
        { status: 401, ok: false }
      )
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  });

  it("TI-06: shows student-only error when role is not student", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        token: "fake-token",
        user: {
          role: "admin",
          fullName: "Admin User",
          email: "admin@example.com"
        }
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/this login page is for students only/i)
    ).toBeInTheDocument();
  });

  it("TI-09: shows loading state while signing in", async () => {
    const user = userEvent.setup();

    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(() => {
          // unresolved on purpose
        })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "juan@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByRole("button", { name: /signing in/i })
    ).toBeInTheDocument();
  });

  it("TI-02 / FT-02: shows create account action", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const createAccountButton = screen.getByRole("button", {
      name: /create an account/i
    });

    expect(createAccountButton).toBeInTheDocument();
    await user.click(createAccountButton);
  });

  it("TI-02: shows admin login action", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const adminLoginButton = screen.getByRole("button", {
      name: /admin login/i
    });

    expect(adminLoginButton).toBeInTheDocument();
    await user.click(adminLoginButton);
  });
});
