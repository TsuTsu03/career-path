import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Announcements from "../pages/Announcements";
import { createJsonResponse } from "../test/testUtils";

let fetchMock: jest.MockedFunction<typeof fetch>;

const sampleAnnouncements = [
  {
    id: "1",
    title: "Career Fair 2024: Explore Your Future",
    content: "Join us for the Annual Career Fair on November 20, 2024.",
    category: "event",
    date: "2024-11-13",
    author: "Guidance Office",
    important: true
  },
  {
    id: "2",
    title: "SHS Track Selection Deadline Extended",
    content: "The deadline for SHS track selection has been extended.",
    category: "deadline",
    date: "2024-11-12",
    author: "Academic Affairs",
    important: true
  },
  {
    id: "3",
    title: "Workshop: Introduction to STEM Careers",
    content: "A special workshop on STEM careers will be held.",
    category: "event",
    date: "2024-11-11",
    author: "STEM Department",
    important: false
  },
  {
    id: "4",
    title: "New Career Resources Available in Library",
    content: "The school library has added new career exploration books.",
    category: "general",
    date: "2024-11-10",
    author: "Library Services",
    important: false
  }
];

describe("Announcements page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        announcements: sampleAnnouncements
      })
    );

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });
  });

  it("FT-18: renders announcements list", async () => {
    render(<Announcements />);

    expect(screen.getByText(/announcements & events/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/career fair 2024: explore your future/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/shs track selection deadline extended/i)
    ).toBeInTheDocument();
  });

  it("TI-19: filters announcements by event", async () => {
    const user = userEvent.setup();

    render(<Announcements />);

    await screen.findByText(/career fair 2024: explore your future/i);
    await user.click(screen.getByRole("button", { name: /^events$/i }));

    expect(
      screen.getByText(/career fair 2024: explore your future/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/workshop: introduction to stem careers/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/new career resources available in library/i)
    ).not.toBeInTheDocument();
  });

  it("TI-19: filters announcements by deadline", async () => {
    const user = userEvent.setup();

    render(<Announcements />);

    await screen.findByText(/career fair 2024: explore your future/i);
    await user.click(screen.getByRole("button", { name: /^deadlines$/i }));

    expect(
      screen.getByText(/shs track selection deadline extended/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/career fair 2024: explore your future/i)
    ).not.toBeInTheDocument();
  });

  it("FT-19: opens announcement details and goes back", async () => {
    const user = userEvent.setup();

    render(<Announcements />);

    await user.click(
      await screen.findByText(/career fair 2024: explore your future/i)
    );
    expect(screen.getByText(/important announcement/i)).toBeInTheDocument();
    expect(screen.getByText(/guidance office/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /back to announcements/i })
    );
    expect(screen.getByText(/announcements & events/i)).toBeInTheDocument();
  });

  it("TI-19: shows important badge for important announcements", async () => {
    render(<Announcements />);

    await waitFor(() => {
      expect(screen.getAllByText(/important/i).length).toBeGreaterThan(0);
    });
  });
});
