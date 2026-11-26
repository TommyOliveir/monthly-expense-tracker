"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/StatusScreen";
import { APP_NAME } from "@/features/pwa/appMetadata";
// global-error replaces the root layout, so it must bring its own styles.
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

// Last resort when the root layout itself (navbar, providers) fails to render.
// Without it Next shows a bare "Application error" page.
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error("App failed to render:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>{`Something went wrong · ${APP_NAME}`}</title>
        <StatusScreen
          icon={<TriangleAlertIcon aria-hidden />}
          title="Something went wrong"
          description="The app couldn't start. Your saved expenses aren't affected. Try again, or reload the app."
          actions={
            <>
              <Button className="h-10 px-4" onClick={() => retry()}>
                Try again
              </Button>
              <Button
                variant="outline"
                className="h-10 px-4"
                // A full reload also re-runs the providers that failed.
                onClick={() => window.location.reload()}
              >
                Reload app
              </Button>
            </>
          }
        />
      </body>
    </html>
  );
}
