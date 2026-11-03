import { useMutation } from "@tanstack/react-query";
import { ILoginResponse, LoginPayload } from "@/features/auth/types/auth";
import { useAuth } from "@/features/auth/AuthProvider";

export function useLogin() {
  const { login: loginFromContext } = useAuth();

  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
    data: loginData,
  } = useMutation<ILoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => loginFromContext(payload),
    onSuccess: (data) => {
      // Save access token locally so subsequent requests can use it
      if (data?.accessToken) {
        // localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    },
  });

  return {
    login,
    isLoggingIn,
    loginError,
    loginData,
  };
}
