export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Google sign-in is hidden when this is unset. Trimmed because a stray
// newline pasted into the hosting dashboard makes Google reject the client.
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || undefined;

// export const API_BASE_URL = "http://localhost:3001";
