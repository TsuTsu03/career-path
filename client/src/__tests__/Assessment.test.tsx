import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Assessment from "../pages/Assessment";
import { createJsonResponse } from "../test/testUtils";

type LatestAssessmentResponse = {
  primaryTrack: { track: "stem" | "abm" | "humss" | "gas"; score: number };
  secondaryTrack: { track: "stem" | "abm" | "humss" | "gas"; score: number };
  allScores: {
    stem: number;
    abm: number;
    humss: number;
    gas: number;
  };
  domainScores: Record<string, number>;
  decisionPath: string[];
};

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

describe("Assessment page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });
  });

  it("TI-09: shows checking existing assessment state", () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(() => {
          // unresolved on purpose
        })
    );

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/checking your previous assessment results/i)
    ).toBeInTheDocument();
  });

  it("TI-14 / FT-08: shows start assessment screen when no existing result", async () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse({}, { status: 404, ok: false })
    );

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/career track aptitude assessment/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start assessment/i })
    ).toBeInTheDocument();
  });

  it("TI-17 / FT-12: shows previous assessment summary when existing result exists", async () => {
    localStorage.setItem("access", "fake-token");

    const response: LatestAssessmentResponse = {
      primaryTrack: { track: "stem", score: 90 },
      secondaryTrack: { track: "abm", score: 70 },
      allScores: { stem: 90, abm: 70, humss: 50, gas: 40 },
      domainScores: {},
      decisionPath: ["Strong STEM score", "Good logic skills"]
    };

    fetchMock.mockResolvedValue(createJsonResponse(response));

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        /you have already taken the career track aptitude assessment/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/primary track:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /view full recommendations/i })
    ).toBeInTheDocument();
  });

  it("TI-14: starts assessment and shows first question", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse({}, { status: 404, ok: false })
    );

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    await user.click(
      await screen.findByRole("button", { name: /start assessment/i })
    );

    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("FT-09 / TI-15: enables next button after selecting an answer", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse({}, { status: 404, ok: false })
    );

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    await user.click(
      await screen.findByRole("button", { name: /start assessment/i })
    );

    const optionButtons = screen.getAllByRole("button");
    const answerButton = optionButtons.find(
      (btn) =>
        btn.textContent !== null &&
        btn.textContent !== "Previous" &&
        btn.textContent !== "Next" &&
        btn.textContent !== "View Results"
    );

    expect(answerButton).toBeTruthy();

    if (answerButton !== undefined) {
      await user.click(answerButton);
    }

    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("FT-10 / TI-15: moves to next question after answering", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse({}, { status: 404, ok: false })
    );

    render(
      <MemoryRouter>
        <Assessment />
      </MemoryRouter>
    );

    await user.click(
      await screen.findByRole("button", { name: /start assessment/i })
    );

    const optionButtons = screen.getAllByRole("button");
    const answerButton = optionButtons.find(
      (btn) =>
        btn.textContent !== null &&
        btn.textContent !== "Previous" &&
        btn.textContent !== "Next" &&
        btn.textContent !== "View Results"
    );

    if (answerButton !== undefined) {
      await user.click(answerButton);
    }

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/question 2 of/i)).toBeInTheDocument();
    });
  });
});
