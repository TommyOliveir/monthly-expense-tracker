import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { AuthPageContent } from "@/app/login/page";

const push = vi.fn();
const login = vi.fn();
const signup = vi.fn();
const loginWithGoogle = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));
vi.mock("@/features/auth/hooks/useLogin", () => ({
  useLogin: () => ({ login }),
}));
vi.mock("@/features/auth/hooks/useSignup", () => ({
  useSignup: () => ({ signup }),
}));
vi.mock("@/features/auth/hooks/useGoogleLogin", () => ({
  useGoogleLogin: () => ({ loginWithGoogle }),
}));
vi.mock("@/config", () => ({ GOOGLE_CLIENT_ID: "test-client-id" }));
// Stands in for Google's iframe button: clicking it "returns" a credential.
vi.mock("@/features/auth/components/GoogleSignInButton", () => ({
  GoogleSignInButton: ({
    onCredential,
  }: {
    onCredential: (credential: string) => void;
  }) => (
    <button type="button" onClick={() => onCredential("google-id-token")}>
      Sign in with Google
    </button>
  ),
}));

function fillLoginForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: password },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /sign in to dashboard/i }),
  );
}

describe("AuthPageContent", () => {
  beforeEach(() => {
    push.mockReset();
    login.mockReset();
    signup.mockReset();
    loginWithGoogle.mockReset();
    searchParams = new URLSearchParams();
  });

  it("redirects to the tracker only after login succeeds", async () => {
    let resolveLogin: () => void = () => {};
    login.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    render(<AuthPageContent />);

    fillLoginForm("  tommy@mail.com ", "secret123");

    expect(login).toHaveBeenCalledWith({
      email: "tommy@mail.com",
      password: "secret123",
    });
    expect(push).not.toHaveBeenCalled();

    resolveLogin();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/tracker"));
  });

  it("shows the API error and stays on the page when login fails", async () => {
    login.mockRejectedValue(new ApiError(401, "Invalid email or password"));
    render(<AuthPageContent />);

    fillLoginForm("tommy@mail.com", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("explains an unreachable server (CORS or offline)", async () => {
    login.mockRejectedValue(new TypeError("Load failed"));
    render(<AuthPageContent />);

    fillLoginForm("tommy@mail.com", "secret123");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Can't reach the server",
    );
  });

  it("clears the error once the user edits the form", async () => {
    login.mockRejectedValue(new ApiError(401, "Invalid email or password"));
    render(<AuthPageContent />);

    fillLoginForm("tommy@mail.com", "wrong-password");
    await screen.findByRole("alert");

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "another-try" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not call the API when the form is invalid", () => {
    render(<AuthPageContent />);

    fillLoginForm("not-an-email", "");

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("requires 8 characters on register, matching the API", () => {
    searchParams = new URLSearchParams("mode=register");
    render(<AuthPageContent />);

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "short1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /create free account/i }),
    );

    expect(
      screen.getByText("Must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it("sets iOS-friendly attributes on the credential inputs", () => {
    render(<AuthPageContent />);

    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/^password$/i);

    expect(email).toHaveAttribute("autocomplete", "email");
    expect(email).toHaveAttribute("autocapitalize", "none");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).toHaveAttribute("autocorrect", "off");
  });

  it("signs in with Google and redirects to the tracker", async () => {
    loginWithGoogle.mockResolvedValue({
      user: { id: "user-1", email: "tommy@gmail.com", name: "Tommy" },
      accessToken: "access",
      refreshToken: "refresh",
    });
    render(<AuthPageContent />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith("/tracker"));
    expect(loginWithGoogle).toHaveBeenCalledWith({
      credential: "google-id-token",
    });
  });

  it("shows the API error when Google sign-in is rejected", async () => {
    loginWithGoogle.mockRejectedValue(
      new ApiError(401, "Google account email is not verified"),
    );
    render(<AuthPageContent />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Google account email is not verified",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
