"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/components/StatusScreen";
import { APP_START_URL } from "@/features/pwa/appMetadata";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

// Shown in place of a page that throws while rendering. The root layout
// (navbar, providers) stays up, so the user can still move around the app.
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error("Page failed to render:", error);
  }, [error]);

  return (
    <StatusScreen
      icon={<TriangleAlertIcon aria-hidden />}
      title="Something went wrong"
      description="This page ran into a problem. Your saved expenses aren't affected. Try again, or go back to your ledger."
      actions={
        <>
          <Button className="h-10 px-4" onClick={() => retry()}>
            Try again
          </Button>
          <Link
            href={APP_START_URL}
            className={buttonVariants({
              variant: "outline",
              className: "h-10 px-4",
            })}
          >
            Back to your ledger
          </Link>
        </>
      }
    />
  );
}
