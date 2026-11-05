import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthProvider";
import type {
  GoogleLoginPayload,
  ILoginResponse,
} from "@/features/auth/types/auth";

export function useGoogleLogin() {
  const { loginWithGoogle: loginWithGoogleFromContext } = useAuth();

  // AuthProvider.loginWithGoogle already stores the tokens and the user.
  const {
    mutateAsync: loginWithGoogle,
    isPending: isLoggingInWithGoogle,
    error: googleLoginError,
  } = useMutation<ILoginResponse, Error, GoogleLoginPayload>({
    mutationFn: (payload) => loginWithGoogleFromContext(payload),
  });

  return {
    loginWithGoogle,
    isLoggingInWithGoogle,
    googleLoginError,
  };
}
