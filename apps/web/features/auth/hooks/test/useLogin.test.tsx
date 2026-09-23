import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendOtp, verifyOtp } from "@/api/auth";
import { useAuth } from "@/features/auth/AuthProvider";
import { router } from "@/router";
import { useLogin } from "../useLogin";

vi.mock("@/api/auth", () => ({
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/router", () => ({
  router: {
    invalidate: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useLogin Hook", () => {
  const mockLogin = vi.fn();
  const mockUseAuth: ReturnType<typeof useAuth> = {
    login: mockLogin,
    user: null,
    logout: vi.fn(),
    isAuthenticated: false,
    accessToken: null,
  };
  const email = "Test@mail";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockUseAuth);
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.otpRequested).toBe(false);
    expect(result.current.isSendingOtp).toBe(false);
    expect(result.current.isVerifyingOtp).toBe(false);
  });

  it("should set otpRequested to true when sendOtpMutation succeeds", async () => {
    // vi.mocked(sendOtp).mockResolvedValueOnce({ success: true });
    vi.mocked(sendOtp).mockResolvedValueOnce({
      message: "OTP sent successfully",
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sendOtpMutation(email);
    });

    await waitFor(() => {
      expect(result.current.otpRequested).toBe(true);
    });
    expect(sendOtp).toHaveBeenCalled();

    expect(vi.mocked(sendOtp).mock.calls[0][0]).toEqual(email);
  });

  it("should process verification, login the user, and navigate on verifyOtpMutation success", async () => {
    const response = {
      access_token: "mock-access-token",
      refresh_token: "refresh-token",
    };

    vi.mocked(verifyOtp).mockResolvedValueOnce(response);
    vi.mocked(router.invalidate).mockResolvedValue(undefined);
    mockNavigate.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.verifyOtpMutation({
        email,
        code: "123456",
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        session: {
          accessToken: "mock-access-token",
          refreshToken: "refresh-token",
        },
      });
    });

    expect(router.invalidate).toHaveBeenCalledTimes(1);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/dashboard",
    });
  });
});
