import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";
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

describe("Register page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });
  });

  it("TI-03: renders register form correctly", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/create your student account/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/juan dela cruz/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  it("TI-12: shows password mismatch error", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText(/juan dela cruz/i),
      "Juan Dela Cruz"
    );
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "juan@example.com"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[0],
      "Password1!"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[1],
      "Password2!"
    );
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("TI-13: shows weak password error and does not submit", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText(/juan dela cruz/i),
      "Juan Dela Cruz"
    );
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "juan@example.com"
    );
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "abc");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "abc");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(screen.getAllByText(/password is too weak/i)[0]).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("TI-13: shows password strength indicator updates", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];

    await user.type(passwordInput, "abc");
    expect(screen.getByText(/password strength:/i)).toBeInTheDocument();
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "Password1!");
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it("FT-06: submits registration successfully", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        emailSent: true
      })
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText(/juan dela cruz/i),
      "Juan Dela Cruz"
    );
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "Juan@Example.com"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[0],
      "Password1!"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[1],
      "Password1!"
    );
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/registration successful! please check your email/i)
    ).toBeInTheDocument();
  });

  it("FT-07 / TI-22: shows generic error when registration fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse(
        { message: "Request failed" },
        { status: 500, ok: false }
      )
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(
      screen.getByPlaceholderText(/juan dela cruz/i),
      "Juan Dela Cruz"
    );
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "juan@example.com"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[0],
      "Password1!"
    );
    await user.type(
      screen.getAllByPlaceholderText(/••••••••/i)[1],
      "Password1!"
    );
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/error creating account. please try again/i)
    ).toBeInTheDocument();
  });

  it("TI-02: shows login action button", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: /log in/i });
    expect(loginButton).toBeInTheDocument();

    await user.click(loginButton);
  });
});
