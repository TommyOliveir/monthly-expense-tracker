"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  GOOGLE_IDENTITY_SCRIPT_URL,
  renderGoogleSignInButton,
  setGoogleCredentialListener,
} from "@/features/auth/googleIdentity";
import type { GoogleButtonText } from "@/features/auth/types/google";

type GoogleSignInButtonProps = {
  clientId: string;
  text: GoogleButtonText;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({
  clientId,
  text,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  // Keep the latest callbacks without re-rendering Google's button on every render.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!isScriptReady || !container) return;

    setGoogleCredentialListener((credential) =>
      onCredentialRef.current(credential),
    );

    try {
      renderGoogleSignInButton(container, clientId, text);
    } catch (error) {
      console.error("Failed to render Google sign-in button:", error);
      onErrorRef.current("Google sign-in is unavailable right now.");
    }

    return () => setGoogleCredentialListener(null);
  }, [isScriptReady, clientId, text]);

  return (
    <>
      <Script
        src={GOOGLE_IDENTITY_SCRIPT_URL}
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
        onError={() =>
          onErrorRef.current(
            "Couldn't load Google sign-in. Check your connection and try again.",
          )
        }
      />
      {/* Fixed height so the card doesn't jump when Google's iframe appears. */}
      <div ref={containerRef} className="flex h-11 w-full justify-center" />
    </>
  );
}
