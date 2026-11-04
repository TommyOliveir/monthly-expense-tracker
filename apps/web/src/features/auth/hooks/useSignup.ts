import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthProvider";
import type {
  ISignUpPayload,
  ILoginResponse,
} from "@/features/auth/types/auth";

export function useSignup() {
  const { signup: signupFromContext } = useAuth();

  const {
    mutateAsync: signup,
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
