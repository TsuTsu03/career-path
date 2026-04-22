import { beforeEach, describe, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentProfile from "../pages/StudentProfile";
import { createJsonResponse } from "../test/testUtils";

type ProfileApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    studentId?: string;
    gradeLevel?: string;
    grade?: string;
    section?: string;
    gender?: string;
    birthDate?: string;
    contactNumber?: string;
    address?: string;
    guardianName?: string;
    guardianContact?: string;
    interests?: string;
    strengths?: string;
    hobbies?: string;
  };
};

let fetchMock: jest.MockedFunction<typeof fetch>;

describe("StudentProfile page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: fetchMock
    });

    (globalThis.alert as jest.Mock).mockClear();
  });

  it("TI-09: shows loading state initially", () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(() => {
          // unresolved on purpose
        })
    );

    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it("TI-22: shows not authenticated error when token is missing", async () => {
    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(await screen.findByText(/not authenticated/i)).toBeInTheDocument();
  });

  it("TI-10: shows new profile message when profile returns 404", async () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<ProfileApiResponse>({}, { status: 404, ok: false })
    );

    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(
      await screen.findByText(/please complete your profile/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("FT-05: loads and displays existing profile data", async () => {
    localStorage.setItem("access", "fake-token");

    fetchMock.mockResolvedValue(
      createJsonResponse<ProfileApiResponse>({
        data: {
          firstName: "Juan",
          lastName: "Dela Cruz",
          email: "juan@example.com",
          studentId: "STU-001",
          gradeLevel: "12",
          section: "A"
        }
      })
    );

    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(await screen.findByDisplayValue("Juan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dela Cruz")).toBeInTheDocument();
    expect(screen.getByDisplayValue("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText(/student id: stu-001/i)).toBeInTheDocument();
  });

  it("TI-11 / FT-06: enables edit mode then saves successfully", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse<ProfileApiResponse>({
          data: {
            firstName: "Juan",
            lastName: "Dela Cruz",
            email: "juan@example.com"
          }
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse<{ success: boolean }>({
          success: true
        })
      );

    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(
      await screen.findByRole("button", { name: /edit profile/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    const firstNameInput = screen.getByDisplayValue("Juan");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Pedro");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/students\/me$/),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token"
          })
        })
      );
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Profile updated successfully!"
    );
  });

  it("FT-07 / TI-22: shows save error if request fails", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access", "fake-token");

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse<ProfileApiResponse>({
          data: {
            firstName: "Juan",
            lastName: "Dela Cruz",
            email: "juan@example.com"
          }
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse<{ message: string }>(
          { message: "Save failed" },
          { status: 500, ok: false }
        )
      );

    render(
      <StudentProfile
        user={{ id: "1", name: "Juan", email: "juan@example.com" }}
      />
    );

    expect(
      await screen.findByRole("button", { name: /edit profile/i })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /edit profile/i }));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
  });
});
