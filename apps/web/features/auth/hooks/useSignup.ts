import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../AuthProvider";
import type { IUser, ISignUpPayload } from "../types/auth";

export function useSignup() {
  const { signup: signupFromContext } = useAuth();

  const {
    mutate: signup,
    isPending: isSigningUp,
    error: signupError,
    data: signupData,
  } = useMutation<IUser, Error, ISignUpPayload>({
    mutationFn: (payload) => signupFromContext(payload),
  });

  return {
    signup,
    isSigningUp,
    signupError,
    signupData,
  };
}
