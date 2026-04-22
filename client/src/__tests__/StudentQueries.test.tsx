import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentQueries from "../pages/StudentQueries";
import { createJsonResponse } from "../test/testUtils";

type BackendQuery = {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  userId: string;
  createdAt?: string;
  answeredAt?: string;
  updatedAt?: string;
  response?: string;
  counselorName?: string;
};

type QueriesResponse = {
  success: boolean;
  queries: BackendQuery[];
};

let fetchMock: jest.MockedFunction<typeof fetch>;

describe("StudentQueries page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });
  });

  it("TI-09: shows loading state", () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(() => {
          // unresolved on purpose
        })
    );

    render(<StudentQueries userId="student-1" />);

    expect(screen.getByText(/loading your queries/i)).toBeInTheDocument();
  });

  it("TI-22: shows session error if token is missing", async () => {
    render(<StudentQueries userId="student-1" />);

    expect(await screen.findByText(/no session found/i)).toBeInTheDocument();
  });

  it("TI-10 / FT-21: shows empty state when there are no queries", async () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<QueriesResponse>({
        success: true,
        queries: []
      })
    );

    render(<StudentQueries userId="student-1" />);

    expect(await screen.findByText(/no queries yet/i)).toBeInTheDocument();
  });

  it("FT-17: renders fetched queries", async () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<QueriesResponse>({
        success: true,
        queries: [
          {
            id: "1",
            subject: "Need track advice",
            message: "Which track is best for me?",
            status: "pending",
            userId: "student-1",
            createdAt: "2026-04-01T00:00:00.000Z"
          }
        ]
      })
    );

    render(<StudentQueries userId="student-1" />);

    expect(await screen.findByText(/need track advice/i)).toBeInTheDocument();
    expect(screen.getByText(/which track is best for me/i)).toBeInTheDocument();
  });

  it("TI-21: opens and closes new query form", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<QueriesResponse>({
        success: true,
        queries: []
      })
    );

    render(<StudentQueries userId="student-1" />);

    await screen.findByText(/my queries/i);
    await user.click(screen.getByRole("button", { name: /new query/i }));
    expect(screen.getByText(/submit a new query/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/submit a new query/i)).not.toBeInTheDocument();
  });

  it("TI-21 / FT-16: submits a new query successfully", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse<QueriesResponse>({
          success: true,
          queries: []
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          success: true,
          message: "Created",
          query: {
            id: "2",
            subject: "New Subject",
            message: "New message",
            status: "pending",
            userId: "student-1",
            createdAt: "2026-04-02T00:00:00.000Z"
          }
        })
      );

    render(<StudentQueries userId="student-1" />);

    await screen.findByText(/my queries/i);
    await user.click(screen.getByRole("button", { name: /new query/i }));
    await user.type(
      screen.getByPlaceholderText(/what is your query about/i),
      "New Subject"
    );
    await user.type(
      screen.getByPlaceholderText(/describe your question or concern/i),
      "New message"
    );
    await user.click(screen.getByRole("button", { name: /submit query/i }));

    expect(await screen.findByText(/new subject/i)).toBeInTheDocument();
  });

  it("FT-17: opens selected query detail view", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<QueriesResponse>({
        success: true,
        queries: [
          {
            id: "1",
            subject: "Need help",
            message: "Please help me decide",
            status: "answered",
            userId: "student-1",
            createdAt: "2026-04-01T00:00:00.000Z",
            response: "You may consider STEM.",
            counselorName: "Counselor Ana",
            answeredAt: "2026-04-02T00:00:00.000Z"
          }
        ]
      })
    );

    render(<StudentQueries userId="student-1" />);

    await user.click(await screen.findByText(/need help/i));

    expect(screen.getByText(/please help me decide/i)).toBeInTheDocument();
    expect(screen.getByText(/you may consider stem/i)).toBeInTheDocument();
    expect(screen.getByText(/counselor ana/i)).toBeInTheDocument();
  });
});
