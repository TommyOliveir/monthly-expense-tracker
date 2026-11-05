import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GoogleCredentialResponse } from "./types/google";

type InitializeConfig = {
  callback: (response: GoogleCredentialResponse) => void;
};

async function loadModule() {
  // Fresh module per test: it keeps "already initialized" state at module level.
  vi.resetModules();
  return import("./googleIdentity");
}

describe("googleIdentity", () => {
  const initialize = vi.fn<(config: InitializeConfig) => void>();
  const renderButton = vi.fn();

  beforeEach(() => {
    initialize.mockReset();
    renderButton.mockReset();
    window.google = { accounts: { id: { initialize, renderButton } } };
  });

  afterEach(() => {
    delete window.google;
  });

  it("initializes once and renders the button on every call", async () => {
    const { renderGoogleSignInButton } = await loadModule();
    const container = document.createElement("div");

    renderGoogleSignInButton(container, "client-id", "signin_with");
    renderGoogleSignInButton(container, "client-id", "signup_with");

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledTimes(2);
    expect(renderButton).toHaveBeenLastCalledWith(
      container,
      expect.objectContaining({ text: "signup_with", width: 400 }),
    );
  });

  it("forwards the credential to the current listener only", async () => {
    const { renderGoogleSignInButton, setGoogleCredentialListener } =
      await loadModule();
    const listener = vi.fn();

    renderGoogleSignInButton(
      document.createElement("div"),
      "client-id",
      "signin_with",
    );
    const { callback } = initialize.mock.calls[0][0];

    setGoogleCredentialListener(listener);
    callback({ credential: "id-token" });
    expect(listener).toHaveBeenCalledWith("id-token");

    setGoogleCredentialListener(null);
    callback({ credential: "late-token" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("throws when the Google script has not loaded", async () => {
    const { renderGoogleSignInButton } = await loadModule();
    delete window.google;

    expect(() =>
      renderGoogleSignInButton(
        document.createElement("div"),
        "client-id",
        "signin_with",
      ),
    ).toThrow("Google Identity Services script has not loaded");
  });
});
