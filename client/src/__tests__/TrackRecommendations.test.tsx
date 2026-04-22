import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TrackRecommendations from "../pages/TrackRecommendations";
import { createJsonResponse } from "../test/testUtils";
import { mockSave } from "../test/mocks/jspdf";

type TrackKey = "stem" | "abm" | "humss" | "gas";

type RecommendationResponse = {
  primaryTrack: { track: TrackKey; score: number };
  secondaryTrack: { track: TrackKey; score: number };
  allScores: Record<TrackKey, number>;
};

let fetchMock: jest.MockedFunction<typeof fetch>;

describe("TrackRecommendations page", () => {
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
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(() => {
          // unresolved on purpose
        })
    );

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/loading your shs recommendations/i)
    ).toBeInTheDocument();
  });

  it("TI-10 / FT-21: shows empty state when no result exists", async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse({}, { status: 404, ok: false })
    );

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/no assessment results yet/i)
    ).toBeInTheDocument();
  });

  it("TI-22: shows error state when fetch fails", async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse(
        { message: "Server failed" },
        { status: 500, ok: false }
      )
    );

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/unable to load results/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/server failed/i)).toBeInTheDocument();
  });

  it("TI-17 / FT-12: renders recommendation results", async () => {
    const response: RecommendationResponse = {
      primaryTrack: { track: "stem", score: 90 },
      secondaryTrack: { track: "abm", score: 70 },
      allScores: { stem: 90, abm: 70, humss: 50, gas: 40 }
    };

    fetchMock.mockResolvedValue(createJsonResponse(response));

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/your shs track recommendations/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/primary recommendation/i)).toBeInTheDocument();
    expect(screen.getByText(/secondary recommendation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/stem/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/abm/i).length).toBeGreaterThan(0);
  });

  it("FT-15 / TI-21: shows consult counselor action button", async () => {
    const user = userEvent.setup();

    const response: RecommendationResponse = {
      primaryTrack: { track: "stem", score: 90 },
      secondaryTrack: { track: "abm", score: 70 },
      allScores: { stem: 90, abm: 70, humss: 50, gas: 40 }
    };

    fetchMock.mockResolvedValue(createJsonResponse(response));

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    const consultButton = await screen.findByRole("button", {
      name: /consult counselor/i
    });

    expect(consultButton).toBeInTheDocument();
    await user.click(consultButton);
  });

  it("FT-12: downloads PDF when button is clicked", async () => {
    const user = userEvent.setup();

    const response: RecommendationResponse = {
      primaryTrack: { track: "stem", score: 90 },
      secondaryTrack: { track: "abm", score: 70 },
      allScores: { stem: 90, abm: 70, humss: 50, gas: 40 }
    };

    fetchMock.mockResolvedValue(createJsonResponse(response));

    render(
      <MemoryRouter>
        <TrackRecommendations />
      </MemoryRouter>
    );

    await screen.findByText(/your shs track recommendations/i);
    await user.click(screen.getByRole("button", { name: /download results/i }));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        "CAREER PATH_SHS_Recommendations.pdf"
      );
    });
  });
});
