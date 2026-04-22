import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Announcements from "../pages/Announcements";

describe("Announcements page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("FT-18: renders announcements list", () => {
    render(<Announcements />);

    expect(screen.getByText(/announcements & events/i)).toBeInTheDocument();
    expect(
      screen.getByText(/career fair 2024: explore your future/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/shs track selection deadline extended/i)
    ).toBeInTheDocument();
  });

  it("TI-19: filters announcements by event", async () => {
    const user = userEvent.setup();

    render(<Announcements />);

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
      screen.getByText(/career fair 2024: explore your future/i)
    );
    expect(screen.getByText(/important announcement/i)).toBeInTheDocument();
    expect(screen.getByText(/guidance office/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /back to announcements/i })
    );
    expect(screen.getByText(/announcements & events/i)).toBeInTheDocument();
  });

  it("TI-19: shows important badge for important announcements", () => {
    render(<Announcements />);

    expect(screen.getAllByText(/important/i).length).toBeGreaterThan(0);
  });
});
