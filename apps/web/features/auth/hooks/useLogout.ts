import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../AuthProvider";

export function useLogout() {
  const { logout: logoutFromContext } = useAuth();

  const {
    mutate: logout,
    mutateAsync: logoutAsync,
    isPending: isLoggingOut,
    error: logoutError,
  } = useMutation<void, Error, void>({
    mutationFn: () => logoutFromContext(),
  });

  return {
    logout,
    logoutAsync,
    isLoggingOut,
    logoutError,
  };
}
