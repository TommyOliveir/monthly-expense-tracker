import { useMutation } from "@tanstack/react-query";
import { ILoginResponse, LoginPayload } from "@/features/auth/types/auth";
import { useAuth } from "@/features/auth/AuthProvider";

export function useLogin() {
  const { login: loginFromContext } = useAuth();

  // AuthProvider.login already stores the tokens and the user.
  const {
    mutateAsync: login,
    isPending: isLoggingIn,
    error: loginError,
    data: loginData,
  } = useMutation<ILoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => loginFromContext(payload),
  });

  return {
    login,
    isLoggingIn,
    loginError,
    loginData,
  };
}
