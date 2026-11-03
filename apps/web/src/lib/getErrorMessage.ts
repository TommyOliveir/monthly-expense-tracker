import { ApiError } from "@/api/client";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return "The server had a problem. Please try again in a moment.";
    }
    return error.message || FALLBACK_MESSAGE;
  }

  // fetch() rejects with a TypeError when the network or server is unreachable.
  if (error instanceof TypeError) {
    return "Can't reach the server. Check your connection and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return FALLBACK_MESSAGE;
}
