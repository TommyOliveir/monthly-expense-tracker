import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../AuthProvider";
import type { ISignUpPayload, ILoginResponse } from "../types/auth";

export function useSignup() {
  const { signup: signupFromContext } = useAuth();

  const {
    mutate: signup,
    isPending: isSigningUp,
    error: signupError,
    data: signupData,
  } = useMutation<ILoginResponse, Error, ISignUpPayload>({
    mutationFn: (payload) => signupFromContext(payload),
  });

  return {
    signup,
    isSigningUp,
    signupError,
    signupData,
  };
}
