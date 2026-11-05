import type { GoogleButtonText } from "./types/google";

export const GOOGLE_IDENTITY_SCRIPT_URL =
  "https://accounts.google.com/gsi/client";

// Google's button can't be wider than 400px.
const MAX_BUTTON_WIDTH = 400;

type CredentialListener = (credential: string) => void;

// GIS should be initialized once per page, but the button can mount several
// times (tab switches, navigation), so the callback forwards to whichever
// button is currently mounted.
let initializedClientId: string | null = null;
let credentialListener: CredentialListener | null = null;

function getGoogleAccountsId() {
  const accountsId = window.google?.accounts.id;
  if (!accountsId) {
    throw new Error("Google Identity Services script has not loaded");
  }
  return accountsId;
}

export function setGoogleCredentialListener(
  listener: CredentialListener | null,
) {
  credentialListener = listener;
}

export function renderGoogleSignInButton(
  container: HTMLElement,
  clientId: string,
  text: GoogleButtonText,
) {
  const accountsId = getGoogleAccountsId();

  if (initializedClientId !== clientId) {
    accountsId.initialize({
      client_id: clientId,
      callback: (response) => credentialListener?.(response.credential),
      ux_mode: "popup",
    });
    initializedClientId = clientId;
  }

  accountsId.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    shape: "pill",
    text,
    logo_alignment: "center",
    width: Math.min(
      container.offsetWidth || MAX_BUTTON_WIDTH,
      MAX_BUTTON_WIDTH,
    ),
  });
}
